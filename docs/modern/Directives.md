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

## `@inline`

Supported in modern mode. `@inline` can be added to a fragment spread to hoist recursively the fields from the inlined fragment spread into the current fragment definitions. However keep in mind that it is still considered as an **anti-pattern** to create a util module that exports shared fragments. Abusing this directive could cause over-fetching issues.

```javascript
graphql`
  fragment Component_intern_user on InternUser {
    id
    name
  }
`
module.exports = createFragmentContainer(
  Component,
  graphql`
    fragment Component_user on User {
      intern_user {
        manager {
          ...Component_intern_user @inline
        }
        .... on Employee {
          admins {
            ...Component_intern_user @inline
          }
          reports {
            ...Component_intern_user @inline
          }
        }
      }
    }
  `,
);
```  

In the above example, `Component_user` will be transformed into the following fragment at compile time
```javascript
graphql`
  fragment Component_user on User {
    intern_user {
      manager {
        id
        name
      }
      .... on Employee {
        admins {
          id
          name
        }
        reports {
          id
          name
        }
      }
    }
  }

`
```
