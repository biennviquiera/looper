import express from 'express'
import multer from 'multer'
import cors from 'cors'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs, { createReadStream } from 'fs'
import rateLimit from 'express-rate-limit'
import https from 'https'
import 'dotenv/config'
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// Rate Limit settings
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 50,
  message: JSON.stringify({ message: 'Too many requests. Try again later.' })
})

// Create S3 service object
const s3Client = new S3Client({ region: process.env.region })

const app = express()

const key = fs.readFileSync(__dirname + 'ssl.key', 'utf-8')
const cert = fs.readFileSync(__dirname + 'ssl.cert', 'utf-8')

const parameters = {
  key,
  cert
}

app.use(cors())

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, './uploads/')
  },
  filename: function (request, file, callback) {
    console.log(file)
    callback(null, file.originalname)
  }
})
const maxSize = 10 * 1024 * 1024

const upload = multer({ storage, limits: { fileSize: maxSize } })
const port = process.env.PORT || 3001

const server = https.createServer(parameters, app)
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

const processFile = (currentFile, outputPath, startTime, endTime) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(currentFile.path)
      .inputOptions(['-ss ' + startTime, '-to ' + endTime])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}

const loopFile = (outputPath, loopedPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(outputPath)
      .inputOptions('-stream_loop -1')
      .outputOptions('-t 60')
      .output(loopedPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })
}

server.post('/api/loop', limiter, upload.single('myFile'), (req, res) => {
  // console.log(req.body) // form fields
  // console.log(req.file) // form file

  const currentFile = req.file
  const startTime = req.body.startTime
  const endTime = req.body.endTime

  const outputPath = 'uploads/trimmed_' + currentFile.filename
  const loopedPath = 'uploads/looped_' + currentFile.filename
  processFile(currentFile, outputPath, startTime, endTime)
    .then(() => {
      console.log('File trimming finished')
      return loopFile(outputPath, loopedPath)
    })
    .then(() => {
      console.log('File looping finished')
      const params = {
        Bucket: process.env.BUCKET,
        Key: loopedPath.split('/').pop(),
        Body: createReadStream(loopedPath)
      }
      return s3Client.send(new PutObjectCommand(params))
    }).then(async (output) => {
      console.log('File uploaded to S3:', output)
      // Clean up intermediary files
      fs.unlink(currentFile.path, err => {
        if (err) console.error('Error deleting original file:', err)
        else console.log('Original file deleted')
      })
      fs.unlink(outputPath, err => {
        if (err) console.error('Error deleting trimmed file:', err)
        else console.log('Trimmed file deleted')
      })
      fs.unlink(loopedPath, err => {
        if (err) console.error('Error deleting trimmed file:', err)
        else console.log('Local looped file deleted')
      })

      // Create download link
      const downloadParams = {
        Bucket: process.env.BUCKET,
        Key: loopedPath.split('/').pop(),
        Expires: 60 * 5
      }
      const url = await getSignedUrl(s3Client, new GetObjectCommand(downloadParams))
      res.status(200).json({ message: 'File uploaded successfully', downloadUrl: url })
    })
    .catch((err) => {
      console.error(err)
      if (!res.headersSent) {
        res.status(500).send('Error during processing')
      }
    })
})

app.post('/login', function (req, res) {
  console.log('test')
  res.status(200).json({
    status: 'success',
    timestamp: Date.now()
  })
  res.end() // end the response
})
