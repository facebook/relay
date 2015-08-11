---
id: graphql-further-reading
title: Further Reading
layout: docs
category: GraphQL
permalink: docs/graphql-further-reading.html
indent: true
next: api-reference-relay
---

This concludes the overview of the GraphQL Relay Specifications. For the
detailed requirements of a Relay-compliant GraphQL server, a more formal
description of the [Relay cursor connection](../graphql/connections.htm) model,
the [Relay global object identification](../graphql/objectidentification.htm)
model, and the [Relay input object mutation](../graphql/mutations.htm) are all
available.

To see code implementing the specification, the
[GraphQL.js Relay library](https://github.com/graphql/graphql-relay-js) provides
helper functions for creating nodes, connections, and mutations; that
repository's [`__tests__`](https://github.com/graphql/graphql-relay-js/tree/master/src/__tests__)
folder contains an implementation of the above example as integration tests for
the repository.
