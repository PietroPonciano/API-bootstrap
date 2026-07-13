# API Bootstrap

Gerador de projetos backend para Node.js.

O objetivo do projeto é fornecer uma aplicação desktop capaz de gerar uma base de API pronta para desenvolvimento, padronizando a estrutura do projeto, configuração do banco de dados, modelagem inicial e recursos opcionais.

O foco **não é gerar uma aplicação completa**, mas entregar um projeto organizado e pronto para começar o desenvolvimento.

---

# Objetivos

* Criar uma base padronizada para projetos backend.
* Automatizar toda a configuração inicial.
* Utilizar as ferramentas oficiais de cada stack.
* Permitir evolução para novas stacks sem alterar a arquitetura.
* Separar completamente a interface do motor de geração.

---

# Arquitetura

O projeto será dividido em quatro módulos principais.

```text
api-bootstrap/
│
├── app/                # Interface (React)
├── electron/           # Processo principal do Electron
├── core/               # Motor de geração
└── templates/          # Templates das stacks
```

O **Core** nunca deve depender do Electron.

No futuro ele poderá ser utilizado por:

* CLI
* API
* Interface Web
* Electron

---

# Estrutura do projeto

```text
api-bootstrap/

app/
│
├── pages/
├── components/
├── contexts/
├── hooks/
├── services/
└── types/

electron/
│
├── main.js
├── preload.js
└── ipc/

core/
│
├── generator/
├── filesystem/
├── commands/
├── stacks/
├── features/
├── logger/
└── utils/

templates/
│
├── node-express-sequelize/
├── node-express-prisma/
└── fastify-prisma/
```

---

# Fluxo da aplicação

```text
React

↓

Electron IPC

↓

Core Generator

↓

Stack

↓

Features

↓

Filesystem

↓

Command Runner

↓

Projeto criado
```

A interface apenas coleta as informações do usuário.

Toda a geração acontece dentro do Core.

---

# Fluxo do usuário

## 1. Informações do projeto

```text
Nome

Autor

Versão

Local onde será criado

Descrição (opcional)

Gerar README
```

---

## 2. Escolha da Stack

Inicialmente apenas uma stack estará disponível.

```text
○ Node + Express + Sequelize

○ Node + Express + Prisma (Em breve)

○ Fastify + Prisma (Em breve)

○ NestJS (Em breve)
```

---

## 3. Banco de dados

Escolha do banco.

```text
○ PostgreSQL

○ MySQL

○ MariaDB

○ SQLite
```

Configuração.

```text
Host

Porta

Usuário

Senha

Database
```

Também será possível testar a conexão antes da geração.

---

## 4. Modelagem inicial

O usuário poderá criar as tabelas da aplicação.

Exemplo:

```text
Usuários

id

nome

email

senha
```

Depois:

```text
Pedidos

id

usuarioId

valor
```

Relacionamentos:

```text
Usuários

1 ---- N

Pedidos
```

Essa modelagem será utilizada para gerar:

* Models
* Migrations
* Foreign Keys

Não serão gerados Controllers, Services ou Rotas.

---

## 5. Recursos

Os recursos serão independentes da stack.

```text
☑ JWT

☑ Joi

☐ Multer

☑ Dotenv

☑ Cors

☑ Helmet

☑ Morgan

☐ Nodemailer

☐ Swagger

☐ Docker

☑ ESLint

☑ Prettier
```

Cada recurso conhece:

* Dependências
* Arquivos necessários
* Alterações em arquivos existentes
* Comandos a serem executados

---

## 6. Resumo

Antes da criação será apresentado um resumo.

```text
Projeto

Stack

Banco

Modelos

Features
```

---

## 7. Geração

O usuário poderá acompanhar toda a geração em tempo real.

```text
✔ Criando projeto

✔ Copiando template

✔ Instalando dependências

✔ Configurando banco

✔ Criando models

✔ Criando migrations

✔ Configurando relacionamentos

✔ Finalizando
```

---

# Core

