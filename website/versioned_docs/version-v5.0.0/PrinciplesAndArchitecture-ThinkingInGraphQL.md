---
id: thinking-in-graphql
title: Thinking in GraphQL
original_id: thinking-in-graphql
---
GraphQL presents new ways for clients to fetch data by focusing on the needs of product developers and client applications. It provides a way for developers to specify the precise data needed for a view and enables a client to fetch that data in a single network request. Compared to traditional approaches such as REST, GraphQL helps applications to fetch data more efficiently (compared to resource-oriented REST approaches) and avoid duplication of server logic (which can occur with custom endpoints). Furthermore, GraphQL helps developers to decouple product code and server logic. For example, a product can fetch more or less information without requiring a change to every relevant server endpoint. It's a great way to fetch data.

In this article we'll explore what it means to build a GraphQL client framework and how this compares to clients for more traditional REST systems. Along the way we'll look at the design decisions behind Relay and see that it's not just a GraphQL client but also a framework for _declarative data-fetching_. Let's start at the beginning and fetch some data!

## Fetching Data

Imagine we have a simple application that fetches a list of stories, and some details about each one. Here's how that might look in resource-oriented REST:

```javascript
// Fetch the list of story IDs but not their details:
rest.get('/stories').then(stories =>
  // This resolves to a list of items with linked resources:
  // `[ { href: "http://.../story/1" }, ... ]`
  Promise.all(stories.map(story =>
    rest.get(story.href) // Follow the links
  ))
).then(stories => {
  // This resolves to a list of story items:
  // `[ { id: "...", text: "..." } ]`
  console.log(stories);
});
```

Note that this approach requires _n+1_ requests to the server: 1 to fetch the list, and _n_ to fetch each item. With GraphQL we can fetch the same data in a single network request to the server (without creating a custom endpoint that we'd then have to maintain):

```javascript
graphql.get(`query { stories { id, text } }`).then(
  stories => {
    // A list of story items:
    // `[ { id: "...", text: "..." } ]`
    console.log(stories);
  }
);
```

So far we're just using GraphQL as a more efficient version of typical REST approaches. Note two important benefits in the GraphQL version:

-   All data is fetched in a single round trip.
-   The client and server are decoupled: the client specifies the data needed instead of _relying on_ the server endpoint to return the correct data.

For a simple application that's already a nice improvement.

## Client Caching

Repeatedly refetching information from the server can get quite slow. For example, navigating from the list of stories, to a list item, and back to the list of stories means we have to refetch the whole list. We'll solve this with the standard solution: _caching_.

In a resource-oriented REST system, we can maintain a **response cache** based on URIs:

```javascript
var _cache = new Map();
rest.get = uri => {
  if (!_cache.has(uri)) {
    _cache.set(uri, fetch(uri));
  }
  return _cache.get(uri);
};
```

Response-caching can also be applied to GraphQL. A basic approach would work similarly to the REST version. The text of the query itself can be used as a cache key:

```javascript
var _cache = new Map();
graphql.get = queryText => {
  if (!_cache.has(queryText)) {
    _cache.set(queryText, fetchGraphQL(queryText));
  }
  return _cache.get(queryText);
};
```

Now, requests for previously cached data can be answered immediately without making a network request. This is a practical approach to improving the perceived performance of an application. However, this method of caching can cause problems with data consistency.

## Cache Consistency

With GraphQL it is very common for the results of multiple queries to overlap. However, our response cache from the previous section doesn't account for this overlap — it caches based on distinct queries. For example, if we issue a query to fetch stories:

```

query { stories { id, text, likeCount } }
```

and then later refetch one of the stories whose `likeCount` has since been incremented:

```

query { story(id: "123") { id, text, likeCount } }
```

We'll now see different `likeCount`s depending on how the story is accessed. A view that uses the first query will see an outdated count, while a view using the second query will see the updated count.

### Caching A Graph

The solution to caching GraphQL is to normalize the hierarchical response into a flat collection of **records**. Relay implements this cache as a map from IDs to records. Each record is a map from field names to field values. Records may also link to other records (allowing it to describe a cyclic graph), and these links are stored as a special value type that references back into the top-level map. With this approach each server record is stored _once_ regardless of how it is fetched.

Here's an example query that fetches a story's text and its author's name:

```

query {
  story(id: "1") {
    text,
    author {
      name
    }
  }
}
```

And here's a possible response:

```

query: {
  story: {
     text: "Relay is open-source!",
     author: {
       name: "Jan"
     }
  }
}
```

Although the response is hierarchical, we'll cache it by flattening all the records. Here is an example of how Relay would cache this query response:

```javascript
Map {
  // `story(id: "1")`
  1: Map {
    text: 'Relay is open-source!',
    author: Link(2),
  },
  // `story.author`
  2: Map {
    name: 'Jan',
  },
};
```

This is only a simple example: in reality the cache must handle one-to-many associations and pagination (among other things).

### Using The Cache

So how do we use this cache? Let's look at two operations: writing to the cache when a response is received, and reading from the cache to determine if a query can be fulfilled locally (the equivalent to `_cache.has(key)` above, but for a graph).

### Populating The Cache

Populating the cache involves walking a hierarchical GraphQL response and creating or updating normalized cache records. At first it may seem that the response alone is sufficient to process the response, but in fact this is only true for very simple queries. Consider `user(id: "456") { photo(size: 32) { uri } }` — how should we store `photo`? Using `photo` as the field name in the cache won't work because a different query might fetch the same field but with different argument values (e.g. `photo(size: 64) {...}`). A similar issue occurs with pagination. If we fetch the 11th to 20th stories with `stories(first: 10, offset: 10)`, these new results should be _appended_ to the existing list.

Therefore, a normalized response cache for GraphQL requires processing payloads and queries in parallel. For example, the `photo` field from above might be cached with a generated field name such as `photo_size(32)` in order to uniquely identify the field and its argument values.

### Reading From Cache

To read from the cache we can walk a query and resolve each field. But wait: that sounds _exactly_ like what a GraphQL server does when it processes a query. And it is! Reading from the cache is a special case of an executor where a) there's no need for user-defined field functions because all results come from a fixed data structure and b) results are always synchronous — we either have the data cached or we don't.

