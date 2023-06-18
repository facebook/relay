---
id: typesafe-updaters-faq
title: Typesafe updaters FAQ
slug: /guided-tour/updating-data/typesafe-updaters-faq/
description: Typesafe updater FAQ
keywords:
- typesafe updaters
- readUpdatableQuery
- readUpdatableFragment
- updater
- updatable
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

<OssOnly>

:::caution

Because in TypeScript, [getters and setters cannot have different types](https://github.com/microsoft/TypeScript/issues/43662), and the generated types of getters and setters is not the same, `readUpdatableQuery` is currently unusable with TypeScript. `readUpdatableFragment` is usable, as long as the updatable fragment contains only scalar fields.

:::

</OssOnly>

# Typesafe Updaters FAQ

<FbInternalOnly>

:::note

Is something missing from this Q&A? Are you confused? Would you like help adopting these APIs? Please, reach out to [Robert Balicki](https://fb.workplace.com/profile.php?id=100042823931887). I am happy to help!

:::

</FbInternalOnly>

# General

## What is typesafe updaters?

Typesafe updaters is the name given to a project to provide a typesafe and ergonomic alternative to the existing APIs for imperatively updating data in the Relay store.

## Why?

Relay provides typesafe and ergonomic APIs for fetching and managing data that originates on the server. In addition, Relay provides the ability to define local-only fields in **client schema extensions**. However, the APIs for mutating the data in these fields has hitherto been verbose and not ergonomic, meaning that we could not recommend Relay as a solution for managing local state.

## What was wrong with the existing APIs?

The pre-existing APIs are verbose and not typesafe. They make it easy to make a variety of mistakes and require that the developer understand a new set of APIs only when writing updaters.

Typesafe updaters is a set of APIs that are typesafe and (hopefully) more ergonomic. They leverage well-known Relay idioms (queries, fragments, type refinement) and use getters and setters instead of requiring that the developer learn about a set of methods that are unused elsewhere.

## How does a developer use typesafe updaters?

With typesafe updaters, a developers writes an updatable query or a fragment that specifies the data to imperatively update. Then, the developer reads out that data from the store, returning a so-called **updatable proxy**. Then, the developer mutates that updatable proxy. Mutating that updatable proxy using setters (e.g. `updatableData.name = "Godzilla"`) results in calls to the old API, but with added type safety.

## Why are these labeled `_EXPERIMENTAL`?

These are de facto not experimental. We encourage you to use them when writing new code! This suffix will be removed soon.

## What is an updatable query or fragment?

An updatable query or fragment is a query or fragment that has the `@updatable` directive.

# Updatable queries and fragments are not fetched

## Are fields selected in updatable queries and fragments fetched from the server?

No! The server doesn't know about updatable queries and fragments. Their fields are never fetched.

Even if you spread an updatable fragment in a regular query or fragment, the fields selected by that updatable fragment are not fetched as part of that request.

## What if I want to fetch a field and also mutate it?

You should select that field in both a regular query/fragment **and** in an updatable query/fragment.

## What are some consequences of this?

* When you read out updatable data, it can be missing if it isn't present in the store.
* You cannot spread regular fragments in updatable queries/fragments.
* The generated artifact for updatable queries/fragments does not contain a query ID and does not contain a normalization AST (which is used for writing network data to the store.)
* Directives like `@defer`, etc. do not make sense in this context, and are disallowed.

# Misc

## Where do I get a `store`?

The classes `RelayRecordSourceSelectorProxy` and `RelayRecordSourceProxy` contain the methods `readUpdatableQuery` and `readUpdatableFragment`. One can acquire an instance of these classes:

* In updaters of mutations and subscriptions
* In optimistic updaters of mutations
* When using `RelayModernEnvironment`'s `commitUpdate`, `applyUpdate`, etc. methods.
* When using the standalone `commitLocalUpdate` method.
