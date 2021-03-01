---
id: filling-in-missing-data
title: Filling in Missing Data
slug: /guided-tour/reusing-cached-data/filling-in-missing-data/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

import FbMissingFieldHandlers from './fb/FbMissingFieldHandlers.md';

## Filling in Missing Data (Missing Field Handlers)

In the previous section we covered how to reuse data that is fully or partially cached, however there are cases in which Relay can't automatically tell that it can reuse some of the data it already has from other queries in order to fulfill a specific query. Specifically, Relay knows how to reuse data that is cached for a query that has been fetched before; that is, if you fetch the exact same query twice, Relay will know that it has the data cached for that query the second time it tries to evaluate it.

However, when using different queries, there might still be cases where different queries point to the same data, which we'd want to be able to reuse. For example, imagine the following two queries:

```js
// Query 1

query UserQuery {
  user(id: 4) {
    name
  }
}
```

```js
// Query 2

query NodeQuery {
  node(id: 4) {
    ... on User {
      name
    }
  }
}
```


These two queries are different, but reference the exact same data. Ideally, if one of the queries was already cached in the store, we should be able to reuse that data when rendering the other query. However, Relay doesn't have this knowledge by default, so we need to configure it to encode the knowledge that a `node(id: 4)` *"is the same as"* `user(id: 4)`.

To do so, we can provide `missingFieldHandlers` to the `RelayEnvironment` which specifies this knowledge.

<FbMissingFieldHandlers />

```js
const {ROOT_TYPE, Environment} = require('relay-runtime');

const missingFieldHandlers = [
  {
    handle(field, record, argValues): ?string {
      if (
        record != null &&
        record.__typename === ROOT_TYPE &&
        field.name === 'user' &&
        argValues.hasOwnProperty('id')
      ) {
        // If field is user(id: $id), look up the record by the value of $id
        return argValues.id;
      }
      if (
        record != null &&
        record.__typename === ROOT_TYPE &&
        field.name === 'story' &&
        argValues.hasOwnProperty('story_id')
      ) {
        // If field is story(story_id: $story_id), look up the record by the
        // value of $story_id.
        return argValues.story_id;
      }
      return null;
    },
    kind: 'linked',
  },
];

const environment = new Environment({/*...*/, missingFieldHandlers});
```

* `missingFieldHandlers` is an array of *handlers*. Each handler must specify a `handle` function, and the kind of missing fields it knows how to handle. The 2 main types of fields that you'd want to handle are:
    * *'scalar'*: This represents a field that contains a scalar value, for example a number or a string.
    * *'linked'*: This represents a field that references another object, i.e. not a scalar.
* The `handle` function takes the field that is missing, the record that field belongs to, and any arguments that were passed to the field in the current execution of the query.
    * When handling a *'scalar'* field, the handle function should return a scalar value, in order to use as the value for a missing field
    * When handling a *'linked'* field*,* the handle function should return an *ID*, referencing another object in the store that should be use in place of the missing field. **
* As Relay attempts to fulfill a query from the local cache, whenever it detects any missing data, it will run any of the provided missing field handlers that match the field type before definitively declaring that the data is missing.



<DocsRating />
