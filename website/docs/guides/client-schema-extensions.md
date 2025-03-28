---
id: client-schema-extensions
title: Client Schema Extensions
slug: /guides/client-schema-extensions/
description: Relay guide to client schema extensions
keywords:
- client
- schema
- extension
- commitLocalUpdate
---

import DocsRating from '@site/src/core/DocsRating';

:::note
See also [the local data updates](../../guided-tour/updating-data/local-data-updates/) and [client-only data](../../guided-tour/updating-data/client-only-data/) sections of the guided tour.
:::note

Relay can be used to read and write local data, and act as a single source of truth for _all_ data in your client application.

The Relay Compiler fully supports client-side extensions of the schema, which allows you to define local fields and types.

## Table of Contents:

-   [Extending the server schema](#extending-the-server-schema)
-   [Querying local state](#querying-local-state)
-   [Mutating local state](#mutating-local-state)
-   [Initial local state](#initial-local-state)

## Extending the server schema

To extend the server schema, create a new `.graphql` file inside your `--src`
directory.  Let's call it `./src/clientSchema.graphql`.  This file needs to be
referenced in the `"schemaExtensions"` of your Relay config, either directly or
via its folder.

This schema describes what local data can be queried on the client.
It can even be used to extend an existing server schema.

For example, we can create a new type called `Note`:

```graphql
type Note {
  id: ID!
  title: String
  body: String
}
```

And then extend the server schema type `User`, with a list of `Note`, called `notes`.

```graphql
extend type User {
  notes: [Note]
}
```

## Querying local state

Accessing local data is no different from querying your GraphQL server, although you are required to include at least one server field in the query.
The field can be from the server schema, or it can be schema agnostic, like an introspection field (e.g. `__typename`).

Here, we use [useLazyLoadQuery](../../api-reference/use-lazy-load-query) to get the current `User` via the `viewer` field, along with their id, name and the local list of notes.

```javascript
// Example.js
import * as React from 'react';
import { useLazyLoadQuery, graphql } from 'react-relay';

const Example = (props) => {
  const data = useLazyLoadQuery(graphql`
    query ExampleQuery {
      viewer {
        id
        name
        notes {
          id
          title
          body
        }
      }
    }
  `, {});
  // ...
}
```

## Mutating local state

All local data lives in the [Relay Store](../../api-reference/store/).

Updating local state can be done with any `updater` function.

The `commitLocalUpdate` function is especially ideal for this, because writes to local state are usually executed outside of a mutation.

To build upon the previous example, let's try creating, updating and deleting a `Note` from the list of `notes` on `User`.

### Create

```javascript
import {commitLocalUpdate} from 'react-relay';

let tempID = 0;

function createUserNote(environment) {
  commitLocalUpdate(environment, store => {
    const user = store.getRoot().getLinkedRecord('viewer');
    const userNoteRecords = user.getLinkedRecords('notes') || [];

    // Create a unique ID.
    const dataID = `client:Note:${tempID++}`;

    //Create a new note record.
    const newNoteRecord = store.create(dataID, 'Note');

    // Add the record to the user's list of notes.
    user.setLinkedRecords([...userNoteRecords, newNoteRecord], 'notes');
  });
}
```

Note that since this record will be rendered by the `ExampleQuery` via `useLazyLoadQuery`, the query data will automatically be retained and won't be garbage collected.

If no component is rendering the local data and you want to manually retain it, you can do so by calling `environment.retain()`:

```javascript
import {createOperationDescriptor, getRequest} from 'relay-runtime';

// Create a query that references that record
const localDataQuery = graphql`
  query LocalDataQuery {
    viewer {
      notes {
        __typename
      }
    }
  }
`;

// Create an operation descriptor for the query
const request = getRequest(localDataQuery);
const operation = createOperationDescriptor(request, {} /* variables */);


// Tell Relay to retain this operation so any data referenced by it isn't garbage collected
// In this case, all the notes linked to the `viewer` will be retained
const disposable = environment.retain(operation);


// Whenever you don't need that data anymore and it's okay for Relay to garbage collect it,
// you can dispose of the retain
disposable.dispose();
```

### Update

```javascript
import {commitLocalUpdate} from 'react-relay';

function updateUserNote(environment, dataID, body, title) {
  commitLocalUpdate(environment, store => {
    const note = store.get(dataID);

    note.setValue(body, 'body');
    note.setValue(title, 'title')
  });
}
```

### Delete

```javascript
import {commitLocalUpdate} from 'react-relay';

function deleteUserNote(environment, dataID) {
  commitLocalUpdate(environment, store => {
    const user = store.getRoot().getLinkedRecord('viewer');
    const userNoteRecords = user.getLinkedRecords('notes');

    // Remove the note from the list of user notes.
    const newUserNoteRecords = userNoteRecords.filter(x => x.getDataID() !== dataID);

    // Delete the note from the store.
    store.delete(dataID);

    // Set the new list of notes.
    user.setLinkedRecords(newUserNoteRecords, 'notes');
  });
}
```

## Initial local state

All new client-side schema fields default to `undefined` value. Often however, you will want to set the initial state before querying local data.
You can use an updater function via `commitLocalUpdate` to prime local state.

```javascript
import {commitLocalUpdate} from 'react-relay';

commitLocalUpdate(environment, store => {
  const user = store.getRoot().getLinkedRecord('viewer');

  // initialize user notes to an empty array.
  user.setLinkedRecords([], 'notes');
});
```

<DocsRating />
