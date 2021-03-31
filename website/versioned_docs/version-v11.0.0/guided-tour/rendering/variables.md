---
id: variables
title: Variables
slug: /guided-tour/rendering/variables/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

You may have noticed that the query declarations in our examples above contain references to an `$id` symbol inside the GraphQL code: these are [GraphQL Variables](https://graphql.org/learn/queries/#variables).

GraphQL variables are a construct that allows referencing dynamic values inside a GraphQL query. When fetching a query from the server, we also need to provide as input the actual set of values to use for the variables declared inside the query:

```graphql
query UserQuery($id: ID!) {

  # The value of $id is used as input to the user() call:
  user(id: $id) {
    id
    name
  }

}
```

In the above, `ID!` is the type of the `$id` variable. That is, it is a required ID.

When sending a network request to fetch the query above, we need to provide both the query, and the variables to be used for this particular execution of the query.  For example:

```
# Query:
query UserQuery($id: ID!) {
  # ...
}

# Variables:
{"id": 4}
```


<FbInternalOnly>

Fetching the above query and variables from the server would produce the following response, which can also be visualized in [GraphiQL](https://fburl.com/graphiql/kiuar058):

</FbInternalOnly>

<OssOnly>

Fetching the above query and variables from the server would produce the following response:

</OssOnly>

```json
{
  "data": {
    "user": {
      "id": "4",
      "name": "Mark Zuckerberg"
    }
  }
}
```

* Note that changing the value of the `id` variable used as input would of course produce a different response.

* * *

Fragments can also reference variables that have been declared by a query:

```graphql
fragment UserFragment on User {
  name
  profile_picture(scale: $scale) {
    uri
  }
}


query ViewerQuery($scale: Float!) {
  viewer {
    actor {
      ...UserFragment
    }
  }
}
```

* Even though the fragment above doesn't *declare* the `$scale` variable directly, it can still reference it. Doing so makes it so any query that includes this fragment, either directly or transitively, *must* declare the variable and its type, otherwise an error will be produced.
* In other words, *query variables are available globally by any fragment that is a descendant of the query*.
* A fragment which references a global variable can only be included (directly or transitively) in a query which defines that global variable.


In Relay, fragment declarations inside components can also reference query variables:

```js
function UserComponent(props: Props) {
  const data = useFragment(
    graphql`
    fragment UserComponent_user on User {
      name
      profile_picture(scale: $scale) {
        uri
      }
    }
    `,
    props.user,
  );

  return (...);
}
```

* The above fragment could be included by multiple queries, and rendered by different components, which means that any query that ends up rendering/including the above fragment *must* declare the `$scale` variable.
*  If any query that happens to include this fragment *doesn't* declare the `$scale` variable, an error will be produced by the Relay Compiler at build time, ensuring that an incorrect query never gets sent to the server (sending a query with missing variable declarations will also produce an error in the server).



## @arguments and @argumentDefinitions

However, in order to prevent bloating queries with global variable declarations, Relay also provides a way to declare variables that are scoped locally to a fragment using  the `@arguments` and `@argumentDefinitions` directives:

```js
/**
 * Declare a fragment that accepts arguments with @argumentDefinitions
 */

function PictureComponent(props) {
  const data = useFragment(
    graphql`
      fragment PictureComponent_user on User
        @argumentDefinitions(scale: {type: "Float!"}) {

        # *`**$scale**`* is a local variable here, declared above
        # as an argument *`**scale**`*, of type *`**Float!`*
        profile_picture(scale: $scale) {
          uri
        }
      }
    `,
    props.user,
  );
}
```

```js
/**
 * Include fragment using @arguments
 */

function UserComponent(props) {
  const data = useFragment(
    graphql`
      fragment UserComponent_user on User {
        name

        # Pass value of 2.0 for the *`*scale*`* variable
        ...PictureComponent_user @arguments(scale: 2.0)
      }
    `,
    props.user,
  );
}
```

```js
/**
 * Include same fragment using *_different_* @arguments
 */

function OtherUserComponent(props) {
  const data = useFragment(
    graphql`
      fragment OtherUserComponent_user on User {
        name

        # Pass a different value for the scale variable.
        # The value can be another local or global variable:
        ...PictureComponent_user @arguments(scale: $pictureScale)
      }
    `,
    props.user,
  );
}
```

* Note that when passing `@arguments` to a fragment, we can pass a literal value or pass another variable. The variable can be a global query variable, or another local variable declared via `@argumentDefinitions`.
* When we actually fetch `PictureComponent_user` as part of a query, the `scale` value passed to the `profile_picture` field will depend on the argument that was provided by the parent of `PictureComponent_user`:
    * For `UserComponent_user` the value of `$scale` will be 2.0.
    * For `OtherUserComponent_user`, the value of `$scale` will be whatever value we pass to the server for the `$pictureScale` variable when we fetch the query.


Fragments that expect arguments can also declare default values, making the arguments optional:

```js
/**
 * Declare a fragment that accepts arguments with default values
 */

function PictureComponent(props) {
  const data = useFragment(
    graphql`
      fragment PictureComponent_user on User
        @argumentDefinitions(scale: {type: "Float!", defaultValue: 2.0}) {

        # *`**$scale**`* is a local variable here, declared above
        # as an argument *`**scale**`*, of type *`**Float!` with a default value of *`2.0**`**
        profile_picture(scale: $scale) {
          uri
        }
      }
    `,
    props.user,
  );
}
```

```js
function UserComponent(props) {
  const data = useFragment(
    graphql`
      fragment UserComponent_user on User {
        name

        # Do not pass an argument, value for scale will be **`2.0**`**
        ...PictureComponent_user
      }
    `,
    props.user,
  );
}
```

* Not passing the argument to `PictureComponent_user` makes it use the default value for its locally declared `$scale` variable, in this case 2.0.



## Accessing GraphQL Variables At Runtime


If you want to access the variables that were set at the query root, the recommended approach is to pass the variables down the component tree in your application, using props, or your own application-specific context.

Relay currently does not expose the resolved variables (i.e. after applying argument definitions) for a specific fragment, and you should very rarely need to do so.




<DocsRating />
