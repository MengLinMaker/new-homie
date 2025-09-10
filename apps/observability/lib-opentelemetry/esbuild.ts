import esbuild from 'esbuild'

esbuild.build({
    entryPoints: ['./src/pino_opentelemetry_transport.ts'],
    outfile: '../layer-pino_opentelemetry_transport/nodejs/pino_opentelemetry_transport.cjs',
    treeShaking: true,
    bundle: true,
    minify: false,
    keepNames: true,
    platform: 'node',
})
