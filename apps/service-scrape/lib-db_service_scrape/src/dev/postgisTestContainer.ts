import { AbstractStartedContainer, GenericContainer, Wait } from 'testcontainers'
import { LOG } from './log.ts'

// Globals for postgres setup - shouldn't require any changing
const POSTGRES_PORT = 5432
const POSTGRES_DB = 'db'
const POSTGRES_USER = 'user'
const POSTGRES_PASSWORD = 'password'

/**
 * Interact with Postgis container
 * @method getConnectionUri
 * @method stop
 */
export class StartedPostgisContainer extends AbstractStartedContainer {
    public getConnectionUri() {
        const url = new URL('', 'postgresql://')
        url.hostname = this.getHost()
        url.port = this.getMappedPort(POSTGRES_PORT).toString()
        url.pathname = POSTGRES_DB
        url.username = POSTGRES_USER
        url.password = POSTGRES_PASSWORD
        return url.toString()
    }
}

export const postgisTestContainer = async () => {
    LOG.debug('Building postgis docker image for "service-scrape"')
    /**
     * Use same image for all "service-scrape" sub packages
     * Build custom image according to - https://node.testcontainers.org/features/images/
     */
    const image = await GenericContainer.fromDockerfile('../', 'postgis.dockerfile').build(
        'lib-db_service_scrape',
        { deleteOnExit: false },
    )
    LOG.debug('Booting postgis container for "service-scrape"')
    /**
     * Create container and wait until it is ready
     * Current configuration refer to - https://github.com/testcontainers/testcontainers-node/blob/main/packages/modules/postgresql/src/postgresql-container.ts
     */
    const container = await image
        .withEnvironment({
            POSTGRES_DB,
            POSTGRES_USER,
            POSTGRES_PASSWORD,
        })
        .withExposedPorts(POSTGRES_PORT)
        .withHealthCheck({
            test: [
                'CMD-SHELL',
                `PGPASSWORD=${POSTGRES_PASSWORD} pg_isready --host localhost --username ${POSTGRES_USER} --dbname ${POSTGRES_DB}`,
            ],
            interval: 250,
            timeout: 1000,
            retries: 1000,
        })
        .withWaitStrategy(Wait.forAll([Wait.forHealthCheck(), Wait.forListeningPorts()]))
        .withStartupTimeout(300000)
        .start()
    LOG.debug('Postgis container for "service-scrape" is ready')
    return new StartedPostgisContainer(container)
}
