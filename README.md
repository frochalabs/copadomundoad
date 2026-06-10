<div align="center">
  <img src="https://cdn.jornaldaparaiba.com.br/img/inline/210000/Copa-do-Mundo-2026-conheca-a-Trionda-bola-oficial-0021348700202510040824.webp?xid=1170998" alt="Copa do Mundo" width="150"/>
  <h1>Bolão da Copa AD</h1>
  <p><strong>Plataforma para gestão de bolões da Copa do Mundo 2026.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/n8n-FF6F61?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n" />
  </p>
</div>

<br>

Repositório da aplicação do Bolão da Copa AD. A aplicação é dividida em frontend, backend e rotinas de automação.

## Funcionalidades e Arquitetura

- **Frontend**: Aplicação em Next.js com Tailwind CSS e Framer Motion para a interface de usuário.
- **Sincronização de Jogos**: Um worker utilizando `node-cron` verifica periodicamente o banco de dados e consulta a API `football-data.org` para atualizar os resultados das partidas concluídas, minimizando o número de requisições.
- **Gerenciamento de Fuso Horário**: O banco de dados utiliza o formato `TIMESTAMPTZ` do PostgreSQL para armazenar os horários dos jogos, garantindo compatibilidade independentemente do fuso horário em que o servidor ou o usuário estejam localizados.
- **Estatísticas**: Endpoints SQL dedicados para calcular tendências de palpites, jogos com maior engajamento e palpites divergentes da maioria.
- **Integração com n8n**: Endpoints configurados para receber dados de palpites via webhooks, permitindo a integração com formulários externos sem alterações no código fonte.

---

## Estrutura do Monorepo

- **`/backend`**: API REST desenvolvida em Node.js com Express. Contém scripts de sincronização, mapeamento de times e conexão com PostgreSQL.
- **`/frontend`**: Aplicação Next.js (App Router) responsável pela renderização da interface e consumo da API.
- **`/n8n`** *(opcional)*: Arquivos de configuração dos fluxos de automação.

---

## Instruções de Execução

### 1. Pré-requisitos
- Node.js (v18 ou superior)
- PostgreSQL em execução localmente ou via Docker

```bash
git clone git@github.com:frochalabs/copadomundoad.git
cd copadomundoad
```

### 2. Backend
O backend possui scripts para configuração inicial do banco e carga de dados.

```bash
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor (as tabelas serão criadas automaticamente na primeira execução)
npm run dev
```

Para preencher o banco de dados com as informações oficiais da fase de grupos, execute o script em um terminal separado:
```bash
node src/scripts/seedGroupStageFromApi.js
```

### 3. Frontend
Em um novo terminal, inicie a interface:

```bash
cd frontend
npm install
npm run dev
```
A aplicação estará disponível em `http://localhost:3000`.

---

## Testes e Administração
O projeto inclui uma coleção do Postman (`backend/bolao_postman_collection.json`) contendo:
- Endpoints de leitura e escrita de jogos.
- Rota administrativa para sincronização manual de identificadores da API externa (`POST /api/admin/sync-games`).
- Endpoints de consulta de ranking e estatísticas.
