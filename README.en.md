# Crypto Analytics API
📖 Leia esta documentação em [Portuguese](README.md)

<p align="center">
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://fastify.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify">
  </a>
  <a href="https://www.docker.com/" target="_blank">
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  </a>
  <a href="https://redis.io/" target="_blank">
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  </a>
  <a href="https://www.postgresql.org/" target="_blank">
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  </a>
  <a href="https://www.prisma.io/" target="_blank">
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
  </a>
  <a href="https://biomejs.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Biome-60a5fa?style=for-the-badge&logo=biome&logoColor=white" alt="Biome">
  </a>
</p>

<p align="center">
  <i>A cryptocurrency analytics API that combines technical indicators, market sentiment, and macroeconomic data to generate objective, data-driven investment recommendations.</i>
</p>

---

## Overview

**Crypto Analytics API** is a backend API designed to process and analyze real-time cryptocurrency market data.

It integrates multiple data sources to generate a **composite score** and an **automated investment recommendation**, focusing on cold, objective decisions. The main goal is to help identify:

- Entry points (buy) during excessive market panic
- Exit points (sell) during irrational euphoria

---

## Technologies Used

- **Bun** — A modern and extremely fast JavaScript runtime, with integrated bundler, test runner, and package manager.
- **TypeScript** — Static typing and greater business logic safety
- **Fastify** — High-performance, low-overhead web framework
- **Redis** — Distributed cache for fast storage of processed data
- **Docker** — Standardized dev, test, and production environments
- **PostgreSQL** — Robust relational database
- **Prisma** — Modern TypeScript ORM
- **Biome** — Fast linter and formatter

> Other dependencies and implementation details are documented in the specific module READMEs.

---

## Key Differentiators

### Intelligent Processing Engine

Unlike APIs that only aggregate or forward raw data, this application has its own **business logic** that turns information into actionable insights.

### Data Aggregation

- Simultaneous consumption from multiple external sources:
  - Real-time prices
  - Market sentiment metrics
  - Macroeconomic indicators

### Weighted Score Calculation (Adjustable)

The final score is calculated with specific weights for each dimension:

| Dimension     | Weight | Description                                                               |
|---------------|--------|---------------------------------------------------------------------------|
| Sentiment     | 40%    | Mainly based on Fear & Greed Index (used as contrarian indicator)         |
| Technical     | 40%    | Price analysis relative to moving averages and historical behavior       |
| Macro         | 20%    | Bitcoin dominance evaluation as altcoin risk proxy                        |

### Smart Caching

- Redis caching of processed results
- Significant reduction in external API calls
- Improved performance and scalability for public API usage

---

## Main Features

- **Real-time Analysis**  
  Score and recommendation generation for BTC, ETH, and selected altcoins.

- **Sentiment History**  
  Query historical Fear & Greed Index data for market cycle analysis.

- **Macro Indicators**  
  Quick access to global metrics like Bitcoin dominance and overall market sentiment.

---

## How to Run

### Prerequisites

- Node.js ≥ 18
- Docker & Docker Compose (optional but recommended)

### With Docker (recommended)

```bash
docker compose up --build