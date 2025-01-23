---
id: suspense-compatibility
title: Suspense Compatibility
slug: /migration-and-compatibility/suspense-compatibility/
description: Relay guide to suspense compatibility
keywords:
- suspense
- container
---

import DocsRating from '@site/src/core/DocsRating';

## What about Suspense?

Relay Hooks uses React Suspense for [specifying loading states](../../guided-tour/rendering/loading-states/), so you might be wondering: Why is that the case if Suspense for Data Fetching is still not supported? Does this mean that Suspense for Data Fetching is officially supported now in React 17?

## Is Suspense for Data Fetching ready yet?

The short answer is: **NO**.

**Support, general guidance, and requirements for usage of Suspense for Data Fetching are still not ready**, and the React team is still defining what this guidance will be for upcoming React releases.

With that said, even though there are still things to figure out before Suspense for Data Fetching can be broadly implemented and adopted, we released Relay Hooks on React 17 for a few reasons:

* Relay was a very early adopter of Suspense, and collaborated with React on the research of Suspense for Data Fetching. It was one of the first testing grounds for using Suspense in production, and helped inform some of its design decisions. As such, there are still parts of our Suspense *implementation* that reflect those early learnings (which aren't yet fully documented) and which aren't quite where we want them to be. Although we know there are still likely changes to be made in the implementation, and that there will be some limitations when Suspense is used in React 17, we know Relay Hooks are on the right trajectory for upcoming releases of React, and those changes can be streamlined and allow us to release Relay Hooks a bit earlier.
* The Relay Hooks APIs represent the APIs we want to deliver long-term for Relay and which we believe are an improvement over our previous APIs. Even though their underlying implementation is still changing and will likely change more as the Suspense for Data Fetching guidance is documented and finalized by the React team, the Relay Hooks APIs themselves are stable. They have been widely adopted internally at Facebook, and have been in use in production for over a year, so we are confident that they work. We want to allow the community to start adopting them, and be able to get external feedback from the community as well.


## What does it mean for me if I start using Relay Hooks in React 17?

What this means for users adopting Relay Hooks is:

* There will be some limitations when using Suspense in React 17, which we've documented in [our docs](../../guided-tour/refetching/refetching-queries-with-different-data/#if-you-need-to-avoid-suspense). Specifically, the current release includes a subset of features that work with both synchronous rendering and concurrent rendering. In order to fully support Suspense for Data Fetching, we also need features such as concurrently rendering suspended trees, and transitioning to new trees when data is refetched. The APIs we've currently released will allow us to support concurrent rendering with the same APIs in future versions of React.
* When a future version of React is released that fully supports concurrent rendering and Suspense for Data Fetching, Relay will also make a new major release alongside the React release. That release will likely include breaking changes that we will document for the upgrade.

<DocsRating />
