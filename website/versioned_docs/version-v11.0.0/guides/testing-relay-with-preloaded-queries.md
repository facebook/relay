---
id: testing-relay-with-preloaded-queries
title: Testing Relay with Preloaded Queries
slug: /guides/testing-relay-with-preloaded-queries/
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'internaldocs-fb-helpers';

Components that use preloaded queries (`useQueryLoader` and `usePreloadedQuery` hooks) require slightly different and more convoluted test setup.

In short, there are two steps that need to be performed **before rendering the component**

1. Configure the query resolver to generate the response via `environment.mock.queueOperationResolver`
2. Record a pending queue invocation via `environment.mock.queuePendingOperation`

## Symptoms that something is wrong

1. The test doesn't do what is expected from it.
2. The query seems to be blocking instead of executing
   1. E.g. the `Suspend` doesn't switch from "waiting" to "data loaded" state
3. If you add the `console.log` before and after `usePreloadedQuery`, only the "before" call is hit

## TL;DR

```javascript
const {RelayEnvironmentProvider} = require('react-relay');
const { MockPayloadGenerator, createMockEnvironment } = require('relay-test-utils');
const {render} = require('testing-library-react');
// at the time of writing, act is not re-exported by our internal testing-library-react
// but is re-exported by the "external" version
const {act} = require('ReactTestUtils');
test("...", () => {
  // arrange
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver(operation => {
      return MockPayloadGenerator.generate(operation, {
        CurrencyAmount() {
          return {
            formatted_amount: "1234$",
          };
        },
      });
    });
  const query = YourComponentGraphQLQueryGoesHere; // can be the same, or just identical
  const variables = {
    // ACTUAL variables for the invocation goes here
  };
  environment.mock.queuePendingOperation(YourComponentGraphQLQuery, variables);

 // act
  const {getByTestId, ..otherStuffYouMightNeed} = render(
    <RelayEnvironmentProvider environment={environment}>
        <YourComponent data-testid="1234" {...componentPropsIfAny}/>
    </RelayEnvironmentProvider>
  );
  // trigger the loading - click a button, emit an event, etc. or ...
  act(() => jest.runAllImmediates()); // ... if loadQuery is in the useEffect()
  // assert
  // your assertions go here
});
```

### Configure the query resolver to generate the response

This is done via `environment.mock.queueOperationResolver(operation)` call, but getting it right might be tricky.

The crux of this call is to return a mocked graphql result in a very particular format (as `MockResolvers` type, to be precise). This is done via a second parameter to `generate` - it is an object, whose keys are GraphQL types that we want to mock. (See [`mock-payload-generator`](../testing-relay-components/#mock-payload-generator-and-the-relay_test_operation-directive)).

Continuing on the above example:

```js
return MockPayloadGenerator.generate(operation, {
  CurrencyAmount() { // <-- the GraphQL type
    return {
      formatted_amount: "response_value" <-- CurrencyAmount fields, selected in the query
    };
  }
});
```
The tricky thing here is to obtain the name of the GraphQL type and fields to return. This can be done in two ways:

* Call `console.log(JSON.stringify(operation, null, 2))` and look for the `concreteType` that corresponds to what we want to mock. Then look at the sibling `selections` array, which describes the fields that are selected from that object.

<FbInternalOnly>

* This is somewhat intense - P139017123 is the output for [this query](https://fburl.com/diffusion/irqurgj9). Rule of thumb - one nested call in the query produces one nested object in the output.
* Look up the type in the graphiql (bunnylol graphiql), then specify the fields listed on the query.

:::note
The type you need seems to be the type returned by the *innermost function call* (or calls, if you have multiple functions called in one query - see D23078476). This needs to be confirmed - in both example diffs the target types was also leafs.
:::

</FbInternalOnly>


It is **possible** to return different data for different query variables via [Mock Resolver Context](../testing-relay-components/#mock-resolver-context). The query variables will be available on the `context.args`, but only to the *innermost function call* (for the query above, only `offer_ids` are available)

```javascript
CurrencyAmount(context) {
  console.log(JSON.stringify(context, null, 2)); // <--
  return { formatted_amount: mockResponse }
}
// <-- logs { ...snip..., "name": "subtotal_price_for_offers", args: { offer_ids: [...] } }
```
### Record a pending queue invocation

This is more straightforward - it is done via a call to `environment.mock.queuePendingOperation(query, variables)`

* `Query` needs to match the query issues by the component. Simplest (and most robust agains query changes) is to export the query from the component module and use it in the test, but having an *identical* (but not the same) query works as well.
* `variables` has to match the variables that will be used in this test invocation.
   * Beware of nested objects and arrays - they are compared via `areEqual` ([invocation code](https://github.com/facebook/relay/blob/046f758c6b411608371d4cc2f0a594ced331864e/packages/relay-test-utils/RelayModernMockEnvironment.js#L233))
      * Arrays are compared by values (not by reference), but the order of elements matter
      * Nested objects - performs deep compare, order of keys is not relevant (this is not confirmed - please update this doc if you used a graphql query with "deep" structure*)*

<FbInternalOnly>

### Example diffs

* [D23078476](https://internalfb.com/intern/diff/D23078476)
* [D23101739](https://www.internalfb.com/diff/D23101739)

</FbInternalOnly>

## Troubleshooting

* `console.log`, `console.log` everywhere! Recommended places:
   * component: before and after `useQueryLoader, usePreloadedQuery, loadQuery`
   * test: in `queueOperationResolver` callback
   * library: in `RelayModernMockEnvironment.execute,`after the `const currentOperation = ...` call ([here](https://github.com/facebook/relay/blob/046f758c6b411608371d4cc2f0a594ced331864e/packages/relay-test-utils/RelayModernMockEnvironment.js#L230))
* If `loadQuery` is not called - make sure to issue the triggering event. Depending on your component implementation it could be a user-action (like button click or key press), javascript event (via event emitter mechanisms) or a simple "delayed execution" with `useEffect`.
   * The `useEffect` case is probably easiest to miss - make sure to call `act(() => jest.runAllImmediates())` **after** rendering the component
* If "before" `usePreloadedQuery` is hit, but "after" is not - the query suspends. This entire guide is written to resolve it - you might want to re-read it. But most likely it is either:
   * Used a different query - the query resolver would not be called, `currentOperation` will be `null`
   * Query variables don't match - the query resolver would not be called, `currentOperation` will be `null` (make sure to inspect the `variables`).
      * Also, make sure arrays are in the same order, if any (or better yet, use sets, if at all possible).
* If data returned rom the query is not what you expect, make sure you're generating the right graphql type.
   * You can tell you're mocking the wrong one if the return values look something like `<mock-value-for-field-"formatted_amount">`


:::note
Make sure the component and the test use the same environment (i.e. there's no `<RelayEnvironmentProvider environment={RelayFBEnvironment}>` somewhere nested in your test React tree.
:::


## Epilogue

Examples here use `testing-library-react`, but it works with the `react-test-renderer` as well.

<FbInternalOnly>

See [D23078476](https://www.internalfb.com/diff/D23078476).

</FbInternalOnly>

<DocsRating />
