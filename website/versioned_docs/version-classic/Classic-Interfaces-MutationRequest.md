---
id: classic-interfaces-relay-mutation-request
title: RelayMutationRequest
original_id: classic-interfaces-relay-mutation-request
---
`RelayMutationRequest` encapsulates a mutation that Relay needs to send to the server. They are made available to network layers via the `sendMutation` method.

## Overview

_Methods_

<ul className="apiIndex">
  <li>
    <a href="#getquerystring">
      <pre>getQueryString()</pre>
    </a>
  </li>
  <li>
    <a href="#getvariables">
      <pre>getVariables()</pre>
    </a>
  </li>
  <li>
    <a href="#getfiles">
      <pre>getFiles()</pre>
    </a>
  </li>
  <li>
    <a href="#getid">
      <pre>getID()</pre>
    </a>
  </li>
  <li>
    <a href="#getdebugname">
      <pre>getDebugName()</pre>
    </a>
  </li>
</ul>

## Methods

### getQueryString

```

getQueryString(): string

```

Gets a string representation of the GraphQL mutation.

### getVariables

```

getVariables(): {[name: string]: mixed}
```

Gets the variables used by the mutation. These variables should be serialized and send in the GraphQL request.

### getFiles

```

getFiles(): ?{[key: string]: File}
```

Gets an optional map from name to File objects.

### getID

```

getID(): string

```

Gets a unique identifier for this mutation. These identifiers are useful for assigning response payloads to their corresponding mutations when sent in a single GraphQL request.

### getDebugName

```

getDebugName(): string

```

Gets a string name used to refer to this request for printing debug output.
