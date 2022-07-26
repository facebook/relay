---
id: architecture-overview
title: Architecture Overview
slug: /principles-and-architecture/architecture-overview/
description: Relay architecture overview guide
keywords:
- architecture
---

import DocsRating from '@site/src/core/DocsRating';

This document, together with [Runtime Architecture](../runtime-architecture/) and [Compiler Architecture](../compiler-architecture/), describes the high-level architecture of Relay. The intended audience includes developers interested in contributing to Relay, developers hoping to utilize the building blocks of Relay to create higher-level APIs, and anyone interested in understanding more about Relay internals. For developers wanting to learn more about _using_ Relay to build products, the [Guided Tour](../../guided-tour/) is the best resource.

## Core Modules

Relay is composed of three core parts:

-   **Relay Compiler:** A GraphQL to GraphQL optimizing _compiler_, providing general utilities for transforming and optimizing queries as well as generating build artifacts. A novel feature of the compiler is that it facilitates experimentation with new GraphQL features - in the form of custom directives - by making it easy to translate code using these directives into standard, spec-compliant GraphQL.
-   **Relay Runtime:** A full-featured, high-performance GraphQL _runtime_ that can be used to build higher-level client APIs. The runtime features a normalized object cache, optimized "write" and "read" operations, a generic abstraction for incrementally fetching field data (such as for pagination), garbage collection for removing unreferenced cache entries, optimistic mutations with arbitrary logic, support for building subscriptions and live queries, and more.
-   **React/Relay:** A high-level _product API_ that integrates the Relay Runtime with React. This is the primary public interface to Relay for most product developers, featuring APIs to fetch the data for a query or define data dependencies for reusable components (e.g. `useFragment`).

Note that these modules are _loosely coupled_. For example, the compiler emits representations of queries in a well-defined format that the runtime consumes, such that the compiler implementation can be swapped out if desired. React/Relay relies only on the well-documented public interface of the runtime, such that the actual implementation can be swapped out. We hope that this loose coupling will allow the community to explore new use-cases such as the development of specialized product APIs using the Relay runtime or integrations of the runtime with view libraries other than React.

<DocsRating />
