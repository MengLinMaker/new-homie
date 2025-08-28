import { client, RESOURCE_FOLDER } from './util.ts'
import type { components } from './api/schema'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type FolderUidToPath = { [k: string]: string }

const exportFolders = async () => {
    const folderUidToChildren: {
        [k: string]: components['schemas']['FolderSearchHit'][]
    } = {}

    const folders = await client.GET('/search', {
        params: { query: { type: 'dash-folder' } },
    })

    // biome-ignore lint/style/noNonNullAssertion: <request should not fail>
    for (const { uid } of folders.data!) {
        const folder = await client.GET('/folders/{folder_uid}', {
            params: { path: { folder_uid: uid } },
        })

        // biome-ignore lint/style/noNonNullAssertion: <request should not fail>
        const newFolder = folder.data!
        const parentUid = newFolder.parentUid ?? ''

        if (folderUidToChildren[parentUid]) folderUidToChildren[parentUid].push(newFolder)
        else folderUidToChildren[parentUid] = [newFolder]
    }

    const folderUidToPath: FolderUidToPath = {}

    const dfsWriteFolder = (writePath: string = RESOURCE_FOLDER, parentUid: string = '') => {
        if (!folderUidToChildren[parentUid]) return
        for (const insertFolder of folderUidToChildren[parentUid]) {
            const newWritePath = path.join(writePath, insertFolder.title)
            mkdirSync(newWritePath, { recursive: true })
            writeFileSync(`${newWritePath}/folder.json`, JSON.stringify(insertFolder))
            folderUidToPath[insertFolder.uid] = newWritePath
            dfsWriteFolder(newWritePath, insertFolder.uid)
        }
    }
    dfsWriteFolder()

    return folderUidToPath
}

const exportDashboards = async (folderUidToPath: FolderUidToPath) => {
    const dashboardSummaries = await client.GET('/search', {
        params: { query: { type: 'dash-db' } },
    })

    // biome-ignore lint/style/noNonNullAssertion: <request should not fail>
    for (const { title, uid } of dashboardSummaries.data!) {
        const dashboardResult = await client.GET('/dashboards/uid/{uid}', {
            params: { path: { uid } },
        })
        // biome-ignore lint/style/noNonNullAssertion: <request should not fail>
        const { meta, dashboard } = dashboardResult.data!

        // Provisioned dashboards cannot be modified through API
        if (meta.provisioned) continue

        // Defined id prevents import
        // biome-ignore lint/complexity/useLiteralKeys: <expected to exist>
        delete dashboard['id']
        writeFileSync(`${folderUidToPath[meta.folderUid]}/${title}.json`, JSON.stringify(dashboard))
    }
}

// Resource folder should be cleaned before export
mkdirSync(RESOURCE_FOLDER, { recursive: true })
rmSync(RESOURCE_FOLDER, { recursive: true })

// Export folders first so dashboards can be saved
const folderUidToPath = await exportFolders()
await exportDashboards(folderUidToPath)
