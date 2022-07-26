---
id: introduction
title: Introduction to Relay
slug: /
description: Introduction to Relay documentation
keywords:
- relay
- graphql
- data
- introduction
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

Relay is a JavaScript framework for fetching and managing GraphQL data in React applications that emphasizes maintainability, type safety and runtime performance.

Relay achieves this by combining declarative data fetching and a static build step. With declarative data fetching, components declare what data they need, and Relay figures out how to efficiently fetch it. During the static build step, Relay validates and optimizes queries, and pre-computes artifacts to achieve faster runtime performance.

To get started, check out the following resources:

<OssOnly>

- A **[step-by-step guide](./getting-started/step-by-step-guide/)** to cover the very basics and quickly get up and running.
- An overview of the **[prerequisites](./getting-started/prerequisites/)** for using Relay, and an **[installation and setup guide](./getting-started/installation-and-setup/)**.
- The **[guided tour](./guided-tour/)**, for a comprehensive overview of Relay's different APIs and concepts, and usage examples for different use cases.
- The **[API reference](./api-reference/relay-environment-provider/)**, for a reference of our APIs including a detailed overview of their inputs and outputs.

</OssOnly>

<FbInternalOnly>

- The **[guided tour](./guided-tour/)**, for a comprehensive overview of Relay's different APIs and concepts, and usage examples for different use cases.
- The **[API reference](./api-reference/relay-environment-provider/)**, for a reference of our APIs including a detailed overview of their inputs and outputs.

</FbInternalOnly>

<DocsRating />
