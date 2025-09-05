# Github setup

### CICD pipeline
Workflows are build upon these [composite actions](https://docs.github.com/en/actions/tutorials/create-actions/create-a-composite-action):
- `setup-ci` - Prepare job in CI workflow
- `setup-cd` - Prepare job in CD workflow

Nx is used to determine which packages to test, reducing CI time.

Workflows:
- `ci` - runs a bunch of tests with Nx in parallel
    - `test-unit` - runs affected unit tests, including linting
    - `test-integration` - runs affected integration tests
- `cd` - deploys all infrastructure in parallel
    - `deploy-observability` - deploys dashboards to grafana cloud
    - `deploy-cdk` - deploys cdk infrastructure to AWS
