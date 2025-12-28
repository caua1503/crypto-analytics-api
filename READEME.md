# Crypto Analytics API

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
</p>

<p align="center">
  <i>Uma API de análise de criptomoedas que combina indicadores técnicos, sentimento de mercado e dados macroeconômicos para gerar recomendações objetivas e baseadas em dados.</i>
</p>

---

## Visão Geral

O **Crypto Analytics API** é uma API backend projetada para processar e analisar dados do mercado de criptomoedas em tempo real.  

Ela integra múltiplas fontes de dados para gerar uma **pontuação composta (score)** e uma **recomendação automatizada** de investimento, com foco em decisões frias e objetivas. O principal objetivo é auxiliar na identificação de:

- Pontos de entrada (compra) em momentos de pânico excessivo no mercado
- Pontos de saída (venda) em períodos de euforia irracional

---

## Tecnologias Utilizadas

- **TypeScript** — Tipagem estática e maior segurança na lógica de negócio
- **Fastify** — Framework web de alta performance e baixo overhead
- **Redis** — Cache distribuído para armazenamento rápido de dados processados
- **Docker** — Padronização do ambiente de desenvolvimento, teste e produção

> Outras dependências e detalhes de implementação estão documentados nos READMEs dos módulos específicos.

---

## Diferencial

### Motor de Processamento Inteligente

Diferentemente de APIs que apenas agregam ou repassam dados brutos, esta aplicação possui uma **lógica de negócio própria** que transforma informações em insights acionáveis.

### Agregação de Dados

- Consumo simultâneo de múltiplas fontes externas:
  - Preços em tempo real
  - Métricas de sentimento de mercado
  - Indicadores macroeconômicos

### Cálculo do Score Ponderado (Ajustável)

A pontuação final é calculada com pesos específicos para cada dimensão:

| Dimensão      | Peso | Descrição                                                                 |
|---------------|------|---------------------------------------------------------------------------|
| Sentimento    | 40%  | Baseado principalmente no Fear & Greed Index (usado como indicador contrário) |
| Técnico       | 40%  | Análise do preço em relação a médias móveis e comportamento histórico     |
| Macro         | 20%  | Avaliação da dominância do Bitcoin como proxy de risco para altcoins       |

### Cache Inteligente

- Armazenamento em cache dos resultados processados via Redis
- Redução significativa de chamadas externas
- Melhoria de performance e escalabilidade para uso como API pública

---

## Funcionalidades Principais

- **Análise em Tempo Real**  
  Geração de score e recomendação para BTC, ETH e outras criptomoedas selecionadas.

- **Histórico de Sentimento**  
  Consulta de dados históricos do Fear & Greed Index para análise de ciclos de mercado.

- **Indicadores Macro**  
  Acesso rápido a métricas globais, como dominância do Bitcoin e sentimento geral do mercado.

---

## Como Executar

### Pré-requisitos

- Node.js ≥ 18
- Docker & Docker Compose (opcional, mas recomendado)

### Com Docker (recomendado)

```bash
docker compose up --build