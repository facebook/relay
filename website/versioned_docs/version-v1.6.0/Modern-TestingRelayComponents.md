---
id: testing-relay-components
title: Testing Relay Components
---
The purpose of this document is to cover the Relay APIs for testing Relay components.

The content is focused mostly on Jest unit-tests (testing individual components) and integration tests (testing a combination of components), but these testing tools may be applied in different cases: screenshot-tests, production smoke-tests, fuzz-tests, e2e test, etc.

The benefits of writing Jest tests:

-   In general, it improves the stability of the system. Flow really helps with catching a various set of JavaScript errors, but it is still possible to introduce regressions to the components. Unit-tests may help to find, reproduce, and fix those regressions, and prevent them in the future.
-   It simplifies the refactoring process: when properly written (testing public interface, not implementation), tests really help with changing the internal implementation of the components.
-   It may speed up and improve the development workflow. Some people may call it Test Driven Development (TM). But essentially it's just writing tests for public interfaces of your components, and then writing the components that are implementing those interfaces. Jest --watch mode is really shining in this case.
-   It will simplify the onboarding process for new developers, having tests really help to ramp up on the new code base, fixing bugs, and delivering features.

One thing to note: while Jest unit and integration tests will help improve the stability of the system, they should be considered as a part of a bigger stability infrastructure with multiple layers of automated testing: flow, e2e, screenshot and performance tests.

## Testing with Relay

Testing applications that are using Relay may be challenging, because of the additional data fetching layer that is wrapping the actual product code.

It's not always easy to understand the mechanics of all processes that are happening behind Relay, and how to properly handle interactions with the framework.

Fortunately, we have tools that aim to simplify the process of writing tests for Relay components, by providing imperative APIs for controlling the request/response flow and additional API for mock data generation.

There are two main modules that you may use in your tests:

-   `createMockEnvironment(options): RelayMockEnvironment`
-   `MockPayloadGenerator` and `@relay_test_operation` directive

With `createMockEnvironment`, you are able to create an instance of `RelayMockEnvironment`, a Relay environment specifically for your tests. The instance created by `createMockEnvironment` is implementing the Relay Environment Interface and it also has an additional Mock layer, with methods that allow to resolve/reject and control the flow of operations (queries/mutations/subscriptions).

The main purpose of `MockPayloadGenerator` is to improve the process of creating and maintaining the mock data for tested components.

One of the patterns you may see in the tests for Relay components: 95% of the test code is the test preparation: the gigantic mock object with dummy data, manually created, or just a copy of a sample server response that needs to be passed as the network response. The remaining 5% is the actual test. As a result, people don't test much. It's hard to create and manage all these dummy payloads for different cases. Hence, writing tests is time-consuming and painful to maintain.

With the `MockPayloadGenerator` and `@relay_test_operation`, we want to get rid of this pattern and switch the developer's focus from the preparation of the test to the actual testing.

## `RelayMockEnvironment` API Overview

`RelayMockEnvironment` is a special version of Relay Environment with an additional API methods for controlling the operation flow: resolving and rejection operations, providing incremental payloads for subscriptions, working with cache.

-   Methods for finding operations executed on the environment
    -   `getAllOperations()` - get all operation executed during the test by the current time
    -   `findOperation(findFn => boolean) `- find particular operation in the list of all executed operations, this method will throw, if operation is not available. Maybe useful to find a particular operation when multiple operations executed at the same time
    -   `getMostRecentOperation() -` return the most recent operation, this method will throw if no operations were executed prior this call.
-   Methods for resolving or rejecting operations
    -   `nextValue(request | operation, data)` - provide payload for operation(request), but not complete request. Practically useful when testing incremental updates and subscriptions
    -   `complete(request | operation)`  - complete the operation, no more payloads are expected for this operation, when it's completed.
    -   `resolve(request | operation, data)` - resolve the request with provided GraphQL response. Essentially, it's nextValue(...) and complete(...)
    -   `reject(request | operation, error)` - reject the request with particular error
    -   `resolveMostRecentOperation(data | operation => data)` - resolve and getMostRecentOperation work together
    -   `rejectMostRecentOperation(error | operation => error)`  - reject and getMostRecentOperation work together
    -   `queueOperationResolver(operation => data | error)` - adds an OperationResolver function to the queue, those methods will be used to resolve/reject operations as they appear
