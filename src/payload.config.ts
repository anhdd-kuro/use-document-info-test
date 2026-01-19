import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { s3Plugin } from './plugins/s3'
import { importExportPluginConfig } from './plugins/import-export'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.SERVER_URL || 'http://localhost:3001',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      providers: ['@/test-provider'],
    },
  },
  collections: [Users, Media, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  debug: process.env.NODE_ENV === 'development',

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  // ! ----------------- Jobs Configuration -----------------
  jobs: {
    tasks: [],
    access: {
      run: ({ req }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        const payload = req.payload
        payload.logger.info(`Running job with user: ${JSON.stringify(req.user)}`)
        if (req.user) return true

        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.PAYLOAD_CRON_SECRET}`
      },
    },
    jobsCollectionOverrides: ({ defaultJobsCollection }) => {
      // Make jobs collection visible in admin only in development
      if (!defaultJobsCollection.admin) {
        defaultJobsCollection.admin = {}
      }
      defaultJobsCollection.admin.hidden = false
      defaultJobsCollection.admin.group = 'System'
      return defaultJobsCollection
    },
    // Environment-based autoRun configuration
    autoRun: [
      {
        // Development: Every 5 seconds for immediate feedback
        // Production: Every 30 seconds to reduce DB polling overhead
        cron: process.env.NODE_ENV === 'production' ? '*/30 * * * * *' : '*/5 * * * * *',
        // Development: Process 10 jobs per run
        // Production: Process 50 jobs per run for better throughput
        limit: process.env.NODE_ENV === 'production' ? 100 : 10,
        queue: 'default',
      },
    ],
    // Delete completed jobs to keep database clean
    // Failed jobs are kept automatically for debugging
    deleteJobOnComplete: false,
  },
  plugins: [importExportPluginConfig, s3Plugin],
})
