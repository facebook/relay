---
id: introduction
title: Introduction
slug: /guided-tour/updating-data/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

Relay holds a local in-memory store of normalized GraphQL data, which accumulates data as GraphQL queries are made throughout usage of our app; think of it as a local database of GraphQL data. When records are updated, any components affected by the updated data will be notified and re-rendered with the updated data.

In this section, we're going to go over how to update data in the server as well as how to update our local data store accordingly, ensuring that our components are kept in sync with the latest data.


<DocsRating />
