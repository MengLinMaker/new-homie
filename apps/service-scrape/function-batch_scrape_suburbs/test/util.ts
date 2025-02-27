import { readFileSync } from 'node:fs'

export const parseJsonFile = (path: string) => JSON.parse(readFileSync(path).toString())
