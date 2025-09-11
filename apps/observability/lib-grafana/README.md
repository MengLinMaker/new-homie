# @observability/grafana
This package imports and exports Grafana dashboards and folders as json for reproduceability. This approach should worth with clickops.

Although IAC tools exists for generating Grafana dashboards, a WYSIWYG approach is less prone to mistakes and faster to modify.

### Secrets
This is required for production
- `GRAFANA_API` - Grafana '/api' url
- `GRAFANA_API_KEY` - Grafana key bearer token

### Export folders and dashboards
Will clear and write config as json in the './resource' folder:
```bash
pnpm grafana:export
```

### Import folders and dashboards
Will update or import new folders and dashboards:
```bash
pnpm grafana:import
```
_NOTE: importing will not delete unspecified dashboards or folders - for safety reasons_