O Core será totalmente desacoplado da interface.

## Generator

Responsável por iniciar todo o processo.

```javascript
generator.generate(project)
```

---

## Project Builder

Executa todas as etapas da geração.

```text
Criar pasta

↓

Copiar template

↓

Executar comandos

↓

Configurar banco

↓

Gerar models

↓

Instalar features

↓

Finalizar
```

---

## FileSystem

Toda manipulação de arquivos passa por este módulo.

```text
copyFolder()

createFolder()

readFile()

writeFile()

replaceVariables()

append()

remove()
```

Nenhuma stack manipula arquivos diretamente.

---

## Command Runner

Executa comandos do terminal.

```text
run()

runSync()

runStreaming()
```

Exemplo:

```javascript
run("npm install");

run("npx sequelize-cli init");
```

---

# Stacks

Cada tecnologia possui seu próprio gerador.

```text
stacks/

NodeExpressSequelize/

NodeExpressPrisma/

FastifyPrisma/
```

Cada stack implementa sua própria lógica.

```text
index.js

packages.js

generator.js

database.js

models.js
```

Exemplo para Sequelize:

```text
Criar projeto

↓

npm init

↓

Instalar dependências

↓

sequelize init

↓

Configurar banco

↓

Gerar models

↓

Gerar migrations
```

Exemplo para Prisma:

```text
Criar projeto

↓

npm init

↓

prisma init

↓

Editar schema.prisma

↓

prisma generate
```

---

# Features

Os recursos opcionais serão totalmente independentes.

```text
features/

JWT/

Swagger/

Docker/

Joi/

Multer/

Cors/

Helmet/

Morgan/

ESLint/

Prettier/
```

Cada Feature possui sua própria estrutura.

```text
feature.json

packages.js

commands.js

templates/

patches.js
```

Exemplo do JWT:

```text
Instalar dependências

↓

Copiar middleware

↓

Copiar helper

↓

Modificar .env

↓

Modificar app.js
```

---

# Templates

Os templates representam apenas a estrutura base da aplicação.

```text
templates/

node-express-sequelize/

src/

config/

routes/

controllers/

middlewares/

services/

repositories/

helpers/

utils/

errors/

database/

package.json

.gitignore

.env.example
```

Os templates **não possuem recursos opcionais**.

JWT, Docker, Swagger, ESLint e demais funcionalidades são adicionadas posteriormente pelas Features.

---

# Modelo do Projeto

Toda a geração será baseada em um único objeto.

```javascript
const project = {
    name,
    author,
    version,
    stack,
    database,
    features,
    tables,
    relations
};
```

Todo o Core trabalha apenas com esse modelo.

---

# Geração dos Models

A geração utilizará o `sequelize-cli`.

Para cada tabela:

```text
sequelize-cli model:generate
```

Depois o gerador realizará os ajustes necessários.

* Model
* Migration
* Associations
* Foreign Keys

---

# Processo completo de geração

Exemplo:

```text
Node

↓

Express

↓

Sequelize

↓

PostgreSQL

↓

JWT

↓

Swagger
```

Pipeline:

```text
Criar pasta

↓

Copiar template base

↓

npm install

↓

sequelize init

↓

Configurar banco

↓

Gerar models

↓

Gerar migrations

↓

Criar relacionamentos

↓

Instalar Features

↓

git init

↓

Projeto pronto
```

---

# Comunicação Electron

Toda comunicação será feita via IPC.

```text
React

↓

window.electron.generateProject(project)

↓

IPC

↓

Generator

↓

Logs

↓

IPC

↓

Interface
```

Assim será possível acompanhar toda a geração em tempo real.

---

## Próximas stacks

A arquitetura foi projetada para suportar novas stacks sem alterações na interface.

Planejamento inicial:

* Node + Express + Sequelize
* Node + Express + Prisma
* Fastify + Prisma
* NestJS

Cada nova stack implementará apenas sua lógica específica, reutilizando todo o restante da infraestrutura do gerador.
