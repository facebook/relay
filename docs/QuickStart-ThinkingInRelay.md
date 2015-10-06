---
id: thinking-in-relay
title: Thinking In Relay
layout: docs
category: Quick Start
permalink: docs/thinking-in-relay.html
next: videos
---

Relay's approach to data-fetching is heavily inspired by our experience with React. In particular, React breaks complex interfaces into reusable **components**, allowing developers to reason about discrete units of an application in isolation, and reducing the coupling between disparate parts of an application. Even more important is that these components are **declarative**: they allow developers to specify *what* the UI should look like for a given state, and not have to worry about *how* to show that UI. Unlike previous approaches that used imperative commands to manipulate native views (e.g. the DOM), React uses a UI description to automatically determine the necessary commands.

Let's look at some product use-cases to understand how we incorporated these ideas into Relay. We'll assume a basic familiarity with React.

## Fetching Data For a View

In our experience, the overwhelming majority of products want one specific behavior: fetch *all* the data for a view hierarchy while displaying a loading indicator, and then render the *entire* view once the data is ready.

One solution is to have a root component fetch the data for all its children. However, this would introduce coupling: every change to a component would require changing *any* root component that might render it, and often some components between it and the root. This coupling could mean a greater chance for bugs and slow the pace of development. Ultimately, this approach doesn't take advantage of React's component model. The natural place for specifying data-dependencies was in *components*.

The next logical approach is to use `render()` as the means of initiating data-fetching. We could simply render the application once, see what data it needed, fetch that data, and render again. This sounds great, but the problem is that *components use data to figure out what to render!* In other words, this would force data-fetching to be staged: first render the root and see what data it needs, then render its children and see what they need, all the way down the tree. If each stage incurs network request, rendering would require slow, serial roundtrips. We needed a way to determine all the data needs up-front or *statically*.

We ultimately settled on static methods; components would effectively return a query-tree, separate from the view-tree, describing their data dependencies. Relay could then use this query-tree to fetch all the information needed in a single stage and use it to render the components. The problem was finding an appropriate mechanism to describe the query-tree, and a way to efficiently fetch it from the server (i.e. in a single network request). This is the perfect use-case for GraphQL because it provides a syntax for *describing data-dependencies as data*, without dictating any particular API. Note that Promises and Observables are often suggested as alternatives, but they represent *opaque commands* and preclude various optimizations such as query batching.

## Data Components aka Containers

Relay allows developers to annotate their React components with data dependencies by creating **containers**. These are regular React components that wrap the originals. A key design constraint is that React components are meant to be reusable, so Relay containers must be too. For example, a `<Story>` component might implement a view for rendering any `Story` item. The actual story to render would be determined by the data passed to the component: `<Story story={ ... } />`. The equivalent in GraphQL are **fragments**: named query snippets that specify what data to fetch *for an object of a given type*. We might describe the data needed by `<Story>` as follows:

```
fragment on Story {
  text,
  author {
    name,
    photo
  }
}
```

And this fragment can then be used to define the Story container:

```javascript
// Plain React component.
// Usage: `<Story story={ ... } />`
class Story extends React.Component { ... }

// "Higher-order" component that wraps `<Story>`
var StoryContainer = Relay.createContainer(Story, {
  fragments: {
    // Define a fragment with a name matching the `story` prop expected above
    story: () => Relay.QL`
      fragment on Story {
        text,
        author { ... }
      }
    `
  }
})
```

## Rendering

In React, rendering a view requires two inputs: the *component* to render, and a *root* DOM (UI) node to render into. Rendering Relay containers is similar: we need a *container* to render, and a *root* in the graph from which to start our query. We also must ensure that the queries for the container are executed and may want to show a loading indicator while data is being fetched. Similar to `ReactDOM.render(component, domNode)`, Relay provides `<RelayRootContainer Component={...} route={...}>` for this purpose. The component is the item to render, and the route provides queries that specify *which* item to fetch. Here's how we might render `<StoryContainer>`:

```javascript
ReactDOM.render(
  <RelayRootContainer
    Component={StoryContainer}
    route={
      queries: {
        story: () => Relay.QL`
          query {
            node(id: "123") /* our `Story` fragment will be added here */
          }
        `
      },
    }
  />,
  rootEl
)
```

`RelayRootContainer` can then orchestrate the fetching of the queries; diffing them against cached data, fetching any missing information, updating the cache, and finally rendering `StoryContainer` once the data is available. The default is to render nothing while data is fetching, but the loading view can be customized via the `renderLoading` prop. Just as React allows developers to render views without directly manipulating the underlying view, Relay and `RelayRootContainer` remove the need to directly communicate with the network.

## Data Masking

With typical approaches to data-fetching we found that it was common for two components to have *implicit dependencies*. For example `<StoryHeader>` might use some data without directly ensuring that the data was fetched. This data would often be fetched by some other part of the system, such as `<Story>`. Then when we changed `<Story>` and removed that data-fetching logic, `<StoryHeader>` would suddenly and inexplicably break. These types of bugs are not always immediately apparent, especially in larger applications developed by larger teams. Manual and automated testing can only help so much: this is exactly the type of systematic problem that is better solved by a framework.

We've seen that Relay containers ensure that GraphQL fragments are fetched *before* the component is rendered. But containers also provide another benefit that isn't immediately obvious: **data masking**. Relay only allows components to access data they specifically ask for in `fragments` — nothing more. So if one component queries for a Story's `text`, and another for its `author`, each can see *only* the field that they asked for. In fact, components can't even see the data requested by their *children*: that would also break encapsulation.

Relay also goes further: it uses opaque identifiers on `props` to validate that we've explicitly fetched the data for a component before rendering it. If `<Story>` renders `<StoryHeader>` but forgets to include its fragment, Relay will warn that the data for `<StoryHeader>` is missing. In fact, Relay will warn *even if* some other component happened to fetch the same data required by `<StoryHeader>`. This warning tells us that although things *might* work now they're highly likely to break later.

# Conclusion

GraphQL provides a powerful tool for building efficient, decoupled client applications. Relay builds on this functionality to provide a framework for **declarative data-fetching**. By separating *what* data to fetch from *how* it is fetched, Relay helps developers build applications that are robust, transparent, and performant by default. It's a great compliment to the component-centric way of thinking championed by React. While each of these technologies — React, Relay, and GraphQL — are powerful on their own, the combination is a **UI platform** that allows us to *move fast* and *ship high-quality apps at scale*.
