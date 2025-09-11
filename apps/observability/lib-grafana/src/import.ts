import type { Dirent } from 'node:fs'
import { client, readJsonFile, RESOURCE_FOLDER, walkFolders } from './util.ts'
import { DashboardModifier } from './replaceDatasource.ts'

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

const importDashboard: ImportFunction = async (entry) => {
    const dashboardModifier = new DashboardModifier()
    const rawDashboard = readJsonFile(`${entry.parentPath}/${entry.name}`)
    const newDashboard = {
        // Update datasources
        dashboard: dashboardModifier.replaceDatasource(rawDashboard, [
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
