import { defineConfig } from 'drizzle-kit'
import { ENV } from './env'

// Only used for testing
export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: ENV.TEST_POSTGRES_URL,
  },
})
