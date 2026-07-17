# API Bootstrap

> Um gerador de projetos backend para Node.js, empacotado como uma aplicação desktop Electron, que oferece uma base padronizada e pronta para desenvolvimento de APIs.

---

## Sobre o projeto

O **API Bootstrap** é uma aplicação desktop desenvolvida com Electron e React, projetada para simplificar o início de novos projetos de API backend em Node.js. Seu objetivo principal é fornecer uma estrutura de projeto padronizada e configurada, permitindo que os desenvolvedores foquem diretamente na lógica de negócio, em vez de gastar tempo com a configuração inicial. A ferramenta não visa gerar uma aplicação completa, mas sim uma base sólida e organizada para acelerar o desenvolvimento.

**Principais características:**

- **Geração de Projetos Padronizados**: Cria uma base consistente para APIs Node.js.

- **Automatização da Configuração Inicial**: Lida com a configuração de dependências e estrutura de pastas.

- **Suporte Multiplataforma**: Disponível para Windows, macOS e Linux, utilizando a mesma base de código.

- **Interface Intuitiva**: Permite ao usuário definir o nome do projeto e o diretório de destino através de uma interface gráfica.

---

## Tecnologias utilizadas

O projeto API Bootstrap é construído com as seguintes tecnologias:

- **Electron**: Framework para construir aplicações desktop multiplataforma com tecnologias web (HTML, CSS, JavaScript).

- **React**: Biblioteca JavaScript para construção de interfaces de usuário interativas.

- **Vite**: Ferramenta de build frontend que oferece uma experiência de desenvolvimento rápida.

- **electron-builder**: Ferramenta para empacotar e distribuir aplicações Electron para diversas plataformas.

- **Express.js**: (Utilizado no template gerado) Framework web minimalista e flexível para Node.js, usado para construir APIs.

- **dotenv**: (Utilizado no template gerado) Módulo para carregar variáveis de ambiente de um arquivo `.env`.

---

## Arquitetura do projeto

O API Bootstrap segue uma arquitetura baseada em Electron, que separa a aplicação em processos principal (main) e de renderização (renderer). A comunicação entre esses processos é feita via IPC (Inter-Process Communication).

- **Processo Principal (Main)**: Gerencia a janela da aplicação, interações com o sistema operacional e o motor de geração de projetos.

- **Processo de Renderização (Renderer)**: Responsável pela interface do usuário, desenvolvida em React.

- **Core Generator**: Módulo central que orquestra a criação do projeto, carregando templates, substituindo variáveis e manipulando o sistema de arquivos.

- **Platform Layer**: Uma camada de abstração que lida com operações específicas do sistema operacional (ex: abrir pastas, terminais), garantindo a compatibilidade multiplataforma.

**Fluxo da Aplicação:**

```
React (Interface do Usuário)
  ↓
Electron IPC (Comunicação Interprocessos)
  ↓
Core Generator (Motor de Geração)
  ↓
Platform Layer (Operações de Sistema)
  ↓
Filesystem (Manipulação de Arquivos)
  ↓
Command Runner (Execução de Comandos)
  ↓
Projeto Criado
```

---

## Estrutura de pastas

A estrutura principal do projeto `api-bootstrap` é organizada da seguinte forma:

```
api-bootstrap/
├── build/ # Arquivos de build e ícones da aplicação
├── resources/ # Recursos estáticos da aplicação
├── src/
│   ├── core/ # Módulos de lógica de negócio e serviços centrais (logger, system, builder, templates)
│   ├── main/ # Código do processo principal do Electron (backend)
│   │   ├── ipc/ # Módulos para comunicação interprocessos (IPC)
│   │   └── index.js # Ponto de entrada do processo principal
│   ├── preload/ # Script de pré-carregamento do Electron
│   └── renderer/ # Código do processo de renderização (frontend React)
│       ├── src/ # Código-fonte da aplicação React (assets, components, pages)
│       └── index.html # Arquivo HTML principal da interface
├── templates/ # Contém os templates de projetos a serem gerados (ex: express-js)
│   └── express-js/
│       ├── README.md
│       ├── package.json
│       ├── src/ # Código-fonte do template Express.js (app, config, controllers, etc.)
│       └── template.json # Metadados do template
├── package.json # Metadados do projeto principal e scripts de execução
└── ... (outros arquivos de configuração como .eslintrc, .prettierrc, etc.)
```

---

## Instalação e Execução

Para configurar e executar o projeto API Bootstrap localmente, siga os passos abaixo:

### Pré-requisitos

Certifique-se de ter o Node.js (versão 18 ou superior) e o npm (ou yarn) instalados em sua máquina.

