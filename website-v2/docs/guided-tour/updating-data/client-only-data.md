---
id: client-only-data
title: Client-Only Data
slug: /guided-tour/updating-data/client-only-data/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

## Client-Only Data (Client Schema Extensions)

Relay provides the ability to extend the GraphQL schema *on the client* (i.e. in the browser), via client schema extensions, in order to model data that only needs to be created, read and updated on the client. This can be useful to add small pieces of information to data that is fetched from the server, or to entirely model client-specific state to be stored and managed by Relay.

Client schema extensions allows you to modify existing types on the schema (e.g. by adding new fields to a type), or to create entirely new types that only exist in the client.


### Extending Existing Types

In order to extend an existing type, add a `.graphql` file to the appropriate schema extension directory (depending on the repo):

```graphql

extend type Comment {
  is_new_comment: Boolean
}
```

* In this example, we're using the `extend` keyword to extend an existing type, and we're adding a new field, `is_new_comment` to the existing `Comment` type, which we will be able to [read](#reading-client-only-data) in our components, and [update](#updating-client-only-data) when necessary using normal Relay APIs; you might imagine that we might use this field to render a different visual treatment for a comment if it's new, and we might set it when creating a new comment.
* Note that in order for Relay to pick up this extension, the file needs to be inside `html/js/relay/schema/` in www or `xplat/js/RKJSModules/Libraries/Relay/native/schema/facebook` in fbsource.  The file can be named anything, but we recommend naming it the same as the type you're extending; in this case: `Comment.graphql`.



### Adding New Types

You can define types using the same regular GraphQL syntax, by defining it inside a `.graphql` file in  `html/js/relay/schema/`:


```graphql

# You can define more than one type in a single file
enum FetchStatus {
  FETCHED
  PENDING
  ERRORED
}


type FetchState {
  # You can reuse client types to define other types
  status: FetchStatus

  # You can also reference regular server types
  started_by: User!
}

extend type Item {
  # You can extend server types with client-only types
  fetch_state: FetchState
}

```

* In this contrived example, we're defining 2 new client-only types, and `enum` and a regular `type`. Note that they can reference themselves as normal, and reference regular server defined types. Also note that we can extend server types and add fields that are of our client-only types.
* As mentioned previously, we will be able to [read](#reading-client-only-data) and [update](#updating-client-only-data) this data normally via Relay APIs.



### Reading Client-Only Data

We can read client-only data be selecting it inside [fragments](../../rendering/fragments/) or [queries](../../rendering/queries/) as normal:

```js
const data = *useFragment*(
  graphql`
    fragment CommentComponent_comment on Comment {

      # We can select client-only fields as we would any other field
      is_new_comment

      body {
        text
      }
    }
  `,
  props.user,
);
```



### Updating Client-Only Data

In order to update client-only data, you can do so regularly inside [mutation](../graphql-mutations/) or [subscription](../graphql-subscriptions/) updaters, or by using our primitives for doing [local updates](../local-data-updates/) to the store.


<DocsRating />
