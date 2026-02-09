# API

Este módulo é a porta de entrada principal do ecossistema **Crypto Analytics**, fornecendo uma interface RESTful para acessar as análises e dados processados.

## Função no Projeto

A unidade `api` atua como a camada de interface entre o núcleo de análise e os consumidores externos. Suas principais responsabilidades incluem:

- **Exposição de Endpoints**: Disponibiliza rotas para consulta de scores de ativos, dados macro e sentimento de mercado.
- **Validação de Dados**: Utiliza **Zod** para garantir que as entradas de dados (queries, params, body) estejam corretas antes do processamento.
- **Documentação Automática**: Gera uma interface Swagger interativa para facilitar a integração por outros desenvolvedores.
- **Performance**: Implementada com **Fastify**, garantindo baixo overhead e alta taxa de transferência.

## Tecnologias Chave

- **Fastify**: Framework web de alta performance.
- **Zod**: Validação de dados.
- **Swagger (OpenAPI)**: Documentação viva em `/docs`.

## Estrutura de Pastas

- `/src/routers`: Definição de rotas e versões da API (v1, etc).
- `/src/core`: Lógica de orquestração específica da API.
- `/src/config`: Configurações de ambiente e constantes.

## Como Iniciar

### Desenvolvimento

```bash
bun run dev
```

O servidor iniciará em `http://localhost:3333` (ou na porta configurada no seu `.env`).

### Documentação

Acesse `http://localhost:3333/docs` para visualizar e testar os endpoints disponíveis via Swagger UI.
