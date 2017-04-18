---
id: routing
title: Routing
layout: docs
category: Relay Modern
permalink: docs/routing.html
next: mutations
---

> How Routing can work with the updated APIs.

The classic Relay API had routing deeply built in with `Relay.Route`, which tied navigation and data fetching together. With the modern API, routing is no longer part of Relay. So what should you do for routing in your use case? There's no one-size-fits all answer so it depends on your use case and evaluation of the options.

## No Routing

If the Relay part of an application is some widget or single view as part of a larger application, you don't need any new routing. You can just render a `Relay.QueryRenderer` somewhere on the page to fetch and render the data you need there.

- **Pro:** Easy to understand.

This option is simple and should be used when sufficient.

## Relay.Route

The legacy `Relay.Route` mechanism can still be used by just leaving the `queries` empty and rendering a `Relay.QueryRenderer` from the root component.

- **Pro:** Migrating from an existing app that already uses `Relay.Route` may be easier.
- **Con:** `Relay.Route` itself is unlikely to be developed further.

## ReactRouter

The popular open source routing solution may be viable to use. Since routing and data fetching are no longer coupled in Relay Modern, this should be easily usable with Relay as you would just render a `Relay.QueryRenderer` somewhere in the routing tree.

- **Pro:** Ability to integrate with a popular community standard.
- **Con:** Not widely used at Facebook, so may not enjoy much official support.

## Custom Routing & More

The options listed above are not exhaustive. If you are aware of other routing solutions that work well with Relay Modern, [please let us know](https://github.com/facebook/relay/issues/new).
