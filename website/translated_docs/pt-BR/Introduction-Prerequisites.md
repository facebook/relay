---
id: prerequisites
title: Pré-requisitos
---

## React

Relay é um framework para gerenciamento de dados com suporte direto a aplicações React, portanto, presumimos que você já esteja familiarizado com o [React](https://reactjs.org/) e seu ecossistema.

## GraphQL

Assumimos que você entende o básico de [GraphQL](http://graphql.org/learn/). Para começar a usar o Relay, você também precisará:

### Um esquema GraphQL

A descrição do seu modelo de dados com um conjunto associado de métodos de resolução que sabem como buscar qualquer dado que sua aplicação precisar.

GraphQL foi desenvolvido para suportar uma grande variedade de padrões de acesso de dados. Para entender a estrutura de dados de uma aplicação, o Relay precisa que você siga certas convenções quando estiver definindo seu esquema. Elas estão documentadas na [Especificação do servidor GraphQL](graphql-server-specification.html).

-   **[graphql-js](https://github.com/graphql/graphql-js)** no [npm](https://www.npmjs.com/package/graphql)

    Ferramentas de propósito geral para construção de um esquema GraphQL usando JavaScript

-   **[graphql-relay-js](https://github.com/graphql/graphql-relay-js)** no [npm](https://www.npmjs.com/package/graphql-relay)

    Métodos de ajuda em JavaScript para definir conexões entre dados e mutações de forma que integram facilmente com Relay.

### Um servidor GraphQL

Qualquer servidor pode ser ensinado a carregar um esquema e fala GraphQL. Nossos [exemplos](https://github.com/relayjs/relay-examples) usam Express.

-   **[express-graphql](https://github.com/graphql/express-graphql)** no [npm](https://www.npmjs.com/package/express-graphql)
