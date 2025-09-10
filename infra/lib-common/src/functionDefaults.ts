import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import { type NodejsFunctionProps, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import { ENV as OTEL_ENV } from '@observability/lib-opentelemetry'

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

export const functionDefaults = {
    runtime: Runtime.NODEJS_22_X,
    architecture: Architecture.ARM_64,
    // Distributed tracing debugging
    // tracing: Tracing.ACTIVE,
    bundling: {
        format: OutputFormat.ESM,
        // lines joined to prevent syntax token error
        banner: esbuildBanner,
        // Minify with names for logging purposes
        minify: false,
        keepNames: true,
        // Source map to source code
        // sourceMap: true,
        externalModules: ['pino-opentelemetry-transport'],
    },
    environment: {
        // NODE_OPTIONS: '--enable-source-maps',
        ...OTEL_ENV,
    },
} satisfies NodejsFunctionProps
