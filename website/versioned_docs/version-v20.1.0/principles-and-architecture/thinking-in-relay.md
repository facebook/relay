---
id: thinking-in-relay
title: Thinking in Relay
slug: /principles-and-architecture/thinking-in-relay/
description: Relay guide to thinking in Relay
---

import DocsRating from '@site/src/core/DocsRating';

Relay's approach to data-fetching is heavily inspired by our experience with React. In particular, React breaks complex interfaces into reusable **components**, allowing developers to reason about discrete units of an application in isolation, and reducing the coupling between disparate parts of an application. Even more important is that these components are **declarative**: they allow developers to specify _what_ the UI should look like for a given state, and not have to worry about _how_ to show that UI. Unlike previous approaches that used imperative commands to manipulate native views (e.g. the DOM), React uses a UI description to automatically determine the necessary commands.

Let's look at some product use-cases to understand how we incorporated these ideas into Relay. We'll assume a basic familiarity with React.

## Fetching Data For a View

In our experience, the overwhelming majority of products want one specific behavior: fetch all the data for a view hierarchy while displaying a loading indicator, and then render the entire view once the data is available.

One solution is to have a root component declare and fetch the data required by it and all of its children. However, this would introduce coupling: any change to a child component would require changing any root component that might render it! This coupling could mean a greater chance for bugs and slow the pace of development.

Another logical approach is to have each component declare and fetch the data it requires. This sounds great. However, the problem is that a component may render different children based on the data it received. So, nested components will be unable to render and begin fetching their data until parent components' queries have completed. In other words, *this forces data fetching to proceed in stages:* first render the root and fetch the data it needs, then render its children and fetch their data, and so on until you reach leaf components. Rendering would require multiple slow, serial roundtrips.

Relay combines the advantages of both of these approaches by allowing components to specify what data they require, but to coalesce those requirements into a single query that fetches the data for an entire subtree of components. In other words, it determines *statically* (i.e. before your application runs; at the time you write your code) the requirements for an entire view!

This is achieved with the help of GraphQL. Functional components use one or more GraphQL <a href="../../guided-tour/rendering/fragments/">fragments</a> to describe their data requirements. These fragments are then nested within other fragments, and ultimately within queries. And when such a query is fetched, Relay will make a single network request for it and all of its nested fragments. In other words, the Relay runtime is then able to make a *single network request* for all of the data required by a view!

Let's dive deeper to understand how Relay achieves this feat.

## Specifying the data requirements of a component

With Relay, the data requirements for a component are specified with <a href="../../guided-tour/rendering/fragments/">fragments</a>. Fragments are named snippets of GraphQL that specify which fields to select from an object of a particular type. Fragments are written within GraphQL literals. For example, the following declares a GraphQL literal containing a fragment which selects an author's name and photo url:

```javascript
// AuthorDetails.react.js
const authorDetailsFragment = graphql`
  fragment AuthorDetails_author on Author {
    name
    photo {
      url
    }
  }
`;
```

This data is then read out from the store by calling the `useFragment(...)` hook in a functional React component. The actual author from which to read this data is determined by the second parameter passed to `useFragment`. For example:

```javascript
// AuthorDetails.react.js
export default function AuthorDetails(props) {
  const data = useFragment(authorDetailsFragment, props.author);
  // ...
}
```

This second parameter (`props.author`) is a fragment reference. Fragment references are obtained by **spreading** a fragment into another fragment or query. Fragments cannot be fetched directly. Instead, all fragments must ultimately be spread (either directly or transitively) into a query for the data to be fetched.

Let's take a look at one such query.

## Queries

In order to fetch that data, we might declare a query which spreads `AuthorDetails_author` as follows:

```javascript
// Story.react.js
const storyQuery = graphql`
  query StoryQuery($storyID: ID!) {
    story(id: $storyID) {
      title
      author {
        ...AuthorDetails_author
      }
    }
  }
`;
```

Now, we can fetch the query by calling `const data = useLazyLoadQuery(storyQuery, {storyID})`. At this point, `data.story.author` (if it is present; all fields are nullable by default) will be a fragment reference that we can pass to `AuthorDetails`. For example:

```javascript
// Story.react.js
function Story(props) {
  const data = useLazyLoadQuery(storyQuery, props.storyId);

  return (<>
    <Heading>{data?.story.title}</Heading>
    {data?.story?.author && <AuthorDetails author={data.story.author} />}
  </>);
}
```

Note what has happened here. We made a single network request which contained the data required by *both* the `Story` component *and* the `AuthorDetails` component! When that data was available, the entire view could render in a single pass.

## Data Masking

With typical approaches to data-fetching we found that it was common for two components to have _implicit dependencies_. For example `<Story />` might use some data without directly ensuring that the data was fetched. This data would often be fetched by some other part of the system, such as `<AuthorDetails />`. Then when we changed `<AuthorDetails />` and removed that data-fetching logic, `<Story />` would suddenly and inexplicably break. These types of bugs are not always immediately apparent, especially in larger applications developed by larger teams. Manual and automated testing can only help so much: this is exactly the type of systematic problem that is better solved by a framework.

We've seen that Relay ensures that the data for a view is fetched all at once. But Relay also provide another benefit that isn't immediately obvious: **data masking**. Relay only allows components to access data they specifically ask for in GraphQL fragments, and nothing more. So if one component queries for a Story's `title`, and another for its `text`, each can see _only_ the field that they asked for. In fact, components can't even see the data requested by their _children_: that would also break encapsulation.

Relay also goes further: it uses opaque identifiers on `props` to validate that we've explicitly fetched the data for a component before rendering it. If `<Story />` renders `<AuthorDetails />` but forgets to spread its fragment, Relay will warn that the data for `<AuthorDetails />` is missing. In fact, Relay will warn _even if_ some other component happened to fetch the same data required by `<AuthorDetails />`. This warning tells us that although things _might_ work now, they're highly likely to break later.

# Conclusion

GraphQL provides a powerful tool for building efficient, decoupled client applications. Relay builds on this functionality to provide a framework for **declarative data-fetching**. By separating _what_ data to fetch from _how_ it is fetched, Relay helps developers build applications that are robust, transparent, and performant by default. It's a great complement to the component-centric way of thinking championed by React. While each of these technologies — React, Relay, and GraphQL — are powerful on their own, the combination is a **UI platform** that allows us to _move fast_ and _ship high-quality apps at scale_.

<DocsRating />
