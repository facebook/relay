---
id: classic-api-reference-relay-store
title: Relay.Store
original_id: classic-api-reference-relay-store
---
The Relay `Store` provides an API for dispatching mutations to the server.

## Overview

_Methods_

<ul className="apiIndex">
  <li>
    <a href="#commitupdate-static-method">
      <pre>static commitUpdate(mutation, callbacks)</pre>
      Initiate processing of a mutation.
    </a>
  </li>
  <li>
    <a href="#applyupdate-static-method">
      <pre>static applyUpdate(mutation, callbacks)</pre>
      Adds a MutationTransaction to the queue without committing it.
    </a>
  </li>
</ul>

**Note:** Equivalent `applyUpdate` and `commitUpdate` methods are also
provided on the `this.props.relay` prop that is passed to components by
`Relay.Container`. These dispatch mutations in the context of the currently
active `Relay.Environment`.

## Methods

### commitUpdate (static method)

```

static commitUpdate(mutation: RelayMutation, callbacks: {
  onFailure?: (transaction: RelayMutationTransaction) => void;
  onSuccess?: (response: Object) => void;
}): RelayMutationTransaction

// Argument to `onFailure` callback
type Transaction = {
  getError(): ?Error;
}
```

The `commitUpdate` method is analogous to dispatching an action in Flux. Relay processes
the mutation as follows:

-   If the mutation defines an optimistic payload - a set of data to apply locally while waiting for the server response - Relay applies this change and updates any affected React components (note that optimistic updates do not overwrite known server data in the cache).
-   If the mutation would not 'collide' (overlap) with other pending mutations - as specified by its `getCollisionKey` implementation - it is sent to the server. If it would conflict, it is enqueued until conflicting mutations have completed.
-   When the server response is received, one of the callbacks is invoked:
    -   `onSuccess` is called if the mutation succeeded.
    -   `onFailure` is called if the mutation failed.

#### Example

```

var onSuccess = () => {
  console.log('Mutation successful!');
};
var onFailure = (transaction) => {
  var error = transaction.getError() || new Error('Mutation failed.');
  console.error(error);
};
var mutation = new MyMutation({...});

Relay.Store.commitUpdate(mutation, {onFailure, onSuccess});
```

### applyUpdate (static method)

```

static applyUpdate(mutation: RelayMutation, callbacks: {
  onFailure?: (transaction: RelayMutationTransaction) => void;
  onSuccess?: (response: Object) => void;
}): RelayMutationTransaction

```

The `applyUpdate` adds a mutation just like `update`, but does not commit it. It returns a `RelayMutationTransaction` that can be committed or rollbacked.

When the transaction is committed and the response is received from the server, one of the callbacks is invoked:

-   `onSuccess` is called if the mutation succeeded.
-   `onFailure` is called if the mutation failed.

#### Example

```

var onSuccess = () => {
  console.log('Mutation successful!');
};
var onFailure = (transaction) => {
  var error = transaction.getError() || new Error('Mutation failed.');
  console.error(error);
};
var mutation = new MyMutation({...});

var transaction = Relay.Store.applyUpdate(mutation, {onFailure, onSuccess});

transaction.commit();
```