-   Additional utility methods
    -   `isLoading(request | operation)` - will return `true` if operations have not been completed, yet.
    -   `cachePayload(request | operation, variables, payload)` - will add payload to QueryResponse cache
    -   `clearCache() `- will clear `QueryResponse` cache

## Mock Payload Generator and `@relay_test_operation` Directive

`MockPayloadGenerator` may drastically simplify the process of creating and maintaining mock data for your tests. `MockPayloadGenerator` is the module that can generate dummy data for the selection that you have in your operation. There is an API to modify the generated data - Mock Resolvers. With Mock Resolvers, you may adjust the data for your needs. Collection of Mock Resolvers it's an object where keys are names of GraphQL types (ID, String, User, Feedback, Comment, etc), and values are functions that will return the default data for the type.

Example of a simple Mock Resolver:

```javascript
{
  ID() {
    // Return mock value for a scalar filed with type ID
    return 'my-id';
  },
  String() {
    // Every scalar field with type String will have this default value
    return "Lorem Ipsum"
  }
}
```

It is possible to define more resolvers for Object types:

```javascript
{
  // This will be the default values for User object in the query response
  User() {
    return {
      id: 1000,
      name: "Alice",
      profile_picture: {
        uri: "http://my-image...",
      },
    };
  },
}
```

### Mock Resolver Context

The first argument of the MockResolver is the object that contains Mock Resolver Context. It is possible to return dynamic values from mock resolvers based on the context - for instance, name or alias of the field, a path in the selection, arguments, or parent type.

```javascript
{
  String(context) {
    if (context.name === 'zip') {
      return '94025';
    }
    if (context.path != null && context.path.join('.') === 'node.actor.name') {
      return 'Current Actor Name';
    }
    if (context.parentType === 'Image' && context.name === 'uri') {
       return 'http://my-image.url';
    }
  }
}
```

### ID Generation

The second argument of the Mock Resolver its a function that will generate a sequence of integers, useful to generate unique IDs in the tests:

```javascript
{
  // will generate strings "my-id-1", "my-id-2", etc.
  ID(_, generateId) {
     return `my-id-${generateId()}`;
  },
}
```

### `@relay_test_operation`

Most of GraphQL type information for a specific field in the selection is not available during Relay runtime. By default, Relay, cannot get type information for a scalar field in the selection, or an interface type of the object.

Operations with the `@relay_test_operation` directive will have additional metadata that will contain GraphQL type info for fields in the operation's selection. And it will improve the quality of the generated data. You also will be able to define Mock resolvers for Scalar (not only ID and String) and Abstract types:

```javascript
{
  Float() {
    return 123.456;
  },
  Boolean(context) {
    if (context.name === 'can_edit') {
      return true;
    }
    return false;
  },
  Node() {
    return {
      __typename: 'User',
      id: 'my-user-id',
    };
  }
}
```

## Examples

### Relay Component Test

Using `createMockEnvironment` and `MockPayloadGenerator` allows writing concise tests for components that are using Relay Containers and Renderers. Both those modules can be imported from `relay-test-utils`.

