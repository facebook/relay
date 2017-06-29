---
id: getting-started
title: 准备
layout: docs
category: Quick Start
permalink: docs/getting-started.zh-CN.html
next: tutorial
---

在开始构建 Relay 应用前，你需要了解以下三件事情：

1. ** GraphQL Schema **

  GraphQL Schema 是对你的数据模型的描述，它拥有一套相关的 resolve 方法，并且这些方法知道如何抓取应用可能需要的数据。

  GraphQL 是用来支撑大范围数据连接模式。为了理解一个应用的数据结构， 在你定义 schema 时，Relay 要求你遵守 [GraphQL Relay Specification](graphql-relay-specification.html) 里的约定。

  - **[graphql-js](https://github.com/graphql/graphql-js)** on [npm](https://www.npmjs.com/package/graphql)

  graphql-js 是用 JavaScript 编写的来构建 GraphQL schema 的通用工具。

  - **[graphql-relay-js](https://github.com/graphql/graphql-relay-js)** on [npm](https://www.npmjs.com/package/graphql-relay)

  用 JavaScript 编写的 Relay 小助手，用来定义数据和 mutations 之间的链接(connections)，可以平滑地集成在 Relay 里。

2. ** GraphQL 服务器 **

  任何服务器都可以使用 GraphQL。我们的 [示例](https://github.com/relayjs/relay-examples) 中用的是 Express。

  - **[express-graphql](https://github.com/graphql/express-graphql)** on [npm](https://www.npmjs.com/package/express-graphql)
  - **[graphql-up](https://github.com/graphcool/graphql-up)** on [npm](https://www.npmjs.com/package/graphql-up)
  - **[Graphcool](https://www.graph.cool/)** ([Quickstart tutorial](https://www.graph.cool/docs/quickstart/))

3. ** Relay **

  Relay 是通过网络层和 GraphQL 服务器通信的。使用 express-graphql 发布 Relay 的 [network layer](https://github.com/facebook/relay/tree/master/src/network-layer/default) 的兼容性是非常好的，并且我们会在传输方面增加一些新的特性来继续改进它。

现在，开始 Relay 的最好方式就是从一个已经能够运行的例子里，了解这三个部分是如何联系在一起的。[Relay Starter Kit](https://github.com/facebook/relay-starter-kit) 将会引导你，让你明白怎么在你应用里使用 Relay。
