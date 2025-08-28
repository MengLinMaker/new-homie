import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda'
import {
    type NodejsFunctionProps,
    OutputFormat,
    type BundlingOptions,
} from 'aws-cdk-lib/aws-lambda-nodejs'

/**
 * Enable sourcemap
 */
export const NODE_OPTIONS = '--enable-source-maps'

/**
 * Defaults for bundling
 */
const bundling: BundlingOptions = {
    format: OutputFormat.ESM,
    // Banner to fix esbuild dynamic require bug - https://github.com/evanw/esbuild/issues/1944#issuecomment-1022886747
    banner: `import { createRequire } from 'module'; const require = createRequire(import.meta.url)`,
    // Minify with names for logging purposes
    minify: true,
    keepNames: true,
    // Source map to source code
    sourceMap: true,
    externalModules: ['@aws-sdk/*', 'aws-sdk'],
}

export const functionDefaults: NodejsFunctionProps = {
    runtime: Runtime.NODEJS_22_X,
    architecture: Architecture.ARM_64,
    bundling,
}
