---
id: fetching-queries
title: Fetching Queries
slug: /guided-tour/accessing-data-without-react/fetching-queries/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';


## Fetching Queries

If you want to fetch a query outside of React, you can use the **`fetchQuery`** function, which returns an observable:

```js
import type {AppQuery} from 'AppQuery.graphql';

const {fetchQuery} = require('react-relay');

fetchQuery<AppQuery>(
  environment,
  graphql`
    query AppQuery($id: ID!) {
      user(id: $id) {
        name
      }
    }
  `,
  {id: 4},
)
.subscribe({
  start: () => {...},
  complete: () => {...},
  error: (error) => {...},
  next: (data) => {...}
});
```

* `fetchQuery` will automatically save the fetched data to the in-memory Relay store, and notify any components subscribed to the relevant data.
* `fetchQuery` will ***NOT*** retain the data for the query, meaning that it is not guaranteed that the data will remain saved in the Relay store at any point after the request completes. If you wish to make sure that the data is retained outside of the scope of the request, you need to call `environment.retain()` directly on the query to ensure it doesn't get deleted. See for more details.
* The data provided in the `next` callback represents a snapshot of the query data read from the Relay store at the moment a payload was received from the server.
* Note that we specify the `AppQuery` Flow type; this ensures that the type of the data provided by the observable matches the shape of the query, and enforces that the `variables` passed as input to `fetchQuery` match the type of the variables expected by the query.


If desired, you can convert the request into a Promise using `**.toPromise()**`. Note that toPromise will start the query and return a Promise that will resolve when the *first* piece of data returns from the server and *cancel further processing*. That means any deferred or 3D data in the query may not be processed. **We generally recommend against using toPromise() for this reason.**

```js
import type {AppQuery} from 'AppQuery.graphql';

const {fetchQuery} = require('react-relay');

fetchQuery<AppQuery>(
  environment,
  graphql`
    query AppQuery($id: ID!) {
      user(id: $id) {
        name
      }
    }
  `,
  {id: 4},
)
.toPromise() // NOTE: don't use, this can cause data to be missing!
.then(data => {...})
.catch(error => {...};
```

* The returned Promise that resolves to the query data, read out from the store when the first network response is received from the server. If the request fails, the promise will reject
* Note that we specify the `AppQuery` Flow type; this ensures that the type of the data the the promise will resolve to matches the shape of the query, and enforces that the `variables` passed as input to `fetchQuery` match the type of the variables expected by the query.


> See also our API Reference for [fetchQuery](../../../api-reference/fetch-query/).


<DocsRating />