### Instalação

1. **Clone o repositório:**

   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd api-bootstrap
   ```

1. **Instale as dependências:**

   ```bash
   npm install
   # ou
   yarn install
   ```

   O script `postinstall` executará automaticamente `electron-builder install-app-deps` para instalar as dependências específicas do Electron.

### Execução

- **Modo de Desenvolvimento (com hot-reload):**

   ```bash
   npm run dev
   ```

- **Visualização (preview da build):**

   ```bash
   npm start
   ```

### Build da Aplicação

Para gerar as versões empacotadas da aplicação para diferentes sistemas operacionais:

- **Build para Windows:**

   ```bash
   npm run build:win
   ```

- **Build para macOS:**

   ```bash
   npm run build:mac
   ```

- **Build para Linux:**

   ```bash
   npm run build:linux
   ```

---

## Banco de dados

Atualmente, o template `express-js` gerado pelo API Bootstrap não inclui uma configuração de banco de dados pré-definida ou scripts de migration. No entanto, ele é projetado para ser facilmente integrado com qualquer sistema de gerenciamento de banco de dados (SQL ou NoSQL) e ORMs/ODMs de sua escolha. O uso de `dotenv` no template facilita a configuração de variáveis de ambiente para conexão com o banco de dados.

**Nota:** O projeto API Bootstrap tem como objetivo futuro incluir opções de seleção de stack, banco de dados e modelagem inicial através da interface, conforme descrito na documentação de design. No entanto, essas funcionalidades ainda não estão implementadas na interface atual.

---

## Funcionamento e Fluxos Principais

O fluxo de uso atual do API Bootstrap é o seguinte:

1. **Preenchimento do Formulário**: O usuário informa o **Nome do Projeto** desejado.

1. **Seleção de Pasta**: O usuário seleciona o diretório onde o projeto será criado.

1. **Geração**: Ao clicar em "Criar Projeto", a aplicação utiliza o template `express-js` (atualmente fixo) para gerar a estrutura da API no local especificado. Variáveis como `DESCRIPTION`, `AUTHOR` e `YEAR` são preenchidas com valores padrão ou baseados no nome do projeto.

---

## API e Endpoints

O projeto de API gerado a partir do template `express-js` inclui um endpoint básico para verificação de status:

- **Módulo**: Geral

- **Método + Rota**: `GET /`

- **Descrição**: Retorna um JSON indicando o nome do projeto e seu status de execução. Exemplo de resposta:

   ```json
   {
     "project": "my-api",
     "status": "running"
   }
   ```

---

## Scripts disponíveis

### Scripts do Projeto Principal (API Bootstrap - Electron App)

- `npm run format`: Formata o código utilizando Prettier.

- `npm run lint`: Executa o linter (ESLint) para verificar problemas de código.

- `npm start`: Inicia a aplicação Electron em modo de visualização.

- `npm run dev`: Inicia a aplicação Electron em modo de desenvolvimento com hot-reload.

- `npm run build`: Compila a aplicação Electron.

- `npm run postinstall`: Executa `electron-builder install-app-deps` após a instalação das dependências.

- `npm run build:unpack`: Compila e gera a aplicação sem empacotar.

- `npm run build:win`: Compila e gera o instalador para Windows.

- `npm run build:mac`: Compila e gera o instalador para macOS.

- `npm run build:linux`: Compila e gera o instalador para Linux.

### Scripts do Template Gerado (Express.js API)

- `npm run dev`: Inicia o servidor Express.js em modo de desenvolvimento com `node --watch`.

- `npm start`: Inicia o servidor Express.js em modo de produção.

---

## Próximos passos (TODOs)

Com base na documentação de design do projeto, os seguintes recursos estão planejados para futuras versões:

- **Seleção de Stack**: Permitir ao usuário escolher entre diferentes stacks (ex: Node + Express + Prisma, Fastify + Prisma, NestJS).

- **Configuração de Banco de Dados**: Adicionar opções para selecionar e configurar bancos de dados (PostgreSQL, MySQL, SQLite, etc.) diretamente na interface.

- **Modelagem Inicial**: Funcionalidade para criar modelos e relacionamentos de banco de dados, gerando migrations e models correspondentes.

- **Seleção de Recursos**: Permitir a inclusão de recursos opcionais como JWT, Joi, Multer, Swagger, Docker, entre outros.

- **Geração de README para o projeto gerado**: Incluir a opção de gerar um README.md mais detalhado para o projeto de API recém-criado.

---

## Licença

O projeto API Bootstrap é distribuído sob a licença **MIT**.