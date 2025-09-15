import { ATTR_FAAS_TIME } from '@opentelemetry/semantic-conventions/incubating'
import { ILoggable } from './ILoggable.ts'
import { otelException } from './otelException.ts'

export class FunctionHandlerLogger extends ILoggable {
    private timestamp = performance.now()
    private invocationTime = new Date().toISOString()

    public recordException(error: unknown, args?: object) {
        this.LOGGER('info', {
            [ATTR_FAAS_TIME]: this.invocationTime,
            'faas.duration': performance.now() - this.timestamp,
            ...otelException(error),
            'code.function.args': args === undefined ? args : JSON.stringify(args),
        })
        return error
    }

    public recordEnd() {
        this.LOGGER('info', {
            [ATTR_FAAS_TIME]: this.invocationTime,
            'faas.duration': performance.now() - this.timestamp,
        })
    }
}
