import { z } from 'zod'
import { config } from 'dotenv'
import { LOG } from './logger.ts'
config()

/**
 * @description Type safe env keys
 * @todo Use SSM Parameter Store
 */
export const ENV = {
    /**
     * @description Postgres connection url with password
     */
    POSTGRES_URL: z
        .string()
        .regex(/postgresql:\/\/\w+:\w+@[\w-.:]+\/\w+((\?)(\w+=\w+)+)?/, {
            message: 'POSTGRES_URL is invalid',
        })
        .default('postgresql://user:password@localhost:54320/db')
        .parse(process.env['POSTGRES_URL']),
}
if (!process.env['POSTGRES_URL'])
    LOG.warn(
        'POSTGRES_URL undefined - defaulting to "postgresql://user:password@localhost:54320/db"',
    )
