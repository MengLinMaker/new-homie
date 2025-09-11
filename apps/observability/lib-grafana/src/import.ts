import type { Dirent } from 'node:fs'
import { client, readJsonFile, RESOURCE_FOLDER, walkFolders } from './util.ts'

type ImportFunction = (entry: Dirent<string>) => void

const importFolder: ImportFunction = async (entry) => {
    const folder = readJsonFile(`${entry.parentPath}/${entry.name}/folder.json`)
    const newFolder = {
        description: '',
        overwrite: true,
        ...folder,
    }

    const updateResult = await client.PUT('/folders/{folder_uid}', {
        params: { path: { folder_uid: folder.uid } },
        body: newFolder as never,
    })
    if (updateResult.data) return
    console.error(updateResult.error)

    const importResult = await client.POST('/folders', { body: newFolder })
    if (importResult.data) return
    console.error(importResult.error)

    throw new Error(`folder import failed - ${entry.name}`)
}

type DataSource = {
    type?: string
    uid: string
}

type ReplacementSources = Array<{
    old: DataSource
    new: DataSource
}>

// biome-ignore lint/suspicious/noExplicitAny: <actually is any type>
const replaceDatasource = (dbChunk: any, replace: ReplacementSources): any => {
    // do not process primitives
    if (typeof dbChunk === 'boolean') return dbChunk
    if (typeof dbChunk === 'number') return dbChunk
    if (typeof dbChunk === 'undefined') return dbChunk
    if (typeof dbChunk === 'string') return dbChunk

    if (Array.isArray(dbChunk)) {
        const newDbChunk = []
        for (const smallDbChunk of dbChunk) {
            if (smallDbChunk) newDbChunk.push(replaceDatasource(smallDbChunk as never, replace))
        }
        return newDbChunk
    }

    for (const replacement of replace) {
        if (JSON.stringify(dbChunk) === JSON.stringify(replacement.old)) {
            return replacement.new
        }
    }
    const newDbChunk: typeof dbChunk = {}
    if (typeof dbChunk === 'object') {
        for (const [key, smallDbChunk] of Object.entries(dbChunk)) {
            newDbChunk[key] = replaceDatasource(smallDbChunk, replace)
        }
    }
    return newDbChunk
}

const importDashboard: ImportFunction = async (entry) => {
    const rawDashboard = readJsonFile(`${entry.parentPath}/${entry.name}`)
    const newDashboard = {
        // Update datasources
        dashboard: replaceDatasource(rawDashboard, [
            {
                old: { uid: 'loki' },
                new: { type: 'loki', uid: 'grafanacloud-logs' },
            },
        ]),
        folderUid: readJsonFile(`${entry.parentPath}/folder.json`).uid,
        overwrite: true,
    }

    const updateResult = await client.POST('/dashboards/db', { body: newDashboard as never })
    if (updateResult.data) return
    console.error(updateResult.error)

    const importResult = await client.POST('/dashboards/import', { body: newDashboard as never })
    if (importResult.data) return
    console.error(updateResult.error)

    throw Error(`dashboard import failed - ${entry.name}`)
}

await walkFolders(RESOURCE_FOLDER, async (entry) => {
    if (entry.isDirectory()) await importFolder(entry)
    else if (entry.isFile() && entry.name !== 'folder.json') await importDashboard(entry)
})
