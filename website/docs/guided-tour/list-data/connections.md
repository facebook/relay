---
id: connections
title: Connections
slug: /guided-tour/list-data/connections/
description: Relay guide for connections
keywords:
- pagination
- connections
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import useBaseUrl from '@docusaurus/useBaseUrl';

There are several scenarios in which we'll want to query a list of data from the GraphQL server. Often times we don't want to query the *entire* set of data up front, but rather discrete sub-parts of the list, incrementally, usually in response to user input or other events. Querying a list of data in discrete parts is usually known as [Pagination](https://graphql.org/learn/pagination/).


Specifically in Relay, we do this via GraphQL fields known as [Connections](https://graphql.org/learn/pagination/#complete-connection-model). Connections are GraphQL fields that take a set of arguments to specify which "slice" of the list to query, and include in their response both the "slice" of the list that was requested, as well as  information to indicate if there is more data available in the list and how to query it; this additional information can be used in order to perform pagination by querying for more "slices" or pages on the list.

More specifically, we perform *cursor-based pagination,* in which the input used to query for "slices" of the list is a `cursor` and a `count`. Cursors are essentially opaque tokens that serve as markers or pointers to a position in the list. If you're curious to learn more about the details of cursor-based pagination and connections, check out <a href={useBaseUrl('graphql/connections.htm')}>the spec</a>.


<DocsRating />
