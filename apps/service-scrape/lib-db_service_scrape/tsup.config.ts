import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts', 'src/dev/index.ts', 'src/migration/*.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    // Don't bundle dependency due to import error
    external: ['ssh2'],
})
