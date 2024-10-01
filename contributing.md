# Guia de Desenvolvimento

Este guia descreve as regras e práticas recomendadas para desenvolvimento do projeto.

## Processo de Desenvolvimento

1. Fork o repositório.
2. Crie uma nova branch para a sua feature ou correção de bug.
3. *Commit suas alterações* em sua branch.
4. Envie um *Pull Request* para o repositório principal.
5. Aguarde o feedback e ajustes necessários.

## Requisitos de Desenvolvimento

### 1. Padrões de Código

- Siga as regras de *ESLint* e *Prettier* configuradas no projeto.
- O código deve estar claro e bem documentado quando necessário.
- Nomeie suas variáveis e funções de forma descritiva.
- Use o *TypeScript* corretamente, tipando adequadamente as variáveis e funções.

### 2. Mensagens de Commit

- Escreva mensagens de commit claras e descritivas. Use o seguinte padrão para mensagens de commit:

```plaintext
<tipo>(escopo): descrição
```
#### Exemplos:
- `feat(auth)`: adicionar middleware de autenticação
- `fix(db)`: corrigir erro de conexão com PostgreSQL
- `test(api)`: adicionar testes de integração para rotas de usuário

#### Tipos de Commit Aceitos:

- `feat`: Uma nova funcionalidade.
- `fix`: Correção de bugs.
- `docs`: Mudanças na documentação.
- `test`: Adicionar ou corrigir testes.
- `refactor`: Mudanças no código que não corrigem bugs nem adicionam novas funcionalidades.

### 3. Testes

- Todos os novos códigos devem ter cobertura de testes.
- Utilize o *Jest* para escrever testes unitários e de integração.
- Antes de enviar seu *Pull Request*, garanta que todos os testes estão passando:

    ```bash
    npm test
    ```

### 4. Pull Request

- Antes de enviar um *Pull Request (PR)*, faça o rebase da sua branch com a branch `develop`.
- Inclua uma descrição detalhada das mudanças no PR.
- Resolva qualquer conflito de merge antes de enviar o PR.

#### Ambiente de Desenvolvimento

- Certifique-se de que você tem *Node.js* e *npm* instalados em sua máquina.
- Configure seu ambiente local corretamente usando o arquivo `.env.example` como base.

#### Estratégia de Branch

Estamos utilizando *Gitflow* como estratégia de branch. Siga as convenções abaixo ao trabalhar no projeto:

- `master`: Contém código estável, pronto para produção.
- `develop`: Contém o código em desenvolvimento, onde novas funcionalidades são integradas.
- *Branches de feature*: Devem ser criadas a partir de `develop` para o desenvolvimento de novas funcionalidades.
- *Branches de bugfix*: Devem ser criadas a partir de `develop` ou `master` para corrigir bugs.