Relay implements several variations of **query traversal**: operations that walk a query alongside some other data such as the cache or a response payload. For example, when a query is fetched Relay performs a "diff" traversal to determine what fields are missing (much like React diffs virtual DOM trees). This can reduce the amount of data fetched in many common cases and even allow Relay to avoid network requests at all when queries are fully cached.

### Cache Updates

Note that this normalized cache structure allows overlapping results to be cached without duplication. Each record is stored once regardless of how it is fetched. Let's return to the earlier example of inconsistent data and see how this cache helps in that scenario.

The first query was for a list of stories:

```

query { stories { id, text, likeCount } }
```

With a normalized response cache, a record would be created for each story in the list. The `stories` field would store links to each of these records.

The second query refetched the information for one of those stories:

```

query { story(id: "123") { id, text, likeCount } }
```

When this response is normalized, Relay can detect that this result overlaps with existing data based on its `id`. Rather than create a new record, Relay will update the existing `123` record. The new `likeCount` is therefore available to _both_ queries, as well as any other query that might reference this story.

## Data/View Consistency

A normalized cache ensures that the _cache_ is consistent. But what about our views? Ideally, our React views would always reflect the current information from the cache.

Consider rendering the text and comments of a story along with the corresponding author names and photos. Here's the GraphQL query:

```

query {
  story(id: "1") {
    text,
    author { name, photo },
    comments {
      text,
      author { name, photo }
    }
  }
}
```

After initially fetching this story our cache might be as follows. Note that the story and comment both link to the same record as `author`:

```

// Note: This is pseudo-code for `Map` initialization to make the structure
// more obvious.
Map {
  // `story(id: "1")`
  1: Map {
    text: 'got GraphQL?',
    author: Link(2),
    comments: [Link(3)],
  },
  // `story.author`
  2: Map {
    name: 'Yuzhi',
    photo: 'http://.../photo1.jpg',
  },
  // `story.comments[0]`
  3: Map {
    text: 'Here\'s how to get one!',
    author: Link(2),
  },
}
```

The author of this story also commented on it — quite common. Now imagine that some other view fetches new information about the author, and her profile photo has changed to a new URI. Here's the _only_ part of our cached data that changes:

```

Map {
  ...
  2: Map {
    ...
    photo: 'http://.../photo2.jpg',
  },
}
```

The value of the `photo` field has changed; and therefore the record `2` has also changed. And that's it. Nothing else in the _cache_ is affected. But clearly our _view_ needs to reflect the update: both instances of the author in the UI (as story author and comment author) need to show the new photo.

A standard response is to "just use immutable data structures" — but let's see what would happen if we did:

```

ImmutableMap {
  1: ImmutableMap // same as before
  2: ImmutableMap {
    ... // other fields unchanged
    photo: 'http://.../photo2.jpg',
  },
  3: ImmutableMap // same as before
}
```

If we replace `2` with a new immutable record, we'll also get a new immutable instance of the cache object. However, records `1` and `3` are untouched. Because the data is normalized, we can't tell that `story`'s contents have changed just by looking at the `story` record alone.

