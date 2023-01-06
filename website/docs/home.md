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

Relay is a data management library for React that lets you fetch and update data with GraphQL. It embodies years of learning to give you **outstanding performance by default** while keeping your code **stable and maintainable**.

Relay brings the composability of React components to data fetching. Each component declares its own data needs, and Relay combines them into efficient pre-loadable queries. Every aspect of its design is to make the natural way of writing components also the most performant.

## Features

* Declarative data: Just declare what data each component needs and Relay will handle the loading states.
* Co-location and composability: Each component declares its own data needs; Relay combines them into efficient queries. When you re-use a component on a different screen, your queries are automatically updated.
* Pre-fetching: Relay analyses your code so you can start fetching queries before your code even downloads or runs.
* UI patterns: Relay implements loading states, pagination, refetching, optimistic updates, rollbacks, and other common UI behaviors that are tricky to get right.
* Consistent updates: Relay maintains a normalized data store, so components that observe the same data stay in sync even if they reach it by different queries.
* Streaming and deferred data: Declaratively defer parts of your query and Relay will progressively re-render your UI as the data streams in.
* Great developer experience: Relay provides autocompletion and go-to-definition for your GraphQL schema.
* Type safety: Relay generates type definitions so that mistakes are caught statically, not at runtime.
* Manage local data: Use the same API for server data and local client state.
* Hyper-optimized runtime: Relay is relentlessly optimized. Its JIT-friendly runtime processes incoming data faster by statically determining what payloads to expect.

## Stack

Relay works on the Web and on React Native — it is used extensively at Meta in both environments. It is framework-agnostic and works with Next, React Router, Create React App, etc. It works with both TypeScript and Flow.

Relay is completely tied to GraphQL, so if you cannot use GraphQL then it's not the right choice for you.

Relay has a UI-agnostic layer that fetches and manages data, and a React-specific layer that handles loading states, pagination, and other UI paradigms. It is mainly supported when used with React, although you can access your Relay data outside of React if you need to. The React-specific parts of Relay are based on Suspense, so there are some limitations if you're stuck on an older version of React.

## Where to Go from Here

<OssOnly>

<div class="bigCallToAction">
Start with the <strong><a href="tutorial/intro/">tutorial</a></strong> — it will take you step-by-step through building a Relay app.
</div>


- An overview of the **[prerequisites](./getting-started/prerequisites/)** for using Relay, and an **[installation and setup guide](./getting-started/installation-and-setup/)**.
- The **[API reference](./api-reference/relay-environment-provider/)**, for a reference of our APIs including a detailed overview of their inputs and outputs.

</OssOnly>

<FbInternalOnly>

- Start with the **[tutorial](./tutorial/intro/)** — it will take you step-by-step through building a Relay app.
- The **[API reference](./api-reference/relay-environment-provider/)**, for a reference of our APIs including a detailed overview of their inputs and outputs.

</FbInternalOnly>

<DocsRating />
