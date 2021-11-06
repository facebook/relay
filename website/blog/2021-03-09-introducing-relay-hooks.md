---
title: Introducing Relay Hooks
author: Robert Balicki & Juan Tejada
tags: [relay-hooks]
description: Introducing Relay Hooks
hide_table_of_contents: false
---

import useBaseUrl from '@docusaurus/useBaseUrl';

We are extremely excited to release [Relay Hooks](https://github.com/facebook/relay/releases/tag/v11.0.0), the most developer-friendly version of Relay yet, and [make it available to the OSS community](https://developers.facebook.com/blog/post/2021/03/09/introducing-relay-hooks-improved-react-apis-relay/) today! Relay Hooks is a set of new, rethought APIs for fetching and managing GraphQL data using React Hooks.

The new APIs are fully compatible with the existing, container-based APIs. Though we recommend writing any new code using Relay Hooks, *migrating existing containers to the new APIs is optional and container-based code will continue to work*.

Although these APIs are newly released, they are not untested: the rewritten [Facebook.com](https://www.facebook.com) is entirely powered by Relay Hooks and these APIs have been the recommended way to use Relay at Facebook since mid-2019.

In addition, we are also releasing a rewritten <a href={useBaseUrl('/docs/guided-tour/')}>guided tour</a> and <a href={useBaseUrl('/docs/')}>updated documentation</a> that distill the best practices for building maintainable, data-driven applications that we have learned since first developing Relay.

Though we still have a ways to go before getting started with Relay is as easy as we’d like, we believe these steps will make the Relay developer experience substantially better.

## What was released?

We released Relay Hooks, a set of React Hooks-based APIs for working with GraphQL data. We also took the opportunity to ship other improvements, like a more stable version of <a href={useBaseUrl('/docs/api-reference/fetch-query/')}><code>fetchQuery</code></a> and the ability to customize object identifiers in Relay using <code>getDataID</code> (which is useful if your server does not have globally unique IDs.)

 See the [release notes](https://github.com/facebook/relay/releases/tag/v11.0.0) for a complete list of what was released.

## What are the advantages of the Hooks APIs?

The newly released APIs improve the developer experience in at least the following ways:

* The Hooks-based APIs for fetching queries, loading data with fragments, pagination, refetching, mutations and subscriptions generally require fewer lines of code and have less indirection than the equivalent container-based solution.
* These APIs have more complete Flow and Typescript coverage.
* These APIs take advantage of compiler features to automate error-prone tasks, such as the generation of refetch and pagination queries.
* These APIs come with the ability to configure fetch policies, which let you determine the conditions in which a query should be fulfilled from the store and in which a network request will be made.
* These APIs give you the ability to start fetching data before a component renders, something that could not be achieved with the container-based solutions. This allows data to be shown to users sooner.

The following examples demonstrate some of the advantages of the new APIs.

## Refetching a fragment with different variables

First, let’s take a look at how we might refetch a fragment with different variables using the Hooks APIs:

```js
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

  return <>
    <CommentText text={data?.text} />
    <Button
      onClick={() =>
        refetch({ lang: 'SPANISH' }, { fetchPolicy: 'store-or-network' })
      }>
    >
      Translate
    </Button>
  </>
}
```

Compare this to the equivalent [container-based example](https://gist.github.com/rbalicki2/2ac2829aefd8d032e8cb32cd0066bd4e). The Hooks-based example takes fewer lines, does not require the developer to manually write a refetch query, has the refetch variables type-checked and explicitly states that a network request should not be issued if the query can be fulfilled from data in the store.

## Starting to fetch data before rendering a component

The new APIs allow developers to more quickly show content to users by starting to fetch data before a component renders. Prefetching data in this way is not possible with the container-based APIs. Consider the following example:

```js
const UserQuery = graphql`
  query UserLinkQuery($userId: ID!) {
    user(id: $userId) {
      user_details_blurb
    }
  }
`;

function UserLink({ userId, userName }) {
  const [queryReference, loadQuery] = useQueryLoader(UserQuery);

  const [isPopoverVisible, setIsPopoverVisible] = useState(false);

  const maybePrefetchUserData = useCallback(() => {
    if (!queryReference) {
      // calling loadQuery will cause this component to re-render.
      // During that re-render, queryReference will be defined.
      loadQuery({ userId });
    }
  }, [queryReference, loadQuery]);

  const showPopover = useCallback(() => {
    maybePrefetchUserData();
    setIsPopoverVisible(true);
  }, [maybePrefetchUserData, setIsPopoverVisible]);

  return <>
    <Button
      onMouseOver={maybePrefetchUserData}
      onPress={showPopover}
    >
      {userName}
    </Button>
    {isPopoverVisible && queryReference && (
      <Popover>
        <React.Suspense fallback={<Glimmer />}>
          <UserPopoverContent queryRef={queryReference} />
        </React.Suspense>
      </Popover>
    )}
  </>
}

function UserPopoverContent({queryRef}) {
  // The following call will Suspend if the request for the data is still
  // in flight:
  const data = usePreloadedQuery(UserQuery, queryRef);
  // ...
}
```

In this example, if the query cannot be fulfilled from data in the local cache, a network request is initiated when the user hovers over a button. When the button is finally pressed, the user will thus see content sooner.

By contrast, the container-based APIs initiate network requests when the component renders.

### Hooks and Suspense for Data Fetching

You may have noticed that both of the examples use Suspense.

Although Relay Hooks uses Suspense for some of its APIs, *support, general guidance, and requirements for usage of Suspense for Data Fetching in React are still* *not ready*, and the React team is still defining what this guidance will be for upcoming releases. There are some limitations when Suspense is used with React 17.

Nonetheless, we released Relay Hooks now because we know these APIs are on the right trajectory for supporting upcoming releases of React. Even though parts of Relay’s Suspense implementation may still change, the Relay Hooks APIs themselves are stable; they have been widely adopted internally, and have been in use in production for over a year.

See <a href={useBaseUrl('/docs/migration-and-compatibility/suspense-compatibility/')}>Suspense Compatibility</a> and <a href={useBaseUrl('/docs/guided-tour/rendering/loading-states/')}>Loading States with Suspense</a> for deeper treatments of this topic.

### Where to go from here

Please check out the <a href={useBaseUrl('/docs/')}>getting started guide</a>, the <a href={useBaseUrl('/docs/migration-and-compatibility/')}>migration guide</a> and the <a href={useBaseUrl('/docs/guided-tour/')}>guided tour</a>.

### Thanks

Releasing Relay Hooks was not just the work of the React Data team. We'd like to thank the contributors that helped make it possible:

@0xflotus, @AbdouMoumen, @ahmadrasyidsalim, @alexdunne, @alloy, @andrehsu, @andrewkfiedler, @anikethsaha, @babangsund, @bart88, @bbenoist, @bigfootjon, @bondz, @BorisTB, @captbaritone, @cgriego, @chaytanyasinha, @ckknight, @clucasalcantara, @damassi, @Daniel15, @daniloab, @earvinLi, @EgorShum, @eliperkins, @enisdenjo, @etcinit, @fabriziocucci, @HeroicHitesh, @jaburx, @jamesgeorge007, @janicduplessis, @jaroslav-kubicek, @jaycenhorton, @jaylattice, @JonathanUsername, @jopara94, @jquense, @juffalow, @kafinsalim, @kyarik, @larsonjj, @leoasis, @leonardodino, @levibuzolic, @liamross, @lilianammmatos, @luansantosti, @MaartenStaa, @MahdiAbdi, @MajorBreakfast, @maraisr, @mariusschulz, @martinbooth, @merrywhether, @milosa, @mjm, @morrys, @morwalz, @mrtnzlml, @n1ru4l, @Nilomiranda, @omerzach, @orta, @pauloedurezende, @RDIL, @RicCu, @robrichard, @rsmelo92, @SeshanPillay25, @sibelius, @SiddharthSham, @stefanprobst, @sugarshin, @taion, @thedanielforum, @theill, @thicodes, @tmus, @TrySound, @VinceOPS, @visshaljagtap, @Vrq, @w01fgang, @wincent, @wongmjane, @wyattanderson, @xamgore, @yangshun, @ymittal, @zeyap, @zpao and @zth.

The open source project [`relay-hooks`](https://github.com/relay-tools/relay-hooks) allowed the community to experiment with Relay and React Hooks, and was a source of valuable feedback for us. The idea for the `useSubscription` hook originated in [an issue](https://github.com/relay-tools/relay-hooks/issues/5#issuecomment-603930570) on that repo. Thank you @morrys for driving this project and for playing such an important role in our open source community.

Thank you for helping make this possible!
