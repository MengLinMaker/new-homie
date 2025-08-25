import { type Dirent, readFileSync } from 'node:fs'
import { ENV, RESOURCE_FOLDER, walkFolders } from './util.ts'
import createClient from 'openapi-fetch'
import type { paths } from './api/schema'

const client = createClient<paths>({
    baseUrl: ENV.GRAFANA_API,
    headers: { Authorization: `Bearer ${ENV.GRAFANA_API_KEY}` },
})

type ImportFunction = (entry: Dirent<string>) => void

const readJsonFile = (filePath: string) => JSON.parse(readFileSync(filePath).toString())

const importFolder: ImportFunction = async (entry) => {
    const folder = readJsonFile(`${entry.parentPath}/${entry.name}/folder.json`)
    const newFolder = {
        description: '',
        ...folder,
    }

    const updateResult = await client.PUT('/folders/{folder_uid}', {
        params: { path: { folder_uid: folder.uid } },
        body: { overwrite: true, ...newFolder },
    })
    if (updateResult.data) return
    console.error(updateResult.error)

    const importResult = await client.POST('/folders', { body: newFolder })
    if (importResult.data) return
    console.error(importResult.error)

    throw new Error(`folder import failed - ${entry.name}`)
}

const importDashboard: ImportFunction = async (entry) => {
    const newDashboard = {
        dashboard: readJsonFile(`${entry.parentPath}/${entry.name}`),
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
