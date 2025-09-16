# New Homie
Web service for analysing Australian house prices - scraped from [Domain](https://www.domain.com.au/). The scraped data is then used to evaluate the "value" of each property.

This readme is targeted towards software developers. For documentation, please visit the website - TBA.

## Architecture
This monorepo is arranged in the following format:
- `.github` - CICD and repo management.
    - `actions` - [Composite actions](https://docs.github.com/en/actions/tutorials/create-actions/create-a-composite-action) to be used in workflows.
    - `workflows` - Define jobs for CICD.
- `apps` - [architectural quantums](https://www.youtube.com/watch?v=pwW6H6UJDWg)
    - `observability` - Grafana LGTM dashboard management and OpenTelemetry library.
    - `service-scrape` - House data webscrape and access.
    - `service-auth` - Authentication lambda authoriser.
    - `service-user` - Manage users.
    - `web` - Web app.
- `infra` - manage infrastructure on AWS using CDK.

## Development
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
