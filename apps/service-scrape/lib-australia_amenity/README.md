# @service-scrape/lib-australia_amenity
These scripts are mainly used for transforming raw data. The exported json can be injested into production database.

### Input data format
Install the [brotli](https://github.com/google/brotli) tool to compress data:
```bash
brew install brotli
```

Ideally input format is a brotli compressed json file:
```bash
brotli -9 ./script/INPUT_DATA_FILE
```

Decompress data like this:
```bash
brotli -d ./script/COMPRESSED_BROTLI_FILE
```

### Data sources:
Sources are documented in `compress.ts`.
