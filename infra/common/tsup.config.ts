import { defineConfig } from 'tsup'
import { bundlingOptions } from './src/functionDefaults'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    banner: {
        js: bundlingOptions.banner,
    },
    dts: true,
    sourcemap: false,
    clean: true,
})
