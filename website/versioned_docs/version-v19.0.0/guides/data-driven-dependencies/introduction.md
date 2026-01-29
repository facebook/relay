---
id: introduction
title: Introduction
slug: /guides/data-driven-dependencies/introduction/
description: Introduction to data driven dependencies (3D) in Relay
keywords:
- 3D
- data driven dependencies
- module
- match
- MatchContainer
---
import DocsRating from '@site/src/core/DocsRating';

Data Driven Dependencies (3D) is a feature in Relay that allows for the dynamic loading of components based on the data being rendered. This is useful when you have multiple possible components that could be used to render a piece of data, and you want to only load the component that is actually needed.

The main benefit of using 3D is that it allows you to avoid loading unnecessary code, which can improve the performance of your application. By only loading the code for the components that are actually needed, you can reduce the overall size of your JavaScript bundle and make your application faster.

In addition to improving performance, 3D also makes it easier to manage complex rendering logic. By allowing you to define multiple possible components for a single piece of data, 3D makes it easy to handle different rendering scenarios without having to write complex conditional logic.

## Use-Cases

There are a few canonical use-cases where 3D is recommended:

* **Fields that are typically null.** Comments have a *nullable* field that specifies that a quality survey should be displayed. Most comments won't have a quality survey attached (the field is typically null), so ideally the code for the survey component could only be downloaded when necessary to make the average case faster.
* **Unions.** The core News Feed type is a union of dozens of variants, each rendered by a different React component. A given page of stories will only contain a small number of story types, so ideally the application would only have to download the code for the types a user actually sees, rather than all possible story types.
* **Rendering strategies.** Finally, some pieces of content can be rendered using a variety of different **rendering strategies**. As an example, consider a `Video` type that can be rendered as a thumbnail or autoplaying video, depending on whether the user has opted into autoplaying video. The typical approach to this in our native apps is to ship code for all possible rendering strategies, fetch the GraphQL data for all those strategies, and select/render the best strategy on the client. This approach is problematic on the web, as it implies downloading both the code and data for *all* rendering strategies. Instead, data-driven dependencies allows products to only download the code and data for the *selected* rendering strategy for each item. With data-driven dependencies, we can download either the markdown code/data *or* the plaintext code or data instead of both.

## Types of 3D

There are two types of 3D that Relay supports:
- [Server 3D](../server-3d/): used when all the data in your 3D-rendered components are resolved on GraphQL servers.
- [Client 3D](../client-3d/): used when all the data in your 3D-rendered components are resolved via client-side [Relay resolvers](../../relay-resolvers/introduction/).

For details on how to configure Relay to support the type of 3D you need, see [Configuration](../configuration).

<DocsRating />
