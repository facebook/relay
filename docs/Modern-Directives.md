---
id: relay-directives
title: Directives
---

Relay Modern uses directives to add additional information to queries, later used by the relay-compiler to generate appropriate runtime artifacts. These directives only appear in your application code and are removed from requests sent to your GraphQL server. 

Note: The relay-compiler will maintain any directives supported by your server (such as `@include` or `@skip`) so they remain part of the request to the GraphQL server and won't alter generated runtime artifacts.

## `@connection(key: String!, filters: [String])`

Supported in both compat and modern mode. When using the pagination container, Relay expects the connection field to be annotated with `@connection` directive, for more detailed information and example, please go to [`PaginationContainer`](./pagination-container.html#connection-directive).

## `@relay(plural: Boolean)`

Supported in classic, compat and modern mode. Detailed usage is explained in [`Relay.QL`](./api-reference-relay-ql.html#array-fields).

## `@relay(mask: Boolean)`

While typically Relay only provides the data for fields explicitly requested by a component's fragment, `@relay(mask: false)` can be added to a fragment spread to not mask that data, recursively including the data from the fields of the referenced fragment.

This may be helpful to reduce redundant fragments when dealing with nested or recursive data within a single Component.

Keep in mind that it is typically considered an **anti-pattern** to create a single fragment shared across many containers. Abusing this directive could result in over-fetching in your application.

In the example below, the `user` prop will include the data for `id` and `name` fields wherever `...Component_internUser` is included, instead of Relay's normal behavior to mask those fields.

```javascript
module.exports = createFragmentContainer(
  ({ user }) => ...,
  graphql`
    fragment Component_user on User {
      internUser {
        manager {
          ...Component_internUser @relay(mask: false)
        }
        .... on Employee {
          admins {
            ...Component_internUser @relay(mask: false)
          }
          reports {
            ...Component_internUser @relay(mask: false)
          }
        }
      }
    }

    fragment Component_internUser on InternUser {
      id
      name
    }
  `,
);
```

## `@argumentDefinitions and @arguments`

Supported in modern mode. These directives are used to allow local variables in a fragment. They are commonly used with `createRefetchContainer` and `createPaginationContainer`. In the example below, the `Search` component will be initially rendered as a child of a `QueryRenderer`. The `QueryRenderer` will fetch the data for this fragment using the `defaultValues` provided by the `@argumentDefinitions` directive. Since these variables are local, they are not passed to the `QueryRenderer`'s `variables` prop.

Later, when `this.props.relay.refetch` is invoked inside the `Search` component, new values for these variables can be provided. The `@arguments` directive on the `Search_viewer` fragment will tell Relay to use the global variables provided to `SearchRefetchQuery` in the `Search_viewer` fragment.

```javascript
const SearchRefetchContainer = createRefetchContainer(
  Search,
  {
    viewer: graphql`
      fragment Search_viewer on Viewer @argumentDefinitions(
          query: { type: "String", defaultValue: "" }
          hasQuery: { type: "Boolean", defaultValue: false }
      ) {
        search(query: $query) @include(if: $hasQuery) {
          searchResultsList {
            value
          }
        }
      }
    `,
  },
  graphql`
    query SearchRefetchQuery(
      $query: String = ""
      $hasQuery: Boolean! 
    ) {
      viewer {
        ...Search_viewer @arguments(query: $query, hasQuery: $hasQuery)
      }
    }
  `,
);
```
