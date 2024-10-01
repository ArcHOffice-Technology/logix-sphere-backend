# BA Express Backend

Este é o repositório do backend da aplicação **BA Express**, desenvolvido em **Node.js** com **TypeScript**, utilizando **Express** para a API, **PostgreSQL** como banco de dados relacional e **MongoDB** para persistência de logs.

## Stack de Tecnologias
- *Node.js*: Plataforma JavaScript para execução no servidor
- *TypeScript*: Superset do JavaScript que adiciona tipagem estática
- *Express*: Framework minimalista para criação de APIs
- *PostgreSQL*: Banco de dados relacional utilizado para persistência de dados
- *MongoDB*: Banco de dados NoSQL utilizado para persistência de logs
- *Jest*: Ferramenta de testes unitários e de integração
- *ESLint/Prettier*: Ferramentas para padronização de código

## Estrutura do Projeto
```bash
ba-express-backend/
│
├── src/                # Código-fonte principal
│   ├── controllers/    # Controladores da API
│   ├── services/       # Lógica de negócios
│   ├── models/         # Modelos de banco de dados
│   └── app.ts          # Configuração principal do servidor
│
├── config/             # Arquivos de configuração
│   ├── db.ts           # Configuração do PostgreSQL
│   └── mongo.ts        # Configuração do MongoDB
│
├── logs/               # Persistência de logs
│   └── logger.ts       # Lógica de logging
│
├── tests/              # Testes unitários e de integração
│
├── .env.example        # Arquivo de exemplo de variáveis de ambiente
├── package.json        # Dependências do projeto
├── tsconfig.json       # Configuração do TypeScript
├── .gitignore          # Ignorar arquivos como node_modules, dist, etc.
└── jest.config.js      # Configuração do Jest
``` 

## Instruções de Instalação

Siga os passos abaixo para configurar o projeto localmente:

1. *Clone o repositório*:

    ```bash
    git clone https://github.com/seu-usuario/ba-express-backend.git
    cd ba-express-backend
    ```

2. *Instale as dependências do projeto*:

    ```bash
    npm install
    ```

3. *Crie o arquivo `.env` com base no `.env.example`*:

    ```bash
    cp .env.example .env
    ```

4. *Configure as variáveis de ambiente no arquivo `.env` de acordo com seu ambiente local (PostgreSQL, MongoDB, etc.)*.

5. *Inicie o servidor em ambiente de desenvolvimento*:

    ```bash
    npm run dev
    ```

    O servidor será executado em [http://localhost:3000](http://localhost:3000).


## Scripts Disponíveis

Você pode usar os seguintes scripts para facilitar o desenvolvimento:

- `npm run dev`: Inicia o servidor em modo de desenvolvimento, com reinicialização automática (`nodemon`).
- `npm run build`: Compila o código TypeScript em JavaScript na pasta `dist`.
- `npm start`: Inicia o servidor em modo de produção.
- `npm test`: Executa os testes utilizando *Jest*.

## Testes

Este projeto utiliza *Jest* para testes unitários e de integração. Para executar os testes, utilize o seguinte comando:

    ```bash
    npm test
    ```

## Estrutura de Branch

Estamos utilizando a estratégia *Gitflow* para controle de versão. As principais branches são:

- `master`: Contém o código estável e pronto para produção.
- `develop`: Contém o código em desenvolvimento, onde novas funcionalidades são integradas.
- *Branches de feature*: Criadas a partir de `develop` para o desenvolvimento de novas funcionalidades.
- *Branches de bugfix*: Criadas a partir de `develop` ou `master` para corrigir bugs.