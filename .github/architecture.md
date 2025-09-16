# Github setup

## Architecture
### CICDC cache
Nx is used to determine which packages to test, reducing CI time. Cache should match closest job name, then base SHA, then PR number, finally run id.

Cache needs to be recreated on main branch.

### CICD composite actions
Workflows are build upon these [composite actions](https://docs.github.com/en/actions/tutorials/create-actions/create-a-composite-action):
- `setup-ci` - Prepare job in CI workflow.
- `setup-cd` - Prepare job in CD workflow.

### CICD workflows
- `ci` - Runs a bunch of tests with Nx in parallel.
    - `test-fast` - Runs affected unit tests, including linting.
    - `test-functions` - Runs affected tests on function packages.
    - `test-cdk` - Deploys development infrastructure for testing.
- `cd` - Deploys all infrastructure in parallel.
    - `deploy-observability` - Deploys dashboards to grafana cloud.
    - `deploy-cdk` - Deploys cdk infrastructure to AWS.
