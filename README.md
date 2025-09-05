# New Homie
Web service for analysing Australian house prices.

### Development
This monorepo is arranged in the following format:
- `apps` - [architectural quantums](https://www.youtube.com/watch?v=pwW6H6UJDWg)
    - `observability` - Grafana LGTM dashboard management
    - `service-scrape` - House data webscrape and access
    - `service-auth` - Authentication lambda authoriser
    - `service-user` - Manage users
    - `web` - Browser frontend

Install using pnpm only - git hooks should auto configure:
```bash
pnpm i
```

Spin up docker for development:
```bash
pnpm docker:up
```

Or spin down docker:
```bash
pnpm docker:down
```

Detect stale code:
```bash
pnpm knip
```

Upgrade all dependencies:
```bash
pnpm bump
```

Visualise local package dependency:
```bash
pnpm graph
```
