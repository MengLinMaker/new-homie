import type z from 'zod'

// biome-ignore lint/suspicious/noExplicitAny: <any schema>
export const parseEnvSchema = <T extends z.ZodObject<any>>(envSchema: T) => {
    const envInput: { [key: string]: string | undefined } = {}
    for (const envKey of Object.keys(envSchema.shape)) {
        envInput[envKey] = process.env[envKey]
    }
    return envSchema.parse(envInput)
}
