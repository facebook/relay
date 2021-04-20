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

GraphQL is designed to support a wide range of data access patterns. In order to understand the structure of an application's data, Relay requires that you follow certain conventions when defining your schema. These are documented in the [GraphQL Server Specification](graphql-server-specification.html).

-   **[graphql-js](https://github.com/graphql/graphql-js)** no [npm](https://www.npmjs.com/package/graphql)

    General-purpose tools for building a GraphQL schema using JavaScript

-   **[graphql-relay-js](https://github.com/graphql/graphql-relay-js)** on [npm](https://www.npmjs.com/package/graphql-relay)

    JavaScript helpers for defining connections between data, and mutations, in a way that smoothly integrates with Relay.

### A GraphQL Server

Any server can be taught to load a schema and speak GraphQL. Our [examples](https://github.com/relayjs/relay-examples) use Express.

-   **[express-graphql](https://github.com/graphql/express-graphql)** on [npm](https://www.npmjs.com/package/express-graphql)
