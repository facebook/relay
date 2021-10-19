---
id: classic-api-reference-relay-graphql-mutation
title: Relay.GraphQLMutation
original_id: classic-api-reference-relay-graphql-mutation
---
`Relay.GraphQLMutation` is a low-level API for modeling a GraphQL mutation.

This is the lowest level of abstraction at which product code may deal with mutations in Relay, and it corresponds to the mutation operation ("a write followed by a fetch") described in [the GraphQL Specification](https://spec.graphql.org/June2018/#sec-Language.Operations). You specify the mutation, the inputs, and the query.

`Relay.GraphQLMutation` doesn't provide any bells and whistles such as fat queries or tracked queries (that is, automatic synthesis at runtime of the mutation query to be sent to the server), instead having the user define a static and explicit query. Restricting yourself to the low-level API is a useful preparatory step that will help you ready your codebase for migration to the new static Relay core. In the meantime, if you want those dynamic features, you can opt in to the higher-level `Relay.Mutation` API.

## Overview

_Properties_

<ul className="apiIndex">
  <li>
    <a href="#create-static-method">
      <pre>static create(mutation, variables, environment)</pre>
      Create a static mutation
    </a>
  </li>
  <li>
    <a href="#createwithfiles-static-method">
      <pre>static createWithFiles(mutation, variables, files, environment)</pre>
      Create a static mutation that accepts a "files" object
    </a>
  </li>
</ul>

_Methods_

<ul className="apiIndex">
  <li>
    <a href="#constructor">
      <pre>constructor(query, variables, files, environment, callbacks, collisionKey)</pre>
    </a>
  </li>
  <li>
    <a href="#applyoptimistic">
      <pre>applyOptimistic(optimisticQuery, optimisticResponse, configs)</pre>
    </a>
  </li>
  <li>
    <a href="#commit">
      <pre>commit(configs)</pre>
    </a>
  </li>
  <li>
    <a href="#rollback">
      <pre>rollback()</pre>
    </a>
  </li>
</ul>

## Properties

### create (static method)

```

static create(
  mutation: RelayConcreteNode,
  variables: Object,
  environment: RelayEnvironmentInterface
): RelayGraphQLMutation;
```

Convenience method that wraps the constructor, passing some default parameters and returning an instance.

#### Example

```{"{"}16-20{"}"}

const environment = new Relay.Environment();
const query = Relay.QL`mutation FeedbackLikeMutation {
  feedbackLike(input: $input) {
    clientMutationId
    feedback {
      doesViewerLike
    }
  }
}`;
const variables = {
  input: {
    feedbackId: 'aFeedbackId',
  },
};

const mutation = Relay.GraphQLMutation.create(
  query,
  variables,
  environment
);
```

Note: In most cases, it is possible to rely on the default singleton instance of the environment, which is exposed as `Relay.Store`.

See also: [GraphQLMutation &gt; Constructor](#constructor)

### createWithFiles (static method)

Convenience method that wraps the constructor, passing some default parameters and returning an instance.

```

static createWithFiles(
  mutation: RelayConcreteNode,
  variables: Variables,
  files: FileMap,
  environment: RelayEnvironmentInterface
): RelayGraphQLMutation;
```

#### Example

```{"{"}7-11{"}"}

// Given a `files` object of:
//
//   type FileMap = {[key: string]: File};
//
// and `query`, `variables` and `environment` arguments
// as in the previous example:
const mutation = Relay.GraphQLMutation.createWithFiles(
  query,
  variables,
  files,
  environment
);
```

See also: [GraphQLMutation &gt; Constructor](#constructor)

## Methods

### constructor

```

constructor(
  query: RelayConcreteNode,
  variables: Variables,
  files: ?FileMap,
  environment: RelayEnvironmentInterface,
  callbacks: ?RelayMutationTransactionCommitCallbacks,
  collisionKey: ?string
);
```

This is the general constructor for creating `Relay.GraphQLMutation` instances with optional `files`, `callbacks` and `collisionKey` arguments.

Callers must provide an appropriate `query` and `variables`. As per the GraphQL Server Relay Specification:

-   The mutation should take a single argument named "input".
-   That input argument should contain a (string) "clientMutationId" property for the purposes of reconciling requests and responses (automatically added by the `Relay.GraphQLMutation` API).
-   The query should request "clientMutationId" as a subselection.

If not supplied, a unique collision key is derived (meaning that the created mutation will be independent and not collide with any other).

#### Example

```

const collisionKey = 'feedback-like: ' + variables.input.feedbackId;
const mutation = new Relay.GraphQLMutation(
  query,
  variables,
  null, // No files.
  environment,
  {
    onFailure: err => console.warn(err),
    onSuccess: () => console.log('Success!'),
  },
  collisionKey
);
```

See also: [Relay.Mutation::getCollisionKey()](./classic-api-reference-relay-mutation#getcollisionkey)

### applyOptimistic

```

applyOptimistic(
  optimisticQuery: RelayConcreteNode,
  optimisticResponse: Object,
  configs: ?Array<RelayMutationConfig>
): RelayMutationTransaction;
```

Call this to optimistically apply an update to the store.

The optional `config` parameter can be used to configure a `RANGE_ADD` or other type of mutation, as per the `Relay.Mutation` API. This tells Relay how to process the response.

Optionally, follow up with a call to `commit()` to send the mutation to the server.

**Note:** An optimistic update may only be applied once.

#### Example

```{"{"}18-21{"}"}

const optimisticQuery = Relay.QL`mutation FeedbackLikeOptimisticUpdate {
  feedbackLike(input: $input) {
    clientMutationId
    feedback {
      doesViewerLike
      id
    }
  }
}`;
const optimisticResponse = {
  feedback: {
    doesViewerLike: true,
    id: 'aFeedbackId',
    __typename: 'Feedback',
  },
};

const transaction = mutation.applyOptimistic(
  optimisticQuery,
  optimisticResponse,
);
```

See also: [Relay.Mutation::getConfigs()](./classic-api-reference-relay-mutation#getconfigs-abstract-method)

### commit

```

commit(configs: ?Array<RelayMutationConfig>): RelayMutationTransaction;
```

Call this to send the mutation to the server.

The optional `config` parameter can be used to configure a `RANGE_ADD` or other type of mutation, similar to the `Relay.Mutation` API.

Optionally, precede with a call to `applyOptimistic()` to apply an update optimistically to the store.

Note: This method may only be called once per instance.

#### Example

```{"{"}11{"}"}

const configs = [{
  type: 'RANGE_ADD',
  connectionName: 'topLevelComments',
  edgeName: 'feedbackCommentEdge',
  parentID: 'aFeedbackId',
  parentName: 'feedback',
  rangeBehaviors: {
    '': GraphQLMutatorConstants.PREPEND,
  },
}];
const transaction = mutation.commit(configs);
```

See also: [Relay.Mutation::getConfigs()](./classic-api-reference-relay-mutation#getconfigs-abstract-method)

### rollback

```

rollback(): void;
```

Rolls back an optimistic mutation.

## See also

A number of more detailed usage examples can be found [in the test suite](https://github.com/facebook/relay/blob/main/packages/react-relay/classic/mutation/__tests__/RelayGraphQLMutation-test.js).
