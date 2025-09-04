import { build } from 'esbuild'
import { rmSync } from 'node:fs'

try {
    rmSync('dist', { recursive: true })
} catch {}

await build({
    entryPoints: ['./src/index.mts'],
    outfile: 'dist/index.js',
    // lines joined to prevent syntax token error
    banner: {
        js: [
            // Banner to enable dynamic require in esm - https://github.com/evanw/esbuild/issues/1944#issuecomment-1022886747
            `import { createRequire } from 'module'`,
            `const require = createRequire(import.meta.url)`,
            // Banner to enable __filename and __dirname - https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
            `import { fileURLToPath } from 'node:url'`,
            `import { dirname } from 'node:path'`,
            `const __filename = fileURLToPath(import.meta.url)`,
            `const __dirname = dirname(__filename)`,
        ].join(';'),
    },
    format: 'esm',
    platform: 'node',
    bundle: true,
    minify: true,
    // Sourcemap for logging purposes
    sourcemap: 'external',
})
