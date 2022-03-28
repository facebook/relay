---
id: thinking-in-relay
title: Thinking In Relay
original_id: thinking-in-relay
---
Relay's approach to data-fetching is heavily inspired by our experience with React. In particular, React breaks complex interfaces into reusable **components**, allowing developers to reason about discrete units of an application in isolation, and reducing the coupling between disparate parts of an application. Even more important is that these components are **declarative**: they allow developers to specify _what_ the UI should look like for a given state, and not have to worry about _how_ to show that UI. Unlike previous approaches that used imperative commands to manipulate native views (e.g. the DOM), React uses a UI description to automatically determine the necessary commands.

Let's look at some product use-cases to understand how we incorporated these ideas into Relay. We'll assume a basic familiarity with React.

## Fetching Data For a View

In our experience, the overwhelming majority of products want one specific behavior: fetch _all_ the data for a view hierarchy while displaying a loading indicator, and then render the _entire_ view once the data is ready.

One solution is to have a root component fetch the data for all its children. However, this would introduce coupling: every change to a component would require changing _any_ root component that might render it, and often some components between it and the root. This coupling could mean a greater chance for bugs and slow the pace of development. Ultimately, this approach doesn't take advantage of React's component model. The natural place for specifying data-dependencies was in _components_.

The next logical approach is to use `render()` as the means of initiating data-fetching. We could simply render the application once, see what data it needed, fetch that data, and render again. This sounds great, but the problem is that _components use data to figure out what to render!_ In other words, this would force data-fetching to be staged: first render the root and see what data it needs, then render its children and see what they need, all the way down the tree. If each stage incurs network request, rendering would require slow, serial roundtrips. We needed a way to determine all the data needs up-front or _statically_.

This is where GraphQL comes into play. Components specify one or multiple GraphQL fragments for some of their props describing their data requirements. Each GraphQL fragment has a unique name within an application which allows us to determine the query needed to fetch the full query tree in a build step and load all the required data in a single network request efficiently at runtime.

## Data Components aka Containers

Relay allows developers to annotate their React components with data dependencies by creating **containers**. These are regular React components that wrap the originals. A key design constraint is that React components are meant to be reusable, so Relay containers must be too. For example, a `<Story />` component might implement a view for rendering any `Story` item. The actual story to render would be determined by the data passed to the component: `<Story story={ ... } />`. The equivalent in GraphQL are **fragments**: named query snippets that specify what data to fetch _for an object of a given type_. We might describe the data needed by `<Story>` as follows:

```

fragment Story_story on Story {
  text
  author {
    name
    photo
  }
}
```

And this fragment can then be used to define the Story container:

```javascript
const {createFragmentContainer, graphql} = require('react-relay');

// Plain React component.
// Usage: `<Story story={ ... } />`
class Story extends React.Component { ... }

// Higher-order component that wraps `<Story />`
const StoryContainer = createFragmentContainer(Story, {
  // Define a fragment with a name matching the `story` prop expected above
  story: graphql`
    fragment Story_story on Story {
      text
      author {
        name
        photo
      }
    }
  `
})

```

## Rendering

In React, rendering a view requires two inputs: the _component_ to render, and a _root_ DOM (UI) node to render into. Rendering Relay containers is similar: we need a _container_ to render, and a _root_ in the graph from which to start our query. We also must ensure that the queries for the container are executed and may want to show a loading indicator while data is being fetched. Similar to `ReactDOM.render(component, domNode)`, Relay provides `<QueryRenderer query={...} variables={...} render={...}>` for this purpose. The `query` and `variables` define what data to fetch and `render` defines what to render. Here's how we might render `<StoryContainer>`:

```javascript
ReactDOM.render(
  <QueryRenderer
    query={graphql`
      query StoryQuery($storyID: ID!) {
        node(id: $storyID) {
          ...Story_story
        }
      }
    `}
    variables={{
      storyID: '123',
    }}
    render={(props, error) => {
      if (error) {
        return <ErrorView />;
      } else if (props) {
        return <StoryContainer story={props.story} />;
      } else {
        return <LoadingIndicator />;
      }
    }}
  />,
  rootElement
)

```

`QueryRenderer` will then fetch the data and render `StoryContainer` once the data is available. Just as React allows developers to render views without directly manipulating the underlying view, Relay removes the need to directly communicate with the network.

## Data Masking

With typical approaches to data-fetching we found that it was common for two components to have _implicit dependencies_. For example `<StoryHeader />` might use some data without directly ensuring that the data was fetched. This data would often be fetched by some other part of the system, such as `<Story />`. Then when we changed `<Story />` and removed that data-fetching logic, `<StoryHeader />` would suddenly and inexplicably break. These types of bugs are not always immediately apparent, especially in larger applications developed by larger teams. Manual and automated testing can only help so much: this is exactly the type of systematic problem that is better solved by a framework.

We've seen that Relay containers ensure that GraphQL fragments are fetched _before_ the component is rendered. But containers also provide another benefit that isn't immediately obvious: **data masking**. Relay only allows components to access data they specifically ask for in GraphQL fragments — nothing more. So if one component queries for a Story's `text`, and another for its `author`, each can see _only_ the field that they asked for. In fact, components can't even see the data requested by their _children_: that would also break encapsulation.

Relay also goes further: it uses opaque identifiers on `props` to validate that we've explicitly fetched the data for a component before rendering it. If `<Story />` renders `<StoryHeader />` but forgets to include its fragment, Relay will warn that the data for `<StoryHeader />` is missing. In fact, Relay will warn _even if_ some other component happened to fetch the same data required by `<StoryHeader />`. This warning tells us that although things _might_ work now they're highly likely to break later.

# Conclusion

GraphQL provides a powerful tool for building efficient, decoupled client applications. Relay builds on this functionality to provide a framework for **declarative data-fetching**. By separating _what_ data to fetch from _how_ it is fetched, Relay helps developers build applications that are robust, transparent, and performant by default. It's a great complement to the component-centric way of thinking championed by React. While each of these technologies — React, Relay, and GraphQL — are powerful on their own, the combination is a **UI platform** that allows us to _move fast_ and _ship high-quality apps at scale_.
