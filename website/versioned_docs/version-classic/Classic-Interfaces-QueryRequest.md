---
id: classic-interfaces-relay-query-request
title: RelayQueryRequest
original_id: classic-interfaces-relay-query-request
---
`RelayQueryRequest` encapsulates a query that Relay needs to send to the server. They are made available to network layers via the `sendQueries` method.

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

Gets a string representation of the GraphQL query.

### getVariables

```

getVariables(): {[name: string]: mixed}
```

Gets the variables used by the query. These variables should be serialized and sent in the GraphQL request.

### getID

```

getID(): string

```

Gets a unique identifier for this query. These identifiers are useful for assigning response payloads to their corresponding queries when sent in a single GraphQL request.

### getDebugName

```

getDebugName(): string

```

Gets a string name used to refer to this request for printing debug output.
