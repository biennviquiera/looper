import express from 'express'
import multer from 'multer'
import cors from 'cors'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import AWS from 'aws-sdk'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const app = express()
// eslint-disable-next-line no-unused-vars
const s3 = new AWS.S3()

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

const upload = multer({ storage })

const port = process.env.PORT || 3001
app.listen(port, () => {
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

app.post('/api/loop', upload.single('myFile'), (req, res) => {
  // console.log(req.body) // form fields
  // console.log(req.file) // form file

  const currentFile = req.file
  const startTime = req.body.startTime
  const endTime = req.body.endTime

  console.log('Output: ' + startTime + endTime)

  const outputPath = 'uploads/trimmed_' + currentFile.filename
  const loopedPath = 'uploads/looped_' + currentFile.filename

  processFile(currentFile, outputPath, startTime, endTime)
    .then(() => {
      console.log('File trimming finished')
      return loopFile(outputPath, loopedPath)
    })
    .then(() => {
      console.log('File looping finished')
      res.status(200).send('File successfully looped!')
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
