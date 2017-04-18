---
id: upgrading-setvariables
title: Upgrading setVariables
layout: docs
category: Converting to Modern
permalink: docs/upgrading-setvariables.html
next: compatibility-cheatsheet
---

> Examples on how to migrate `this.props.setVariables` calls from the old API.

`this.props.setVariables` from the old API does not have a direct equivalent in the new API. A big reason for this change is that the new core no longer tracks how to refetch any specific sub-tree from the query. This makes the new core a lot faster, but requires explicit queries for how to fetch new data. Check out these four different scenarios:

## `initialVariables`

If the component doesn't actually use `setVariables()`, and just uses `initialVariables` to share values between JS and GraphQL, there are two alternative approaches:

- Inline the value in the GraphQL query, potentially annotating with a GraphQL comment (i.e. `# PAGE_SIZE`).
- Add the variable to the queries that use the fragment and pass it in when fetching the query. For this it can be useful to have a module with a collection of variables for your product.

## Pagination

Typical Relay Classic code:

    // counterexample
    this.props.relay.setVariables({
      count: count + 10,
    });

    initialVariables: {
      count: 10,
    },

    fragment on User {
      friends(first: $count) {
        # ...
      }
    }

This should be upgraded to use a [`PaginationContainer`](./PaginationContainer.html).

## Changing Arguments

Typical old code:

    // counterexample
    this.props.relay.setVariables({
      search: newSearchTerm,
    });

    initialVariables: {
      search: '',
    }

    fragment on User {
      friends(named: $search, first: 10) {
        # ...
      }
    }

This can be upgraded by using a [`RefetchContainer`](./RefetchContainer.html) which allows you to specify the exact query to use to fetch the new data.

## Show More

Typical old code:

    // counterexample
    this.props.relay.setVariables({
      showComments: true,
    });

    initialVariables: {
      showComments: false,
    }

    fragment on FeedbackTarget {
      comments(first: 10) @include(if: $showComments) {
        # ...
      }
    }

This can be upgraded by conditionally rendering a [`QueryRenderer`](./QueryRenderer.html) which will load the data once it is rendered. The code overhead of doing this is dramatically reduced with the new API.

Alternatively a [`RefetchContainer`](./RefetchContainer.html) can also be used.