```javascript
// Say you have a component with the QueryRenderer
const MyAwesomeViewRoot = require('MyAwesomeViewRoot');
const {
  createMockEnvironment,
  MockPayloadGenerator,
} = require('relay-test-utils');

// Relay may trigger 3 different states
// for this component: Loading, Error, Data Loaded
// Here is examples of tests for those states.
test('Loading State', () => {
  const environment = createMockEnvironment();
  const renderer = ReactTestRenderer.create(
    <MyAwesomeViewRoot environment={environment} />,
  );

  // Here we just verify that the spinner is rendered
  expect(
    renderer.root.find(node => node.props['data-testid'] === 'spinner'),
  ).toBeDefined();
});

test('Data Render', () => {
  const environment = createMockEnvironment();
  const renderer = ReactTestRenderer.create(
    <MyAwesomeViewRoot environment={environment} />,
  );

  environment.mock.resolveMostRecentOperation(operation =>
    MockPayloadGenerator.generate(operation),
  );

  // At this point operation will be resolved
  // and the data for a query will be available in the store
  expect(
    renderer.root.find(node => node.props['data-testid'] === 'myButton'),
  ).toBeDefined();
});

test('Error State', () => {
  const environment = createMockEnvironment();
  const renderer = ReactTestRenderer.create(
    <MyAwesomeViewRoot environment={environment} />,
  );

  // Error can be simulated with `rejectMostRecentOperation`
  environment.mock.rejectMostRecentOperation(new Error('Uh-oh'));

  expect(
    renderer.root.find(item => (item.props.testID = 'errorMessage')),
  ).toBeDefined();
});
```

### Fragment Container Tests

Essentially, in the example above, `resolveMostRecentOperation` will generate data for all child fragment containers (pagination, refetch). Usually, the Root Components container may have many child fragment components and you may want to exercise a specific Fragment Container. The solution for that would be to wrap your fragment container with the QueryRenderer that renders a Query that's spreads fragments from your fragment container.

```javascript
test('Fragment Container', () => {
  const environment = createMockEnvironment();
  const TestRenderer = () => (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query TestQuery @relay_test_operation {
          myData: node(id: "test-id") {
            ...MyFragment
          }
        }
      `}
      variables={{}}
      render={({error, props}) => {
        if (props) {
          return <MyFragmentContainer myData={props.myData} />;
        } else if (error) {
          return error.message;
        }
        return 'Loading...';
      }}
    />
  );
  const renderer = ReactTestRenderer.create(<TestRenderer />);
  environment.mock.resolveMostRecentOperation(operation =>
    MockPayloadGenerator.generate(operation),
  );

  expect(renderer).toMatchSnapshot();
});
```

### Pagination Container Test

Essentially, tests for Pagination container are not different from Fragment Container tests. We can also do more here. We can actually see how the pagination works by asserting the behavior of our components when performing pagination (load more, refetch).

```javascript
// Pagination Example
test('Pagination Container', () => {
  const environment = createMockEnvironment();
  const TestRenderer = () => (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query TestQuery @relay_test_operation {
          myConnection: node(id: "test-id") {
            connection {
              ...MyConnectionFragment
            }
          }
        }
      `}
      variables={{}}
      render={({error, props}) => {
        if (props) {
          return <MyPaginationContainer connection={props.myConnection.connection} />;
        } else if (error) {
          return error.message;
        }
        return 'Loading...';
      }}
    />
  );
  const renderer = ReactTestRenderer.create(<TestRenderer />);
  environment.mock.resolveMostRecentOperation(operation =>
    MockPayloadGenerator.generate(operation, {
      ID(_, generateId) {
        // Why we're doing this?
        // To make sure that we will generate a different set of ID
        // for elements on first page and the second page.
        return `first-page-id-${generateId()}`;
      },
      PageInfo() {
        return {
          has_next_page: true,
        };
      },
    }),
  );

  // Let's find a `loadMore` button and click on it to initiate pagination request, for example
  const loadMore = renderer.root.find(node => node.props['data-testid'] === 'loadMore')
  expect(loadMore.props.disabled).toBe(false);
  loadMore.props.onClick();

  environment.mock.resolveMostRecentOperation(operation =>
    MockPayloadGenerator.generate(operation, {
      ID(_, generateId) {
        // See, the second page IDs will be different
        return `second-page-id-${generateId()}`;
      },
      PageInfo() {
        return {
          // And the button should be disabled, now. Probably.
          has_next_page: false,
        };
      },
    }),
  );
  expect(loadMore.props.disabled).toBe(true);
});


```

### Refetch Container

We can use similar approach here with wrapping container with Query Renderer. And for the sake of completeness, we will add example here:

```javascript
test('Refetch Container', () => {
  const environment = createMockEnvironment();
  const TestRenderer = () => (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query TestQuery @relay_test_operation {
          myData: node(id: "test-id") {
            ...MyRefetchableFragment
          }
        }
      `}
      variables={{}}
      render={({error, props}) => {
        if (props) {
          return <MyRefetchContainer myData={props.myData} />;
        } else if (error) {
          return error.message;
        }
        return 'Loading...';
      }}
    />
  );

  const renderer = ReactTestRenderer.create(<TestRenderer />);
  environment.mock.resolveMostRecentOperation(operation =>
    MockPayloadGenerator.generate(operation),
  );
  // Assuming we have refetch button in the Container
  const refetchButton = renderer.root.find(node => node.props['data-testid'] === 'refetch');

  // This should trigger the `refetch`
  refetchButton.props.onClick();

  environment.mock.resolveMostRecentOperation(operation =>
    MockPayloadGenerator.generate(operation, {
      // We can customize mock resolvers, to change the output of the refetch query
    }),
  );
  // expect(renderer).toMatchSnapshot();
});
```

### Mutations

Mutations itself are operations so we can test them independently (unit-test) for specific mutation, or in combination with the view from which this mutation is called.

```javascript
// Say, you have a mutation function
function sendMutation(environment, onCompleted, onError, variables)
  commitMutation(environment, {
    mutation: graphql`...`,
    onCompleted,
    onError,
    variables,
  });
}

