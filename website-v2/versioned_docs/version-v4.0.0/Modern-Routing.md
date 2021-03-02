---
id: routing
title: Routing
original_id: routing
---
Historically, Relay started out internally at Facebook as a routing framework. However, Relay no longer makes any assumptions about routing, and works with a variety of routing options.

## No Routing

If the Relay part of an application is some widget or single view as part of a larger application, you don't need any routing. You can just render a `QueryRenderer` somewhere on the page to fetch and render the data you need there. This option is simple and should be used when sufficient.

## Flat Routes

When not nesting routes with Relay data dependencies, such as when using flat routes, it is sufficient to just render a `QueryRenderer` for the parts of your application that require Relay data. You can also use the options below that integrate your routes with their data dependencies.

## Nested Routes

Nested routes with Relay data dependencies introduce an additional complication. While it's possible to render a `QueryRenderer` per route, doing so will lead to request waterfalls in the general case where parent routes do not render their child routes until the data for those parent routes are available. This generally leads to an unnecessary additional delay in loading the data for the page, but may be acceptable for small applications or for applications with shallow route trees.

Integration options are available for open-source routing libraries that can instead fetch data for nested routes in parallel. In many of these cases, using a batching network layer can bring additional benefits in avoiding sending multiple HTTP requests.

### [React Router](https://reacttraining.com/react-router/)

Integration with Relay Classic for React Router v2 or v3 is available via [`react-router-relay`](https://github.com/relay-tools/react-router-relay), which will aggregate the queries for matched routes, and request data for all routes in parallel.

The component-based approach of React Router v4 does not readily allow for aggregating the data requirements for nested routes, and as such does not readily permit an approach that will avoid request waterfalls from nesting `QueryRenderer` components.

### [Found](https://github.com/4Catalyzer/found)

Found offers integration with Relay Modern and Relay Classic via [Found Relay](https://github.com/4Catalyzer/found-relay). Found Relay runs queries for matched routes in parallel, and supports fetching Relay data in parallel with downloading async bundles from code splitting when using Relay Modern.

## Custom Routing and More

The options listed above are not exhaustive. If you are aware of other routing solutions that work well with Relay Modern, [please let us know](https://github.com/facebook/relay/issues/new).
