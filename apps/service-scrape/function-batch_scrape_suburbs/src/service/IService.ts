import type { Logger } from 'pino'

export class IService {
    readonly LOGGER

    constructor(logger: Logger) {
        this.LOGGER = logger
    }
}
