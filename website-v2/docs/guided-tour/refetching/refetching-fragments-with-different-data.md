---
id: refetching-fragments-with-different-data
title: Refetching Fragments With Different Data
slug: /guided-tour/refetching/refetching-fragments-with-different-data/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

Sometimes, upon an event or user interaction, we'd like to render the *same* exact fragment that was originally rendered under the initial query, but with a different data. Conceptually, this means fetching and rendering the currently rendered fragment again, but under a new query with different variables; or in other words, *making the rendered fragment a new query root*. Remember that *fragments can't be fetched by themselves: they need to be part of a query,* so we can't just "fetch" the fragment again by itself.

To do so, we can also use the `useRefetchableFragment` hook in combination with the `@refetchable` directive, in order to *refetch* a fragment under new query and variables, using the `refetch` function:

```js
import type {CommentBodyRefetchQuery} from 'CommentBodyRefetchQuery.graphql';
import type {CommentBody_comment$key} from 'CommentBody_comment.graphql';

const React = require('React');
const {graphql, useRefetchableFragment} = require('react-relay');
const useTransition = require('useTransition');

type Props = {
  comment: CommentBody_comment$key,
};

function CommentBody(props: Props) {
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
  const [startTransition, isRefetching] = useTransition();
  const refetchTranslation = () => {
    startTransition(() => {
      refetch({lang: 'SPANISH'}, {fetchPolicy: 'store-or-network'});
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

module.exports = CommentBody;
```

Let's distill what's happening in this example:

* `useRefetchableFragment` behaves the same way as a `useFragment` (see the [Fragments](../../rendering/fragments/) section), but with a few additions:
    * It expects a fragment that is annotated with the `@refetchable` directive. Note that  `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are on `Viewer`, on `Query`, on any type that implements `Node` (i.e. a type that has an `id` field), or on a `@fetchable` type.

<FbInternalOnly>

> See [this post](https://fb.workplace.com/groups/graphql.fyi/permalink/1539541276187011/) for more info on the `@fetchable` type.

</FbInternalOnly>

* It returns a `refetch` function, which is already  Flow typed to expect the query variables that the generated query expects
* It takes to Flow type parameters: the type of the generated query (in our case  `CommentBodyRefetchQuery`), and a second type which can always be inferred, so you only need to pass underscore (`_`).
* We're calling the `refetch` function with 2 main inputs:
    * The first argument is the set of variables to fetch the fragment with. In this case, calling `refetch` and passing a new set of variables will fetch the fragment again *with the newly provided variables*. The variables you need to provide are a subset of the variables that the `@refetchable` query expects; the query will require an `id`, if the type of the fragment has an `id` field, and any other variables that are transitively referenced in your fragment.
        * In this case we're passing the current comment `id` and a new value for the `translationType` variable to fetch the translated comment body.
    * In the second argument we are passing a `fetchPolicy` of `‘store-or-network'`, which will skip the network request if the new data for that fragment is already cached (as we covered in [Reusing Cached Data For Render](../../reusing-cached-data/)).
* Calling `refetch` will re-render the component and may cause `useRefetchableFragment` to suspend (as explained in [Transitions and Updates that Suspend](../../rendering/loading-states/)). This means that you'll need to make sure that there's a `Suspense` boundary wrapping this component from above, to show a fallback loading state, and/or that you are using [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) in order to show the appropriate pending or loading state.
    * In this case, we are using the pending flag provided by `useTransition`, `isRefetching`, in order render a pending state while the request is active, i.e. to render the busy spinner and to disable our UI control.
    * Using this pending state is optional, however, note that since `refetch` may cause the component to suspend, regardless of whether we're rendering a pending state, we should *always* use `startTransition` to schedule that update; any update that may cause a component to suspend should be scheduled using this pattern.



<DocsRating />
