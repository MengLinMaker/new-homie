import { defineConfig } from 'drizzle-kit'
import { ENV } from './env'

// Only used for database migration
export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: ENV.POSTGRES_URL,
  },
})
