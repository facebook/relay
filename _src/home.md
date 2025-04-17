---
id: home
title: Home
slug: /
description: Relay documentation landing page
keywords:
- relay
- graphql
- data
- introduction
- home
---

# Relay Docs

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

Relay is a powerful [GraphQL](https://graphql.org/) client for [React](https://react.dev/). It embodies years of learning to give you **outstanding performance by default** while keeping your code **scalable and maintainable**.

Relay brings the composability of React components to data fetching. Each component declares its own data needs, and Relay combines them into efficient pre-loadable queries. Every aspect of its design is to make the natural way of writing components also the most performant.

## Features

* **Declarative**: Just declare what data each component needs and Relay will handle generating [optimal queries](https://relay.dev/blog/2023/10/24/how-relay-enables-optimal-data-fetching/) for each surface.
* **Composable**: Components act like building bricks that can click into place anywhere in your app without needing manually update queries.
* **Pre-fetchable**: Relay's generated queries allow you to start fetching data for your surface before your code even downloads or runs.
* **Built-in UI patterns**: Relay implements loading states, pagination, refetching, optimistic updates, rollbacks, and other common UI behaviors that are tricky to get right.
* **Consistent state**: Relay maintains a normalized data store, so components that observe the same data stay in sync even if they reach it by different queries.
* **Type safe**: Relay generates TypeScript types for each GraphQL snippet so that errors are caught statically, not at runtime.
* **Streaming/deferred data**: Declaratively defer parts of your query and Relay will progressively re-render your UI as the data streams in.
* **Developer experience**: Relay's [editor support](./editor-support.md) provides autocompletion and go-to-definition for your GraphQL schema.
