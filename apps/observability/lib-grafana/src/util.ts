import path from 'node:path'
import { type Dirent, readdirSync, readFileSync } from 'node:fs'
import createClient from 'openapi-fetch'
import type { paths } from './api/schema'
import { ENV } from './env.ts'

export const RESOURCE_FOLDER = path.join(`${import.meta.dirname}/../resource`)

/**
 * @description Recursively walk through folders and files
 * @param folderPathList - Start with single element array of root folder path
 * @param visitorFunc - Function to be called for each file and folder
 */
export const walkFolders = async (
    rootFolderPath: string,
    visitorFunc: (entry: Dirent<string>) => void,
) => {
    const entries = readdirSync(rootFolderPath, { withFileTypes: true })
    for (const entry of entries) {
        await visitorFunc(entry)
        if (entry.isDirectory()) walkFolders(path.join(rootFolderPath, entry.name), visitorFunc)
    }
}

export const client = createClient<paths>({
    baseUrl: ENV.GRAFANA_API,
    headers: { Authorization: `Bearer ${ENV.GRAFANA_API_KEY}` },
})

export const readJsonFile = (filePath: string) => JSON.parse(readFileSync(filePath).toString())
