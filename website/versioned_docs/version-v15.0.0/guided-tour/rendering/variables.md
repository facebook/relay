---
id: variables
title: Variables
slug: /guided-tour/rendering/variables/
description: Relay guide to query variables
keywords:
- query
- variables
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

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

```graphql
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

Relay also provides a way to declare variables that are scoped locally to a fragment using the `@arguments` and `@argumentDefinitions` directives. Fragments that use local variables are easy to customize and reuse, since they do not depend on the value of global (query-level) variables.

```js
/**
 * Declare a fragment that accepts arguments with @argumentDefinitions
 */

function TaskView(props) {
  const data = useFragment(
    graphql`
      fragment TaskView_task on Task
        @argumentDefinitions(showDetailedResults: {type: "Boolean!"}) {
        name
        is_completed
        ... @include(if: $showDetailedResults) {
          description
        }
      }
    `,
    props.task,
  );
}
```

```js
/**
 * Include fragment using @arguments
 */

function TaskList(props) {
  const data = usePreloadedQuery(
    graphql`
      query TaskListQuery {
        todays_tasks {
          ...TaskView_task @arguments(showDetailedResults: true)
        }
        tomorrows_tasks {
          ...TaskView_task @arguments(showDetailedResults: false)
        }
      }
    `,
    props.queryRef,
  );
}
```

* Locally-scoped variables also make it easier to reuse a fragment from another query.
  * A query definition must list all variables that are used by any nested fragments, including in recursively-nested fragments.
  * Since a fragment can potentially be accessible from many queries, modifying a fragment that uses global variables can require changes to many query definitions.
  * This can also lead to awkward situations, like having multiple versions of the "same" variable, such as `$showDetailedResults` and `$showDetails`.

  * Since fragments with only locally-scoped variables do not use global variables, they do not suffer from this issue.

* Note that when passing `@arguments` to a fragment, we can pass a literal value or pass another variable. The variable can be a global query variable, a local variable declared via `@argumentDefinitions` or a literal (e.g. `42.0`).
* When we actually fetch `TaskView_task` as part of a query, the `showDetailedResults` value will depend on the argument that was provided by the parent of `TaskView_task`:

Fragments that expect arguments can also declare default values, making the arguments optional:

```js
/**
 * Declare a fragment that accepts arguments with default values
 */

function TaskView(props) {
  const data = useFragment(
    graphql`
      fragment TaskView_task on Task
        @argumentDefinitions(showDetailedResults: {type: "Boolean!", defaultValue: true}) {
        name
        is_completed
        ... @include(if: $showDetailedResults) {
          description
        }
      }
    `,
    props.task,
  );
}
```

```js
function TaskList(props) {
  const data = usePreloadedQuery(
    graphql`
      query TaskListQuery {
        todays_tasks {
          ...TaskView_task
        }
        tomorrows_tasks {
          ...TaskView_task @arguments(showDetailedResults: false)
        }
      }
    `,
    props.queryRef,
  );
}
```

* Not passing the argument to `TaskView_task` makes it use the default value for its locally declared `$showDetailedResult` variable.



## Accessing GraphQL Variables At Runtime


If you want to access the variables that were set at the query root, the recommended approach is to pass the variables down the component tree in your application, using props, or your own application-specific context.

Relay currently does not expose the resolved variables (i.e. after applying argument definitions) for a specific fragment, and you should very rarely need to do so.




<DocsRating />
