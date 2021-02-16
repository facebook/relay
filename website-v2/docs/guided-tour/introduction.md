---
id: introduction
title: Introduction
slug: /guided-tour/
---

import DocsRating from '../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';


Relay is a framework for managing and declaratively fetching GraphQL data. Specifically, it provides a set of APIs to fetch and declare data dependencies for React components, in colocation with component definitions themselves.

In this guide, we're going to go over how to use Relay to build out some of the more common use cases in apps. If you're interested in a detailed reference of our APIs, check out our [Relay API Reference](../api-reference/use-fragment/) page.

<FbInternalOnly>

If you're interested, check out a recording of the [Comet Crash Course](https://our.intern.facebook.com/intern/hacktv/view/353518198804550/) we gave where we go through an overview of Relay for Comet.

**_NOTE_:** Throughout this guide, you will see code examples that import from the `react-relay` module. This is the proper import for using Relay in open source.

**If you are working within Comet**, you should import from the **`CometRelay`** module instead.

**If you are working outside of Comet**, you should import form the **`RelayHooks`** module instead.

</FbInternalOnly>

## Before you read

Before getting started, bear in mind that we assume some level of familiarity with:

<FbInternalOnly>

* [Javascript](https://our.internmc.facebook.com/intern/wiki/JavaScript/)
* [React](https://our.internmc.facebook.com/intern/wiki/ReactGuide/)
* [GraphQL](https://our.internmc.facebook.com/intern/wiki/GraphQL/) and our internal[GraphQL Server](https://our.internmc.facebook.com/intern/wiki/Graphql-for-hack-developers/)

</FbInternalOnly>

<OssOnly>

* [Javascript](https://felix-kling.de/jsbasics/)
* [React](https://reactjs.org/docs/getting-started.html)
* [GraphQL](https://graphql.org/learn/)

</OssOnly>


<DocsRating />
