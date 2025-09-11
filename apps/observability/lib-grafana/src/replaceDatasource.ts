// biome-ignore-all lint/suspicious/noExplicitAny: <actually is any type>
type DataSource = {
    type?: string
    uid: string
}

export class DashboardModifier {
    /**
     * Traverses through dashboard json to replace "datasource"
     * @param dbChunk - chunk of dashboard
     * @param replace - specify datasources to replace
     * @returns output - modified dashboard chunk
     * @returns match - replaced datasource, no longer need to check
     */
    private _replaceDatasource(
        dbChunk: any,
        replace: Array<{
            oldJson: string
            new: DataSource
        }>,
    ): { output: any; match: boolean } {
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
                    const { output, match } = this._replaceDatasource(
                        smallDbChunk as never,
                        replace,
                    )
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
                const { output, match } = this._replaceDatasource(smallDbChunk, replace)
                overallMatch = overallMatch || match
                newDbChunk[key] = output
            }
        }

        // Delay checking of replacements to maximise function performance
        if (!overallMatch) {
            const jsonDbChunk = JSON.stringify(dbChunk)
            for (const replacement of replace) {
                // TODO: Stringify once for 20% more performance
                if (jsonDbChunk === replacement.oldJson) {
                    return { output: replacement.new, match: true }
                }
            }
        }

        return { output: newDbChunk, match: overallMatch }
    }

    /**
     * Traverses through dashboard json to replace "datasource"
     * @param dashboard
     * @param replace - specify datasources to replace
     */
    replaceDatasource(
        dashboard: any,
        replacements: Array<{
            old: DataSource
            new: DataSource
        }>,
    ) {
        // Precalculate for performance
        const replace = replacements.map((r) => ({
            oldJson: JSON.stringify(r.old),
            new: r.new,
        }))
        return this._replaceDatasource(dashboard, replace).output
    }
}
