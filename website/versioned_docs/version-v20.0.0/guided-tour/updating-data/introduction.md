---
id: introduction
title: Introduction
slug: /guided-tour/updating-data/introduction
description: Relay guide to updating data
keywords:
- updating
- mutation
- useMutation
- commitMutation
- relay store
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

In the [fetching data](../list-data/introduction.md) section, we discuss how to fetch data using GraphQL queries. Though fetching data can have the *incidental* effect of modifying data in Relay's local store (if the fetched data has changed), we haven't discussed any ways to *intentionally* modify our locally stored data.

This section will do just that: it will discuss how to update our local data store, and data on the server.

:::note
The **Relay store** is a cache of GraphQL data, associated with a given Relay environment, that we have encountered during the execution of an application.
:::

<DocsRating />
