---
id: graphql-connections
title: Connection
layout: docs
category: GraphQL
permalink: docs/graphql-connections.html
indent: true
next: graphql-mutations
---

A faction has many ships in the Star Wars universe. Relay contains functionality
to make manipulating one-to-many relationships easy, using a standardized way
of expressing these one-to-many relationships. This standard connection
model offers ways of slicing and paginating through the connection.

Let's take the rebels, and ask for their first ship:

```
query RebelsShipsQuery {
  rebels {
    name,
    ships(first: 1) {
      edges {
        node {
          name
        }
      }
    }
  }
}
```

yields

```json
{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "ships": {
      "edges": [
        {
          "node": {
            "name": "X-Wing"
          }
        }
      ]
    }
  }
}
```

That used the `first` argument to `ships` to slice the result set down to the
first one. But what if we wanted to paginate through it? On each edge, a cursor
will be exposed that we can use to paginate. Let's ask for the first two this
time, and get the cursor as well:

```
query MoreRebelShipsQuery {
  rebels {
    name,
    ships(first: 2) {
      edges {
        cursor
        node {
          name
        }
      }
    }
  }
}
```

and we get back

```json
{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "ships": {
      "edges": [
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjA=",
          "node": {
            "name": "X-Wing"
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjE=",
          "node": {
            "name": "Y-Wing"
          }
        }
      ]
    }
  }
}
```

Notice that the cursor is a base64 string. That's the pattern from earlier: the
server is reminding us that this is an opaque string. We can pass this string
back to the server as the `after` argument to the `ships` field, which will let
us ask for the next three ships after the last one in the previous result:

```
query EndOfRebelShipsQuery {
  rebels {
    name,
    ships(first: 3 after: "YXJyYXljb25uZWN0aW9uOjE=") {
      edges {
        cursor,
        node {
          name
        }
      }
    }
  }
}
```

gives us

```json

{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "ships": {
      "edges": [
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjI=",
          "node": {
            "name": "A-Wing"
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjM=",
          "node": {
            "name": "Millenium Falcon"
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjQ=",
          "node": {
            "name": "Home One"
          }
        }
      ]
    }
  }
}
```

Sweet! Let's keep going and get the next four!

```
query RebelsQuery {
  rebels {
    name,
    ships(first: 4 after: "YXJyYXljb25uZWN0aW9uOjQ=") {
      edges {
        cursor,
        node {
          name
        }
      }
    }
  }
}
```

yields

```json
{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "ships": {
      "edges": []
    }
  }
}
```

Hm. There were no more ships; guess there were only five in the system for
the rebels. It would have been nice to know that we'd reached the
end of the connection, without having to do another round trip in order
to verify that. The connection model exposes this capability with a type
called `PageInfo`. So let's issue the two queries that got us ships again,
but this time ask for `hasNextPage`:

```
query EndOfRebelShipsQuery {
  rebels {
    name,
    originalShips: ships(first: 2) {
      edges {
        node {
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
    moreShips: ships(first: 3 after: "YXJyYXljb25uZWN0aW9uOjE=") {
      edges {
        node {
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}
```

and we get back

```json
{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "originalShips": {
      "edges": [
        {
          "node": {
            "name": "X-Wing"
          }
        },
        {
          "node": {
            "name": "Y-Wing"
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": true
      }
    },
    "moreShips": {
      "edges": [
        {
          "node": {
            "name": "A-Wing"
          }
        },
        {
          "node": {
            "name": "Millenium Falcon"
          }
        },
        {
          "node": {
            "name": "Home One"
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": false
      }
    }
  }
}
```

So on the first query for ships, GraphQL told us there was a next page,
but on the next one, it told us we'd reached the end of the connection.

Relay uses all of this functionality to build out abstractions around
connections, to make these easy to work with efficiently without having
to manually manage cursors on the client.

Complete details on how the server should behave are
available in the [GraphQL Cursor Connections](../graphql/connections.htm) spec.
