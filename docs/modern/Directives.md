---
id: relay-directives
title: Directives
layout: docs
category: Relay Modern
permalink: docs/relay-directives.html
next: babel-plugin-relay
---

Relay Modern supports the following directives

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
