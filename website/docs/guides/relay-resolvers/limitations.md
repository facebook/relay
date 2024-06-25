---
id: limitations
title: "Limitations"
slug: /guides/relay-resolvers/limitations/
description: Limitations of Relay Resolvers
---

Relay Resolvers are do have some limitations. Here we will collect a list of known limitations and provide alternatives where possible.

## No context or info arguments

In a full GraphQL implementation, resolvers would have access to a `context` and `info` argument. These arguments are not available in Relay Resolvers today. Supporting context is something we would like to do in the future, but have not yet implemented.

## No support for abstract types

Today it is not possible to define an interface or union with multiple concrete types using Relay Resolvers. This is something we would like to support in the future, but have not yet implemented.

## All fields must be nullable

Today all resolvers must be typed as nullable in order to support coercing errors to null without having to implement null bubbling. In the future we intend Resolvers to support some version of [strict semantic nullability](https://github.com/graphql/graphql-wg/discussions/1410).

## Not all GraphQL constructs are supported

Today Relay Resolvers only support a subset of GraphQL constructs. For example, it's not currently possible to define input types, enums or interfaces using Relay Resolvers.

## No support for mutations

Today Relay Resolvers only support the read path. Defining mutation fields is not yet supported. We are working to understand what it means to perform a mutation against a reactive schema, and hope to support them in the future.

## Resolvers are always evaluated lazily

Today Relay Resolvers are always evaluated lazily on a per-fragment basis. This has the advantage that if a resolver is not read, it will never be evaluated. However, it can lead to issues with waterfalls if your client schema ends up making async requests to fetch data as its read. We are actively exploring other execution strategies for Relay Resolvers, such as evaluating all fields in a query at request time, but expect the way resolvers are defined to remain stable.

## Verbose/awkward docblock syntax

Today defining a resolver requires defining a function with a docblock which uses special syntax and duplicates information already specified in the function's name and types. Further, in order to enforce that these values match up, Relay emits type assertions in its generated types. While these assertions do ensure safety, they are an awkward developer experience.

To address these issues we are exploring a more streamlined approach where names and types can be inferred from your Flow or TypeScript code similar to the approach taken by [Grats](https://grats.capt.dev/). This syntax may become available in future versions of Relay.
