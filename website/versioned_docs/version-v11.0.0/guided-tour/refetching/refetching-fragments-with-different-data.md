---
id: refetching-fragments-with-different-data
title: Refetching Fragments With Different Data
slug: /guided-tour/refetching/refetching-fragments-with-different-data/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbRefetchingFragments from './fb/FbRefetchingFragments.md';
import FbAvoidSuspenseCaution from './fb/FbAvoidSuspenseCaution.md';
import OssAvoidSuspenseNote from './OssAvoidSuspenseNote.md';

When referring to **"refetching a fragment"**, we mean fetching a *different* version of the data than the one was originally rendered by the fragment. For example, this might be to change a currently selected item, to render a different list of items than the one being shown, or more generally to transition the currently rendered content to show new or different content.

Conceptually, this means fetching and rendering the currently rendered fragment again, but under a new query with *different variables*; or in other words, rendering the fragment under a new query root. Remember that *fragments can't be fetched by themselves: they need to be part of a query,* so we can't just "fetch" the fragment again by itself.

## Using `useRefetchableFragment`

To do so, we can also use the [`useRefetchableFragment`](../../../api-reference/use-refetchable-fragment/) Hook in combination with the `@refetchable` directive, which will automatically generate a query to refetch the fragment under, and which we can fetch using the `refetch` function:

<FbInternalOnly>
  <FbRefetchingFragments />
</FbInternalOnly>

<OssOnly>

```js
import type {CommentBodyRefetchQuery} from 'CommentBodyRefetchQuery.graphql';
import type {CommentBody_comment$key} from 'CommentBody_comment.graphql';

type Props = {
  comment: CommentBody_comment$key,
};

function CommentBody(props: Props) {
  const [data, refetch] = useRefetchableFragment<CommentBodyRefetchQuery, _>(
    graphql`
      fragment CommentBody_comment on Comment
      # @refetchable makes it so Relay autogenerates a query for
      # fetching this fragment
      @refetchable(queryName: "CommentBodyRefetchQuery") {
        body(lang: $lang) {
          text
        }
      }
    `,
    props.comment,
  );

  const refetchTranslation = () => {
    // We call refetch with new variables,
    // which will refetch the @refetchable query with the
    // new variables and update this component with the
    // latest fetched data.
    refetch({lang: 'SPANISH'});
  };

  return (
    <>
      <p>{data.body?.text}</p>
      <Button
        onClick={() => refetchTranslation()}>
        Translate Comment
      </Button>
    </>
  );
}
```

Let's distill what's happening in this example:

* `useRefetchableFragment` behaves similarly to [`useFragment`](../../../api-reference/use-fragment/) (see the [Fragments](../../rendering/fragments/) section), but with a few additions:
    * It expects a fragment that is annotated with the `@refetchable` directive. Note that `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are on `Viewer`, on `Query`, on any type that implements `Node` (i.e. a type that has an `id` field), or on a [`@fetchable`](https://fb.workplace.com/groups/graphql.fyi/permalink/1539541276187011/) type.
* It returns a `refetch` function, which is already  Flow typed to expect the query variables that the generated query expects.
* It takes two Flow type parameters: the type of the generated query (in our case  `CommentBodyRefetchQuery`), and a second type which can always be inferred, so you only need to pass underscore (`_`).
* We're calling the `refetch` function with 2 main inputs:
    * The first argument is the set of variables to fetch the fragment with. In this case, calling `refetch` and passing a new set of variables will fetch the fragment again *with the newly provided variables*. The variables you need to provide are a subset of the variables that the `@refetchable` query expects; the query will require an `id`, if the type of the fragment has an `id` field, and any other variables that are transitively referenced in your fragment.
        * In this case we're passing the current comment `id` and a new value for the `translationType` variable to fetch the translated comment body.
    * We are not passing a second options argument in this case, which means that we will use the default `fetchPolicy` of `‘store-or-network'`, which will skip the network request if the new data for that fragment is already cached (as we covered in [Reusing Cached Data For Render](../../reusing-cached-data/)).
* Calling `refetch` will re-render the component and may cause `useRefetchableFragment` to suspend (as explained in [Loading States with Suspense](../../rendering/loading-states/)). This means that you'll need to make sure that there's a `Suspense` boundary wrapping this component from above in order to show a fallback loading state.

</OssOnly>

:::info
Note that this same behavior also applies to using the `refetch` function from [`usePaginationFragment`](../../../api-reference/use-pagination-fragment).
:::

### If you need to avoid Suspense

In some cases, you might want to avoid showing a Suspense fallback, which would hide the already rendered content. For these cases, you can use [`fetchQuery`](../../../api-reference/fetch-query/) instead, and manually keep track of a loading state:

<FbInternalOnly>
  <FbAvoidSuspenseCaution />
</FbInternalOnly>

<OssOnly>
  <OssAvoidSuspenseNote />
</OssOnly>

```js
import type {CommentBodyRefetchQuery} from 'CommentBodyRefetchQuery.graphql';
import type {CommentBody_comment$key} from 'CommentBody_comment.graphql';

type Props = {
  comment: CommentBody_comment$key,
};

function CommentBody(props: Props) {
  const [data, refetch] = useRefetchableFragment<CommentBodyRefetchQuery, _>(
    graphql`
      fragment CommentBody_comment on Comment
      # @refetchable makes it so Relay autogenerates a query for
      # fetching this fragment
      @refetchable(queryName: "CommentBodyRefetchQuery") {
        body(lang: $lang) {
          text
        }
      }
    `,
    props.comment,
  );

  const [isRefetching, setIsRefreshing] = useState(false)
  const refetchTranslation = () => {
    if (isRefetching) { return; }
    setIsRefreshing(true);

    // fetchQuery will fetch the query and write
    // the data to the Relay store. This will ensure
    // that when we re-render, the data is already
    // cached and we don't suspend
    fetchQuery(environment, AppQuery, variables)
      .subscribe({
        complete: () => {
          setIsRefreshing(false);

          // *After* the query has been fetched, we call
          // refetch again to re-render with the updated data.
          // At this point the data for the query should
          // be cached, so we use the 'store-only'
          // fetchPolicy to avoid suspending.
          refetch({lang: 'SPANISH'}, {fetchPolicy: 'store-only'});
        }
        error: () => {
          setIsRefreshing(false);
        }
      });
  };

  return (
    <>
      <p>{data.body?.text}</p>
      <Button
        disabled={isRefetching}
        onClick={() => refetchTranslation()}>
        Translate Comment {isRefetching ? <LoadingSpinner /> : null}
      </Button>
    </>
  );
}
```

Let's distill what's going on here:

* When refetching, we now keep track of our own `isRefetching` loading state, since we are avoiding supending. We can use this state to render a busy spinner or similar loading UI in our component, *without* hiding the content.
* In the event handler, we first call `fetchQuery`, which will fetch the query and write the data to the local Relay store. When the `fetchQuery` network request completes, we call `refetch` so that we render the updated data, similar to the previous example.
* At this point, when `refetch` is called, the data for the fragment should already be cached in the local Relay store, so we use `fetchPolicy` of `'store-only'` to avoid suspending and only read the already cached data.

<DocsRating />
