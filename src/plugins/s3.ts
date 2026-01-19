import { s3Storage } from '@payloadcms/storage-s3'

const s3Credentials =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined

export const s3Plugin = s3Storage({
  enabled: true,
  signedDownloads: {
    shouldUseSignedURL: () => true,
    expiresIn: 5 * 60, // 5 minutes
  },
  collections: {
    media: { prefix: 'media' },
    imports: { prefix: 'imports' },
    exports: { prefix: 'exports' },
  },
  bucket: process.env.AWS_S3_BUCKET || '',
  config: {
    // Uses default credential provider chain (ECS task role in production)
    region: process.env.AWS_REGION || '',
    credentials: s3Credentials,
  },
})
