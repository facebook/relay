---
id: retaining-queries
title: Retaining Queries
slug: /guided-tour/accessing-data-without-react/retaining-queries/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

In order to manually retain a query so that the data it references isn’t garbage collected by Relay, we can use the `environment.retain` method:

```js
const {
  createOperationDescriptor,
  getRequest,
  graphql,
} = require('relay-runtime')

// Query graphql object
const query = graphql`...`;

// Construct Relay's internal representation of the query
const queryRequest = getRequest(query);
const queryDescriptor = createOperationDescriptor(
  queryRequest,
  variables
);

// Retain query; this will prevent the data for this query and
// variables from being gabrage collected by Relay
const disposable = environment.retain(queryDescriptor);

// Disposing of the disposable will release the data for this query
// and variables, meaning that it can be deleted at any moment
// by Relay's garbage collection if it hasn't been retained elsewhere
disposable.dispose();
```

> NOTE: Relay automatically manages the query data retention based on any mounted query components that are rendering the data, so you usually should not need to call retain directly within product code. For any advanced or special use cases, query data retention should usually be handled within infra-level code, such as a Router.


<DocsRating />
