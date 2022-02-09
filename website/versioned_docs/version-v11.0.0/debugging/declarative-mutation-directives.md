---
id: declarative-mutation-directives
title: Debugging Declarative Mutation Directives
slug: /debugging/declarative-mutation-directives/
---

import FbEnvHandlerExample from './fb/FbEnvHandlerExample.md';

If you see an error similar to:

```
RelayFBHandlerProvider: No handler defined for `deleteRecord`. [Caught in: An uncaught error was thrown inside `RelayObservable`.]
```

or

```
RelayModernEnvironment: Expected a handler to be provided for handle `deleteRecord`.
```

This probably means that you are using a Relay environment to which a `handlerProvider` is passed. However, the handler provider does not know how to accept the handles `"deleteRecord"`, `"appendEdge"` or `"prependEdge"`. If this is the case, you should return `MutationHandlers.DeleteRecordHandler`, `MutationHandlers.AppendEdgeHandler`, or `MutationHandlers.PrependEdgeHandler` respectively (these can be imported from `relay-runtime`).

<FbEnvHandlerExample />
