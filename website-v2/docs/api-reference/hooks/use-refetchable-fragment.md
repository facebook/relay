---
id: use-refetchable-fragment
title: useRefetchableFragment
slug: /api-reference/use-refetchable-fragment/
---

import DocsRating from '../../../src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'internaldocs-fb-helpers';

import FbRefetchBlurb from './fb/FbRefetchBlurb.md';

## `useRefetchableFragment`

You can use `useRefetchableFragment` when you want to fetch and re-render a fragment with different data:

```js
import type {CommentBodyRefetchQuery} from 'CommentBodyRefetchQuery.graphql';
import type {CommentBody_comment$key} from 'CommentBody_comment.graphql';

const React = require('React');
const useSuspenseTransition = require('useSuspenseTransition');

const {graphql, useRefetchableFragment} = require('react-relay');


type Props = {|
  comment: CommentBody_comment$key,
|};

function CommentBody(props: Props) {
  const [startTransition] = useSuspenseTransition();
  const [data, refetch] = useRefetchableFragment<CommentBodyRefetchQuery, _>(
    graphql`
      fragment CommentBody_comment on Comment
      @refetchable(queryName: "CommentBodyRefetchQuery") {
        body(lang: $lang) {
          text
        }
      }
    `,
    props.comment,
  );

  return (
    <>
      <p>{data.body?.text}</p>
      <Button
        onClick={() => {
          startTransition(() => {
            refetch({lang: 'SPANISH'}, {fetchPolicy: 'store-or-network'})
          });
        }}
      >
        Translate Comment
      </Button>
    </>
  );
}

module.exports = CommentBody;
```

### Arguments

* `fragment`: GraphQL fragment specified using a `graphql` template literal. This fragment must have a `@refetchable` directive, otherwise using it will throw an error. The `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are declared on `Viewer` or  `Query` types, or on a type that implements `Node` (i.e. a type that has an `id`).
    * Note that you *do not* need to manually specify a refetch query yourself. The `@refetchable` directive will autogenerate a query with the specified `queryName`. This will also generate Flow types for the query, available to import from the generated file: `<queryName>.graphql.js`.
* `fragmentReference`: The *fragment reference* is an opaque Relay object that Relay uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.
    * The type of the fragment reference can be imported from the generated Flow types, from the file `<fragment_name>.graphql.js`, and can be used to declare the type of your `Props`. The name of the fragment reference type will be: `<fragment_name>$key`. We use our [lint rule](https://github.com/relayjs/eslint-plugin-relay) to enforce that the type of the fragment reference prop is correctly declared.

### Flow Type Parameters

* `TQuery`: Type parameter that should corresponds the Flow type for the `@refetchable` query. This type is available to import from the the auto-generated file: `<queryName>.graphql.js`.
* `TFragmentRef`: Type parameter corresponds to the type of the fragment reference argument (i.e. `<fragment_name>$key`). This type usually does not need to be explicitly specified, and can be passed as `_` to let Flow infer the concrete type.

### Return Value

Tuple containing the following values

* [0] `data`: Object that contains data which has been read out from the Relay store; the object matches the shape of specified fragment.
    * The Flow type for data will also match this shape, and contain types derived from the GraphQL Schema.
* [1] `refetch`: Function used to refetch the fragment with a potentially new set of variables.
    * Arguments:
        * `variables`: Object containing the new set of variable values to be used to fetch the `@refetchable` query.
            * These variables need to match GraphQL variables referenced inside the fragment.
            * However, only the variables that are intended to change for the refetch request need to be specified; any variables referenced by the fragment that are omitted from this input will fall back to using the value specified in the original parent query. So for example, to refetch the fragment with the exact same variables as it was originally fetched, you can call `refetch({})`.
            * Similarly, passing an `id` value for the `$id` variable is _*optional*_, unless the fragment wants to be refetched with a different `id`. When refetching a `@refetchable` fragment, Relay will already know the id of the rendered object.
        * `options`: *_[Optional]_* options object
            * `fetchPolicy`: Determines if cached data should be used, and when to send a network request based on cached data that is available. See the [`useLazyLoadQuery`](../use-lazy-load-query) section for full specification.
            * `onComplete`: Function that will be called whenever the refetch request has completed, including any incremental data payloads.
    * Return value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will cancel the refetch request.
    * Behavior:
        * Calling `refetch` with a new set of variables will fetch the fragment again *with the newly provided variables*. Note that the variables you need to provide are only the ones referenced inside the fragment. In this example, it means fetching the translated body of the currently rendered Comment, by passing a new value to the `lang` variable.

<FbRefetchBlurb />

<OssOnly>

  * Calling `refetch` will re-render your component and may cause it to _*[suspend](../../guided-tour/rendering/loading-states)*_, depending on the specified `fetchPolicy` and whether cached data is available or if it needs to send and wait for a network request. If refetch causes the component to suspend, you'll need to make sure that there's a `Suspense` boundary wrapping this component from above or that you are using `useTransition` with a suspense config in order to show the appropriate pending or loading state.

</OssOnly>

* Note that since `refetch` may cause the component to suspend, regardless of whether we are rendering a pending state, we should use `startTransition` from `useSuspenseTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.
* For more details on Suspense, see our [Loading States with Suspense](../../guided-tour/rendering/loading-states) guide.

### Behavior

* The component is automatically subscribed to updates to the fragment data: if the data for this particular `User` is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.
* The component will suspend if any data for that specific fragment is missing, and the data is currently being fetched by a parent query.
    * For more details on Suspense, see our [Loading States with Suspense](../../guided-tour/rendering/loading-states) guide.

### Differences with `RefetchContainer`

* A refetch query no longer needs to be specified in this api, since it will be automatically generated by Relay by using a `@refetchable` fragment.
* Refetching no longer has a distinction between `refetchVariables` and `renderVariables`, which were previously vaguely defined concepts. Refetching will always correctly refetch and render the fragment with the variables you provide (any variables omitted in the input will fallback to using the original values from the parent query).
* Refetching will unequivocally update the component, which was not always true when calling refetch from `RefetchContainer` (it would depend on what you were querying for in the refetch query and if your fragment was defined on the right object type).



<DocsRating />
