// Load the AWS SDK for Node.js
import { S3Client } from '@aws-sdk/client-s3'
import 'dotenv/config'

// Create S3 service object
const s3Client = new S3Client({ region: 'us-west-1' })

export { s3Client }
