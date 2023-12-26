# 🤖 Macunaíma Telegram Bot

<!--suppress HtmlDeprecatedAttribute -->
<div align="center">
    <img src="./assets/macunaima2.jpg" alt="Macunaíma" />
</div>

Um “bot” anti-spam para o [Telegram](https://telegram.org).

> Ai que preguiça...

### 🦾 Comandos

| Comando      | Parâmetros | Descrição | Exemplo | Contexto |
| :--- | :---: | :---: | :---: | ---: |
| `/add_banned_word` | `palavra ou frase` | Adiciona uma palavra ou frase as palavras banidas do grupo | `/add_banned_word api.whatsapp` | Grupo ou SuperGrupo
| `/report` | `Motivo` | Reporta um usuário respondendo a mensagem | `/report SPAM` (responda mensagem do usuário com o comando) | Grupo ou SuperGrupo

### 🏃‍♂️ CI/CD

[![CI](https://github.com/sistematico/macunaima-telegram-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/sistematico/macunaima-telegram-bot/actions/workflows/ci.yml)
[![CD](https://github.com/sistematico/macunaima-telegram-bot/actions/workflows/cd.yml/badge.svg)](https://github.com/sistematico/macunaima-telegram-bot/actions/workflows/cd.yml)

### 📦 Instalação, configuração e testes

- Converse com o [@BotFather](https://t.me/botfather) no Telegram, crie um “bot” e copie o Token
- Adicione seu token no arquivo `.env`

Ajustar o WebHook:

```
https://api.telegram.org/bot{TOKEN_DO_BOT}/setWebhook?url=https://url_do_seu_bot.com
```

## Instalação do Banco de dados [PostgreSQL](https://postgresql.org) ([Rocky Linux](https://rockylinux.org))

```bash
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm

dnf -qy module disable postgresql

dnf install -y postgresql16-server

/usr/pgsql-16/bin/postgresql-16-setup initdb

systemctl --now enable postgresql-16.service
```

## Configuração do Banco de dados [PostgreSQL](https://postgresql.org)

```bash
sudo -u postgres psql
CREATE DATABASE macunaima;
CREATE USER macunaima WITH PASSWORD 'senha';
GRANT ALL PRIVILEGES ON DATABASE macunaima TO macunaima;
\q
```

Ou use um [script](./scripts/db/create.sh) automatizado.

### 👏 Créditos

- [Ansible](https://www.ansible.com)
- [Grammy](https://grammy.dev)
- [Bun](https://bun.sh)
- [Hono](https://hono.dev)
- [Prisma](https://prisma.io)
- [Arch Linux](https://archlinux.org)
- [Fé](https://pt.wikipedia.org/wiki/Fé)

### 🛟 Ajude

Se o meu trabalho foi útil de qualquer maneira, considere doar qualquer valor através do das seguintes plataformas:

[![LiberaPay](https://img.shields.io/badge/LiberaPay-gray?logo=liberapay&logoColor=white&style=flat-square)](https://liberapay.com/sistematico/donate) [![PagSeguro](https://img.shields.io/badge/PagSeguro-gray?logo=pagseguro&logoColor=white&style=flat-square)](https://pag.ae/bfxkQW) [![ko-fi](https://img.shields.io/badge/ko--fi-gray?logo=ko-fi&logoColor=white&style=flat-square)](https://ko-fi.com/K3K32RES9) [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-gray?logo=buy-me-a-coffee&logoColor=white&style=flat-square)](https://www.buymeacoffee.com/sistematico) [![Open Collective](https://img.shields.io/badge/Open_Collective-gray?logo=opencollective&logoColor=white&style=flat-square)](https://opencollective.com/sistematico) [![Patreon](https://img.shields.io/badge/Patreon-gray?logo=patreon&logoColor=white&style=flat-square)](https://patreon.com/sistematico)


[![GitHub Sponsors](https://img.shields.io/github/sponsors/sistematico?label=Github%20Sponsors)](https://github.com/sponsors/sistematico)
