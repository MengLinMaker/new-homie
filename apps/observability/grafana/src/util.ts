/** biome-ignore-all lint/complexity/useLiteralKeys: <All env variables can be potentially accessed> */
import { z } from 'zod'
import { config } from 'dotenv'
import path from 'node:path'
import { type Dirent, readdirSync } from 'node:fs'
config()

/**
 * @description Type safe env keys
 */
export const ENV = {
    /**
     * @description For deploying dashboards to Grafana
     * @default 'http://localhost:3000/api' - Locally hosted Grafana LGTM
     */
    GRAFANA_API: z
        .string()
        .regex(/https?:\/\/.+\/api/)
        .default('http://localhost:3000/api')
        .parse(process.env['GRAFANA_API']),

    GRAFANA_API_KEY: z.string().default('').parse(process.env['GRAFANA_API_KEY']),
}

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
        if (entry.isDirectory())
            walkFolders(path.join(rootFolderPath, entry.name), visitorFunc, entry.name)
    }
}
