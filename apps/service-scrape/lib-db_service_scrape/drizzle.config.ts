import { defineConfig } from 'drizzle-kit'

// Only used for SQL generation
export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
})
