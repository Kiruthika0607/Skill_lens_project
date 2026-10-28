# System Limitations & Future Scope

## Current Prototype Scope
1. **Dataset Size**: Configured with a 310-job prototype dataset covering major Tamil Nadu and Indian tech hubs.
2. **Data Provenance**: Live API scrapers are simulated via permitted synthetic seeds labeled as `PROTOTYPE DATA` or `MANUAL IMPORT`.
3. **Database Engine**: Uses zero-config WASM/SQLite with full PostgreSQL schema compatibility. Can be swapped for PostgreSQL in production via `.env` `DATABASE_TYPE=postgres`.

## Future Enhancements
- Integration with live national API job feeds (National Career Service, LinkedIn API).
- Deep learning neural embeddings for extended semantic skill similarity.
