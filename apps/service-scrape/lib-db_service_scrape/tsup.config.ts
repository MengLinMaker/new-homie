import { defineConfig } from 'tsup'

export default defineConfig({
    // Don't bundle dependency due to import error
    external: ['ssh2'],
})
