---
id: introduction
title: Introduction
slug: /guided-tour/updating-data/
description: Relay guide to updating data
keywords:
- updating
- mutation
- useMutation
- commitMutation
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

In previous sections, the guided tour discussed how to fetch data using GraphQL queries. Though [refetching data](../refetching/) can have the *incidental* effect of modifying data in Relay's local store (if the refetched data has changed), we haven't discussed any ways to *intentionally* modify our locally stored data.

This section will do just that: it will discuss how to update data on the server and how to update our local data store.

:::note
The **Relay store** is a cache of GraphQL data, associated with a given Relay environment, that we have encountered during the execution of an application.
:::

<DocsRating />
