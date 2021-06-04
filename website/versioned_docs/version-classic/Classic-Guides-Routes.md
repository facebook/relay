---
id: classic-guides-routes
title: Routes
original_id: classic-guides-routes
---
Routes are responsible for defining the entry points into a Relay application. But in order to understand why routes are necessary, we must first understand the difference between GraphQL queries and fragments.

<blockquote>
Note

Relay routes don't really implement any URL routing specific logic or work with History API. In the future we will maybe rename RelayRoute to be something more like RelayQueryRoots or RelayQueryConfig. For more information around why Relay doesn't provide URL-routing features, and suggestions for such solutions, see [this post](https://medium.com/@cpojer/relay-and-routing-36b5439bad9).

</blockquote>

## Queries vs. Fragments

In GraphQL, **queries** declare fields that exist on the root query type. For example, the following query might fetch the name of the user with an `id` of `123`:

```

query UserQuery {
  user(id: "123") {
    name,
  },
}
```

On the other hand, GraphQL **fragments** declare fields that exist on any arbitrary type. For example, the following fragment fetches the profile picture URI for _some_ `User`.

```

fragment UserProfilePhoto on User {
  profilePhoto(size: $size) {
    uri,
  },
}
```

Fragments can be embedded within other fragments or queries. For example, the above fragment could be used to fetch user `123`'s profile photo:

```

query UserQuery {
  user(id: "123") {
    ...UserProfilePhoto,
  },
}
```

However, the fragment could also fetch each of user `123`'s friends' profile photos:

```

query UserQuery {
  user(id: "123") {
    friends(first: 10) {
      edges {
        node {
          ...UserProfilePhoto,
        },
      },
    },
  },
}
```

Since Relay containers define fragments and not queries, they can be easily embedded in multiple contexts. Like React components, Relay containers are highly reusable.

## Routes and Queries

Routes are objects that define a set of root queries and input parameters. Here is a simple route that might be used to render user `123`'s profile:

```

var profileRoute = {
  queries: {
    // Routes declare queries using functions that return a query root. Relay
    // will automatically compose the `user` fragment from the Relay container
    // paired with this route on a Relay.RootContainer
    user: () => Relay.QL`
      # In Relay, the GraphQL query name can be optionally omitted.
      query { user(id: $userID) }
    `,
  },
  params: {
    // This `userID` parameter will populate the `$userID` variable above.
    userID: '123',
  },
  // Routes must also define a string name.
  name: 'ProfileRoute',
};
```

If we wanted to create an instance of this route for arbitrary users, we can subclass the `Relay.Route` abstract class. `Relay.Route` makes it easy to define a set of queries and required parameters to be re-used multiple times:

```

class ProfileRoute extends Relay.Route {
  static queries = {
    user: () => Relay.QL`
      query { user(id: $userID) }
    `,
  };
  static paramDefinitions = {
    // By setting `required` to true, `ProfileRoute` will throw if a `userID`
    // is not supplied when instantiated.
    userID: {required: true},
  };
  static routeName = 'ProfileRoute';
}
```

Now we can instantiate a `ProfileRoute` that fetches data for user `123`:

```

// Equivalent to the object literal we created above.
var profileRoute = new ProfileRoute({userID: '123'});
```

But now, we can also create routes for arbitrary user IDs. For example, if we wanted to construct a route that fetched data for a user defined by the `userID` query parameter, we might use:

```

window.addEventListener('popstate', () => {
  var userID = getQueryParamFromURI('userID', document.location.href);
  var profileRoute = new ProfileRoute({userID: userID});
  ReactDOM.render(
    <Relay.RootContainer
      Component={UserProfile}
      route={profileRoute}
    />,
    document.getElementById('app')
  );
});
```
