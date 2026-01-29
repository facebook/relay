# Organizing GraphQL Operations

In Relay, GraphQL operations (Mutations, Queries, and Subscriptions) have strict naming requirements. The operation name must begin with the module name, and end with the GraphQL operation type. The name also must be globally unique.

:::note
The "module/operation type" naming scheme originates from trying to enforce the uniqueness constraint. At Meta, Haste (a dependency management system for static resources) enforces that all module names are unique so using the module name in the operation name encourages globally unique operation names. Coupling the module name and operation name also makes it easier to locate a fragment/query/mutation if you know that name.
:::

For example:

1. A Mutation in the file `MyComponent.js` must be named with the scheme `MyComponent*Mutation`.
2. A Query in the file `MyComponent.react.js` must be named with the scheme `MyComponent*Query`.

A NewsFeed component may have mutations/queries that shouldn't logically start with `NewsFeed`, but Relay requires this _if they are defined in that file_.

### Recommended Organization For Mutations and Subscriptions

Put Mutations in their own hook module so the name is closer to _what the mutation does_ rather than _which component invokes it_. If the module name is correctly descriptive, it is fine to declare it in the same file.

If you are adding a Mutation for `Post`, like adding a comment to a post, you may create a new file titled `useAddPostComment.js`. Your mutation (in this file) will then be named `useAddPostCommentMutation`, which is a perfectly descriptive name.

### Recommended Organization for Queries and Fragments

Root components should have a single query that is tightly coupled to a component, since it describes that component's data dependencies. Queries and fragments should co-locate with their data-use code.
