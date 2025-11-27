import esbuild from 'esbuild'

/**
 * Banners to make cjs work in esm
 */
export const esbuildBanner = [
    // Banner to enable dynamic require in esm - https://github.com/evanw/esbuild/issues/1944#issuecomment-1022886747
    `import { createRequire } from 'module'`,
    `const require = createRequire(import.meta.url)`,
    // Banner to enable __filename and __dirname - https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
    // `import { fileURLToPath } from 'node:url'`,
    // `import { dirname } from 'node:path'`,
    // `const __filename = fileURLToPath(import.meta.url)`,
    // `const __dirname = dirname(__filename)`,
].join(';')

esbuild
    .build({
        entryPoints: ['src/index.ts'],
        outfile: 'dist/index.js',
        format: 'esm',
        // lines joined to prevent syntax token error
        banner: { js: esbuildBanner },
        minify: false,
        keepNames: true,
        // Source map to source code
        sourcemap: true,
        // Single file output with dependencies bundled
        bundle: true,
        treeShaking: true,
        // Target node
        platform: 'node',
        target: 'node22',
    })
    .catch(() => process.exit(1))