// Example test may be written like so
test('it should send mutation', () => {
  const environment = createMockEnvironment();
  const onCompleted = jest.fn();
  sendMutation(environment, onCompleted, jest.fn(), {});
  const operation = environment.mock.getMostRecentOperation();
  environment.mock.resolve(
    operation,
    MockPayloadGenerator.generate(operation)
  );
  expect(onCompleted).toBeCalled();
});
```

### Subscription

We can test subscription in a similar way we test mutations

```javascript
// Example subscribe function
function subscribe(environment, onNext, onError, variables)
  requestSubscription(environment, {
    subscription: graphql`...`,
    onNext,
    onError,
    variables,
  });
}

// Example test may be written like so
test('it should subscribe', () => {
  const environment = createMockEnvironment();
  const onNext = jest.fn();
  subscribe(environment, onNext, jest.fn(), {});
  const operation = environment.mock.getMostRecentOperation();
  environment.mock.nextValue(
    operation,
    MockPayloadGenerator.generate(operation)
  );
  expect(onNext).toBeCalled();
});
```

### Example with `queueOperationResolver`

With `queueOpeararionResolver`, it possible to define responses for operations that will be executed on the environment

```javascript
// Say you have a component with the QueryRenderer
const MyAwesomeViewRoot = require('MyAwesomeViewRoot');
const {
  createMockEnvironment,
  MockPayloadGenerator,
} = require('relay-test-utils');

test('Data Render', () => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver(operation =>
    MockPayloadGenerator.generate(operation),
  );

  const renderer = ReactTestRenderer.create(
    <MyAwesomeViewRoot environment={environment} />,
  );

  // At this point operation will be resolved
  // and the data for a query will be available in the store
  expect(
    renderer.root.find(node => node.props['data-testid'] === 'myButton'),
  ).toBeDefined();
});

test('Error State', () => {
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver(() =>
    new Error('Uh-oh'),
  );
  const renderer = ReactTestRenderer.create(
    <MyAwesomeViewRoot environment={environment} />,
  );

  expect(
    renderer.root.find(item => (item.props.testID = 'errorMessage')),
  ).toBeDefined();
});


```
