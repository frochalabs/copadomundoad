# Bolão da Copa AD 🏆

Bem-vindo ao repositório do **Bolão da Copa AD**, uma aplicação completa para gestão e participação em bolões da Copa do Mundo! 

Este projeto foi desenhado com uma arquitetura moderna, dividida em três frentes principais, cada uma hospedada em sua respectiva branch neste repositório.

## 🏗️ Estrutura do Projeto

O repositório está organizado em branches separadas para cada componente da aplicação. Para visualizar ou contribuir com um serviço específico, faça o checkout da branch correspondente:

- **[`backend`](https://github.com/frochalabs/BolaoDaCopaAD/tree/backend)**: API Node.js/Express responsável pela lógica de negócios, integração com banco de dados MySQL e fornecimento de dados para o painel.
- **[`frontend`](https://github.com/frochalabs/BolaoDaCopaAD/tree/frontend)**: Aplicação Next.js (App Router) com Tailwind CSS e Framer Motion, fornecendo uma interface de usuário premium e responsiva (estilo "Dark Executive" / E-sports).
- **[`n8n`](https://github.com/frochalabs/BolaoDaCopaAD/tree/n8n)**: Configurações e fluxos do N8N para automações, integrações externas e webhooks.

## 🚀 Como Executar Localmente

Se você deseja rodar o projeto completo localmente, recomendamos clonar cada branch em sua respectiva pasta.

```bash
# Crie uma pasta para o projeto
mkdir BolaoDaCopaAD && cd BolaoDaCopaAD

# Clone cada componente em sua respectiva pasta
git clone -b backend git@github.com:frochalabs/BolaoDaCopaAD.git backend
git clone -b frontend git@github.com:frochalabs/BolaoDaCopaAD.git frontend
git clone -b n8n git@github.com:frochalabs/BolaoDaCopaAD.git n8n
```

### Pré-requisitos
- Node.js (v18+)
- MySQL
- N8N (opcional, para automações)

*(Consulte o README interno de cada branch para instruções detalhadas de configuração de variáveis de ambiente e execução de cada serviço).*

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, MySQL2, Node-cron
- **Automação:** N8N
- **Deploy/Hospedagem:** (A definir)

---
*Desenvolvido com ⚽ para a Copa do Mundo!*
# copadomundoad
