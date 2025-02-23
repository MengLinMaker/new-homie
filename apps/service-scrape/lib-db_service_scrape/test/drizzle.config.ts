import { defineConfig } from 'drizzle-kit'

export const TEST_POSTGRES_URL = 'postgresql://user:password@localhost:54320/db'

export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: TEST_POSTGRES_URL,
  },
})
