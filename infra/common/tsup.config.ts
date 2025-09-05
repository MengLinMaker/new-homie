import { defineConfig } from 'tsup'
import { esbuildBanner } from './src/functionDefaults'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    banner: {
        js: esbuildBanner,
    },
    dts: true,
    sourcemap: true,
    clean: true,
})
