type DataSource = {
    type?: string
    uid: string
}

type ReplacementSources = Array<{
    old: DataSource
    new: DataSource
}>

/**
 * Traverses through dashboard json to replace "datasource"
 * @param dbChunk - chunk of dashboard
 * @param replace - specify datasources to replace
 * @returns
 */
export const replaceDatasource = (
    // biome-ignore lint/suspicious/noExplicitAny: <actually is any type>
    dbChunk: any,
    replace: ReplacementSources,
    // biome-ignore lint/suspicious/noExplicitAny: <actually is any type>
): { output: any; match: boolean } => {
    // do not process primitives
    if (typeof dbChunk === 'boolean') return { output: dbChunk, match: false }
    if (typeof dbChunk === 'number') return { output: dbChunk, match: false }
    if (typeof dbChunk === 'undefined') return { output: dbChunk, match: false }
    if (typeof dbChunk === 'string') return { output: dbChunk, match: false }

    if (Array.isArray(dbChunk)) {
        const newDbChunk = []
        let overallMatch = false
        for (const smallDbChunk of dbChunk) {
            if (smallDbChunk) {
                const { output, match } = replaceDatasource(smallDbChunk as never, replace)
                overallMatch = overallMatch || match
                newDbChunk.push(output)
            }
        }
        return { output: newDbChunk, match: overallMatch }
    }

    const newDbChunk: typeof dbChunk = {}
    let overallMatch = false
    if (typeof dbChunk === 'object') {
        for (const [key, smallDbChunk] of Object.entries(dbChunk)) {
            const { output, match } = replaceDatasource(smallDbChunk, replace)
            overallMatch = overallMatch || match
            newDbChunk[key] = output
        }
    }

    // Delay checking of replacements to maximise function performance
    // TODO: improve performance with caching
    if (!overallMatch)
        for (const replacement of replace) {
            if (JSON.stringify(dbChunk) === JSON.stringify(replacement.old)) {
                return { output: replacement.new, match: true }
            }
        }

    return { output: newDbChunk, match: overallMatch }
}
