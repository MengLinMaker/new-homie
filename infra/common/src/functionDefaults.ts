import { Architecture, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { type NodejsFunctionProps, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import { ENV as OTEL_ENV } from '@observability/lib-opentelemetry'

export const bundlingOptions = {
    format: OutputFormat.ESM,
    // lines joined to prevent syntax token error
    banner: [
        // Banner to enable dynamic require in esm - https://github.com/evanw/esbuild/issues/1944#issuecomment-1022886747
        `import { createRequire } from 'module'`,
        `const require = createRequire(import.meta.url)`,
        // Banner to enable __filename and __dirname - https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
        `import { fileURLToPath } from 'node:url'`,
        `import { dirname } from 'node:path'`,
        `const __filename = fileURLToPath(import.meta.url)`,
        `const __dirname = dirname(__filename)`,
    ].join(';'),
    // Minify with names for logging purposes
    minify: true,
    keepNames: true,
    // Source map to source code
    sourceMap: true,
}

export const functionDefaults: NodejsFunctionProps = {
    runtime: Runtime.NODEJS_22_X,
    architecture: Architecture.ARM_64,
    // Distributed tracing debugging
    tracing: Tracing.ACTIVE,
    bundling: bundlingOptions,
    environment: {
        NODE_OPTIONS: '--enable-source-maps',
        ...OTEL_ENV,
    },
}
