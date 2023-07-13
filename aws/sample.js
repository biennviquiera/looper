// Import required AWS SDK clients and commands for Node.js.
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from './aws_test.js'

// Set the parameters
const params = {
  Bucket: 'looper-bucket', // The name of the bucket. For example, 'sample-bucket-101'.
  Key: 'bruh.txt', // The name of the object. For example, 'sample_upload.txt'.
  Body: 'hello bruh' // The content of the object. For example, 'Hello world!".
}

const run = async () => {
  // Create an object and upload it to the Amazon S3 bucket.
  try {
    const results = await s3Client.send(new PutObjectCommand(params))
    console.log(
      'Successfully created ' +
        params.Key +
        ' and uploaded it to ' +
        params.Bucket +
        '/' +
        params.Key
    )
    return results // For unit tests.
  } catch (err) {
    console.log('Error', err)
  }
}
run()
