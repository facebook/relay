---
id: getting-started
title: Começando
layout: docs
category: Quick Start
permalink: docs/getting-started.pt-br.html
next: tutorial
---

Para começar a criar uma aplicação com Relay, você vai precisar de três coisas:

1. **Esquema (Schema) GraphQL**

  Uma descrição do seu modelo de dados com um conjunto de métodos e resoluções que sabem como obter os dados que seu aplicativo precisa.

  GraphQL é projetado para suportar uma ampla gama de padrões de acesso a dados. Para entender a estrutura dos dados de uma aplicação, o Relay exige que você siga certas convenções ao definir seu esquema.
  Documentação aqui [Especificação GraphQL Relay](graphql-relay-specification.html).

  - **[graphql-js](https://github.com/graphql/graphql-js)** no [npm](https://www.npmjs.com/package/graphql)

    Ferramentas de propósito geral para criar um esquema GraphQL usando JavaScript

  - **[graphql-relay-js](https://github.com/graphql/graphql-relay-js)** no [npm](https://www.npmjs.com/package/graphql-relay)

    JavaScript helpers para definir conexões entre dados e mutações, de uma forma que facilmente se integra com o Relay.

2. **Servidor GraphQL**

  Qualquer servidor pode ser usado para carregar e usar um esquema GraphQL. Nosos [exemplos](https://github.com/relayjs/relay-examples) usam Express.

  - **[express-graphql](https://github.com/graphql/express-graphql)** no [npm](https://www.npmjs.com/package/express-graphql)
  - **[graphql-up](https://github.com/graphcool/graphql-up)** no [npm](https://www.npmjs.com/package/graphql-up)
  - **[Graphcool](https://www.graph.cool/)** ([Quickstart tutorial](https://www.graph.cool/docs/quickstart/))

3. **Relay**

  Relay fala com servidores GraphQL através de uma camada de rede. A [camada de rede] (https://github.com/facebook/relay/tree/master/src/network-layer/default) fornecida com o Relay é compatível nativamente com express-graphql e continuará a evoluir conforme adicionarmos novos recursos para o transporte.

A melhor maneira de começar agora é dar uma olhada em como essas três partes se reúnem para formar uma aplicação. O tutorial na próxima página o levará para uma aplicação de exemplo, usando o [Relay Starter Kit] (https://github.com/facebook/relay-starter-kit), para lhe dar uma idéia de como você pode começar a usar Relay no seus projetos.
