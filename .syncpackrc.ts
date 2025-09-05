export default {
    versionGroups: [
        {
            dependencies: ['nx', 'puppeteer-core', '@sparticuz/chromium-min'],
            isIgnored: true,
        },
    ],
} satisfies import('syncpack').RcFile
