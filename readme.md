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
* Suportar diferentes sistemas operacionais utilizando a mesma base de código.

---

# Estrutura do projeto

```text
api-bootstrap/
├── build/ # Arquivos de build e ícones da aplicação
├── resources/ # Recursos estáticos da aplicação, como ícones
├── src/
│   ├── core/ # Módulos de lógica de negócio e serviços centrais
│   │   ├── logger/ # Módulo para gerenciamento de logs
│   │   └── system/ # Módulo para interações com o sistema operacional
│   ├── main/ # Código do processo principal do Electron (backend)
│   │   ├── ipc/ # Módulos para comunicação interprocessos (IPC)
│   │   └── index.js # Ponto de entrada do processo principal
│   ├── preload/ # Código do script de pré-carregamento do Electron
│   │   └── index.js # Ponto de entrada do script de pré-carregamento
│   └── renderer/ # Código do processo de renderização do Electron (frontend React)
│       ├── src/ # Código-fonte da aplicação React
│       │   ├── assets/ # Ativos estáticos como CSS e SVGs
│       │   ├── components/ # Componentes React reutilizáveis
│       │   ├── App.jsx # Componente principal da aplicação React
│       │   └── main.jsx # Ponto de entrada da aplicação React
│       └── index.html # Arquivo HTML principal da interface do usuário
├── .editorconfig # Configurações para editores de texto
├── .gitignore # Arquivos e diretórios a serem ignorados pelo Git
├── .prettierignore # Arquivos e diretórios a serem ignorados pelo Prettier
├── .prettierrc.yaml # Configurações do Prettier
├── electron-builder.yml # Configurações do Electron Builder para empacotamento
├── electron.vite.config.mjs # Configurações do Vite para Electron
├── eslint.config.mjs # Configurações do ESLint
├── package-lock.json # Bloqueio de dependências do npm
└── package.json # Metadados do projeto e scripts de execução
```

---

# Suporte Multiplataforma

O API Bootstrap será desenvolvido utilizando Electron, permitindo gerar projetos em diferentes sistemas operacionais utilizando a mesma base de código.

Sistemas suportados:

* Windows
* macOS
* Linux

A maior parte do projeto será compartilhada entre todas as plataformas.

As diferenças específicas de cada sistema serão isoladas através de uma camada própria.

---

# Platform Layer

A camada de plataforma será responsável por funcionalidades dependentes do sistema operacional.

Estrutura:

```text
core/

platform/

├── index.js
├── windows.js
├── macos.js
└── linux.js
```

Responsabilidades:

* Abrir pasta do projeto.
* Abrir terminal.
* Detectar ferramentas instaladas.
* Verificar Node.js.
* Verificar npm.
* Verificar Git.
* Executar comandos específicos do sistema.

---

## Interface de Plataforma

O Core não executará comandos específicos diretamente.

Exemplo incorreto:

```javascript
exec("explorer .");
```

ou:

```javascript
exec("open .");
```

A aplicação utiliza uma interface única:

```javascript
platform.openFolder(path);

platform.openTerminal();

platform.checkNode();

platform.checkGit();
```

Cada sistema possui sua própria implementação.

---

## Exemplos

Windows:

```javascript
class WindowsPlatform {

    openFolder(path) {
        exec(`explorer "${path}"`);
    }

}
```

macOS:

```javascript
class MacPlatform {

    openFolder(path) {
        exec(`open "${path}"`);
    }

}
```

Linux:

```javascript
class LinuxPlatform {

    openFolder(path) {
        exec(`xdg-open "${path}"`);
    }

}
```

---

# Gerenciamento de comandos

Comandos executados pelo gerador também serão abstraídos.

Estrutura:

```text
core/

commands/

├── CommandRunner.js
├── npm.js
├── git.js
└── sequelize.js
```

Exemplo:

```javascript
commands.sequelize.init();
```

Internamente:

```bash
npx sequelize-cli init
```

Dessa forma, qualquer ajuste futuro fica isolado em um único local.

---

# Fluxo da aplicação

```text
React

↓

Electron IPC

↓

Core Generator

↓

Platform Layer

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

# Build da aplicação

O Electron permite gerar versões específicas para cada sistema operacional.

## Windows

```bash
npm run build:win
```

Resultado:

```text
API-Bootstrap.exe
```

---

## macOS

```bash
npm run build:mac
```

Resultado:

```text
API-Bootstrap.dmg
```

---

## Linux

```bash
npm run build:linux
```

Resultado:

```text
API-Bootstrap.AppImage
```

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