### Achieving View Consistency

There are a variety of solutions for keeping views up to date with a flattened cache. The approach that Relay takes is to maintain a mapping from each UI view to the set of IDs it references. In this case, the story view would subscribe to updates on the story (`1`), the author (`2`), and the comments (`3` and any others). When writing data into the cache, Relay tracks which IDs are affected and notifies _only_ the views that are subscribed to those IDs. The affected views re-render, and unaffected views opt-out of re-rendering for better performance (Relay provides a safe but effective default `shouldComponentUpdate`). Without this strategy, every view would re-render for even the tiniest change.

Note that this solution will also work for _writes_: any update to the cache will notify the affected views, and writes are just another thing that updates the cache.

## Mutations

So far we've looked at the process of querying data and keeping views up to date, but we haven't looked at writes. In GraphQL, writes are called **mutations**. We can think of them as queries with side effects. Here's an example of calling a mutation that might mark a given story as being liked by the current user:

```

// Give a human-readable name and define the types of the inputs,
// in this case the id of the story to mark as liked.
mutation StoryLike($storyID: String) {
   // Call the mutation field and trigger its side effects
   storyLike(storyID: $storyID) {
     // Define fields to re-fetch after the mutation completes
     likeCount
   }
}
```

Notice that we're querying for data that _may_ have changed as a result of the mutation. An obvious question is: why can't the server just tell us what changed? The answer is: it's complicated. GraphQL abstracts over _any_ data storage layer (or an aggregation of multiple sources), and works with any programming language. Furthermore, the goal of GraphQL is to provide data in a form that is useful to product developers building a view.

We've found that it's common for the GraphQL schema to differ slightly or even substantially from the form in which data is stored on disk. Put simply: there isn't always a 1:1 correspondence between data changes in your underlying _data storage_ (disk) and data changes in your _product-visible schema_ (GraphQL). The perfect example of this is privacy: returning a user-facing field such as `age` might require accessing numerous records in our data-storage layer to determine if the active user is even allowed to _see_ that `age` (Are we friends? Is my age shared? Did I block you? etc.).

Given these real-world constraints, the approach in GraphQL is for clients to query for things that may change after a mutation. But what exactly do we put in that query? During the development of Relay we explored several ideas — let's look at them briefly in order to understand why Relay uses the approach that it does:

-   Option 1: Re-fetch everything that the app has ever queried. Even though only a small subset of this data will actually change, we'll still have to wait for the server to execute the _entire_ query, wait to download the results, and wait to process them again. This is very inefficient.

-   Option 2: Re-fetch only the queries required by actively rendered views. This is a slight improvement over option 1. However, cached data that _isn't_ currently being viewed won't be updated. Unless this data is somehow marked as stale or evicted from the cache subsequent queries will read outdated information.

-   Option 3: Re-fetch a fixed list of fields that _may_ change after the mutation. We'll call this list a **fat query**. We found this to also be inefficient because typical applications only render a subset of the fat query, but this approach would require fetching all of those fields.

-   Option 4 (Relay): Re-fetch the intersection of what may change (the fat query) and the data in the cache. In addition to the cache of data Relay also remembers the queries used to fetch each item. These are called **tracked queries**. By intersecting the tracked and fat queries, Relay can query exactly the set of information the application needs to update and nothing more.

## Data-Fetching APIs

So far we looked at the lower-level aspects of data-fetching and saw how various familiar concepts translate to GraphQL. Next, let's step back and look at some higher-level concerns that product developers often face around data-fetching:

-   Fetching all the data for a view hierarchy.
-   Managing asynchronous state transitions and coordinating concurrent requests.
-   Managing errors.
-   Retrying failed requests.
-   Updating the local cache after receiving query/mutation responses.
-   Queuing mutations to avoid race conditions.
-   Optimistically updating the UI while waiting for the server to respond to mutations.

We've found that typical approaches to data-fetching — with imperative APIs — force developers to deal with too much of this non-essential complexity. For example, consider _optimistic UI updates_. This is a way of giving the user feedback while waiting for a server response. The logic of _what_ to do can be quite clear: when the user clicks "like", mark the story as being liked and send the request to the server. But the implementation is often much more complex. Imperative approaches require us to implement all of those steps: reach into the UI and toggle the button, initiate a network request, retry it if necessary, show an error if it fails (and untoggle the button), etc. The same goes for data-fetching: specifying _what_ data we need often dictates _how_ and _when_ it is fetched. Next, we'll explore our approach to solving these concerns with **Relay**.
