---
id: new-in-relay-modern
title: New in Relay Modern
layout: docs
category: Relay Modern
permalink: docs/new-in-relay-modern.html
next: relay-environment
---

> A summary of the biggest improvements that Relay Modern brings.

## Performance

The new Relay Modern core is more light-weight and significantly faster than the previous version. It is redesigned to work with static queries, which allow us to push more work to build/compilation time. The Modern core is much smaller as a result of removing a lot of the complex features required for dynamic queries. The new core is also an order of magnitude faster in processing the response with an optimized parsing instruction set that is generated at build time. We no longer keep around tracking information needed for dynamic query generation, which drastically reduces the memory overhead of using Relay. This means more memory is left for making the UI feel responsive. Relay Modern also supports persisted queries, reducing the upload size of the request from the full query text to a simple id.

## Injectable Custom Field Handler

Not all fields in a GraphQL schema are simple. For example, fields like connections require additional processing in order to support efficient pagination. Relay Modern supports custom field handlers that can be used to process these fields to work with various pagination patterns and other use cases.

## Simpler Mutation API

An area we've gotten a lot of questions on was mutations and their configs. Relay Modern introduces a new mutation API that allows records and fields to be updated in a more direct manner.

## Client Schema Extensions

The Relay Modern Core adds support for client schema extensions. These allow Relay to conveniently store some extra information with data fetched from the server and be rendered like any other field fetched from the server. This should be able to replace some use cases that previously required a Flux/Redux store on the side.

## Flow Type Generation

Relay Modern comes with automatic Flow type generation for the fragments used in Relay containers based on the GraphQL schema. Using these Flow types can help make an application less error-prone, by ensuring all possible `null` or `undefined` cases are considered even if they don't happen frequently.

## Fewer Requirements around Routing

Routes no longer need to know anything about the query root in Relay Modern. Relay components can be rendered anywhere wrapped in a `QueryRenderer`. This should bring more flexibility around picking routing frameworks.

## Extensible Core

Relay Modern's core is essentially an unopinionated store for GraphQL data. It can be used independent of rendering views using React and can be extended to be used with other frameworks.
