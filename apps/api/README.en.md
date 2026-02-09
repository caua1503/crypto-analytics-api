# API

This module is the main entry point for the **Crypto Analytics** ecosystem, providing a RESTful interface to access processed analytics and data.

## Role in the Project

The `api` unit acts as the interface layer between the analysis core and external consumers. Its main responsibilities include:

- **Endpoint Exposure**: Provides routes for querying asset scores, macro data, and market sentiment.
- **Data Validation**: Uses **Zod** to ensure that data inputs (queries, params, body) are correct before processing.
- **Automated Documentation**: Generates an interactive Swagger interface to facilitate integration by other developers.
- **Performance**: Implemented with **Fastify**, ensuring low overhead and high throughput.

## Key Technologies

- **Fastify**: High-performance web framework.
- **Zod**: Data validation.
- **Swagger (OpenAPI)**: Live documentation at `/docs`.

## Folder Structure

- `/src/routers`: Definition of API routes and versions (v1, etc).
- `/src/core`: API-specific orchestration logic.
- `/src/config`: Environment configurations and constants.

## How to Start

### Development

```bash
bun run dev
```

The server will start at `http://localhost:3333` (or the port configured in your `.env`).

### Documentation

Access `http://localhost:3333/docs` to view and test the available endpoints via Swagger UI.
