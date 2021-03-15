---
id: loading-states
title: Loading States with Suspense
slug: /guided-tour/rendering/loading-states/
---

import DocsRating from '@site/src/core/DocsRating';
import FbSuspensePlaceholder from '../../fb/FbSuspensePlaceholder.md';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbSuspenseDefinition from './fb/FbSuspenseDefinition.md';
import FbSuspenseMoreInfo from './fb/FbSuspenseMoreInfo.md';
import FbSuspenseTransitionsAndUpdatesThatSuspend from './fb/FbSuspenseTransitionsAndUpdatesThatSuspend.md';
import FbSuspenseInRelayTransitions from './fb/FbSuspenseInRelayTransitions.md';
import FbSuspenseInRelayFragments from './fb/FbSuspenseInRelayFragments.md';


As you may have noticed, we mentioned that using `usePreloadedQuery` and `useLazyLoadQuery` will render data from a query that was being fetched from the server, but we didn't elaborate on how to render a loading UI (such as a glimmer) while that data is still being fetched. We will cover that in this section.

<FbInternalOnly>
  <FbSuspenseDefinition />
</FbInternalOnly>

<OssOnly>

To render loading states while a query is being fetched, we rely on [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html). Suspense is a new feature in React that allows components to interrupt or *"suspend"* rendering in order to wait for some asynchronous resource (such as code, images or data) to be loaded; when a component "suspends", it indicates to React that the component isn't *"ready"* to be rendered yet, and won't be until the asynchronous resource it's waiting for is loaded. When the resource finally loads, React will try to render the component again.

</OssOnly>

This capability is useful for components to express asynchronous dependencies like data, code, or images that they require in order to render, and lets React coordinate rendering the loading states across a component tree as these asynchronous resources become available. More generally, the use of Suspense give us better control to implement more deliberately designed loading states when our app is loading for the first time or when it's transitioning to different states, and helps prevent accidental flickering of loading elements (such as spinners), which can commonly occur when loading sequences aren't explicitly designed and coordinated.


<FbInternalOnly>
  <FbSuspenseMoreInfo />
</FbInternalOnly>

<OssOnly>

:::caution
Note that this **DOES NOT** mean that "Suspense for Data Fetching" is ready for general implementation and adoption yet. **Support, general guidance, and requirements for usage of Suspense for Data Fetching are still not ready**, and the React team is still defining what this guidance will be for upcoming React releases.

Even though there will be some limitations when Suspense is used in React 17, Relay Hooks are stable and on the trajectory for supporting upcoming releases of React.

For more information, see our **[Suspense Compatibility](../../../migration-and-compatibility/suspense-compatibility/)** guide.
:::

</OssOnly>

## Loading fallbacks with Suspense Boundaries

When a component is suspended, we need to render a *fallback* in place of the component while we wait for it to become *"ready"*. In order to do so, we use the `Suspense` component provided by React:

```js
const React = require('React');
const {Suspense} = require('React');

function App() {
  return (
    // Render a fallback using Suspense as a wrapper
    <Suspense fallback={<LoadingGlimmer />}>
      <CanSuspend />
    </Suspense>
  );
}
```


`Suspense` components can be used to wrap any component; if the target component suspends, `Suspense` will render the provided fallback until all its descendants become *"ready"* (i.e. until *all* of the suspended components within the subtree resolve). Usually, the fallback is used to render fallback loading states such as a glimmers and placeholders.

Usually, different pieces of content in our  app might suspend, so we can show loading state until they are resolved by using `Suspense` :

```js
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

function App() {
  return (
    // LoadingGlimmer is rendered via the Suspense fallback
    <Suspense fallback={<LoadingGlimmer />}>
      <MainContent /> {/* MainContent may suspend */}
    </Suspense>
  );
}
```

<FbInternalOnly>
  <FbSuspensePlaceholder />
</FbInternalOnly>

Let's distill what's going on here:

* If `MainContent` suspends because it's waiting on some asynchronous resource (like data), the `Suspense` component that wraps `MainContent` will detect that it suspended, and will render the `fallback` element (i.e. the `LoadingGlimmer` in this case) up until `MainContent` is ready to be rendered. Note that this also transitively includes descendants of `MainContent`, which might also suspend.


What's nice about Suspense is that you have granular control about how to accumulate loading states for different parts of your component tree:

```js
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

function App() {
  return (
    // A LoadingGlimmer for *_all_* content is rendered via the Suspense fallback
    <Suspense fallback={<LoadingGlimmer />}>
      <MainContent />
      <SecondaryContent /> {/* SecondaryContent can also suspend */}
    </Suspense>
  );
}
```

<FbSuspensePlaceholder />

* In this case, both `MainContent` and `SecondaryContent` may suspend while they load their asynchronous resources; by wrapping both in a `Suspense`, we can show a single loading state up until they are *all* ready, and then render the entire content in a single paint, after everything has successfully loaded.
* In fact, `MainContent` and `SecondaryContent` may suspend for different reasons other than fetching data, but the same `Suspense` component can be used to render a fallback up until *all* components in the subtree are ready to be rendered. Note that this also transitively includes descendants of `MainContent` or `SecondaryContent`, which might also suspend.


Conversely, you can also decide to be more granular about your loading UI and wrap Suspense components around smaller or individual parts of your component tree:

```js
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

function App() {
  return (
    <>
      {/* Show a separate loading UI for the LeftHandColumn */}
      <Suspense fallback={<LeftColumnPlaceholder />}>
        <LeftColumn />
      </Suspense>

      {/* Show a separate loading UI for both the Main and Secondary content */}
      <Suspense fallback={<LoadingGlimmer />}>
        <MainContent />
        <SecondaryContent />
      </Suspense>
    </>
  );
}
```

<FbSuspensePlaceholder />

* In this case, we're showing 2 separate loading UIs:
    * One to be shown until the `LeftColumn` becomes ready
    * And one to be shown until both the `MainContent` and `SecondaryContent` become ready.
* What is powerful about this is that by more granularly wrapping our components in Suspense, *we allow other components to be rendered earlier as they become ready*. In our example, by separately wrapping `MainContent` and `SecondaryContent` under `Suspense`, we're allowing `LeftColumn` to render as soon as it becomes ready, which might be earlier than when the content sections become ready.


## Transitions and Updates that Suspend

<FbInternalOnly>
  <FbSuspenseTransitionsAndUpdatesThatSuspend />
</FbInternalOnly>

<OssOnly>

`Suspense` boundary fallbacks allow us to describe our loading placeholders when initially rendering some content, but our applications will also have transitions between different content. Specifically, when switching between two components within an already mounted boundary, the new component you're switching to might not have loaded all of its async dependencies, which means that it might also suspend.

In these cases, we would still show the `Suspense` boundary fallbacks. However, this means that we would hide existing content in favor of showing the `Suspense` fallback. In future versions of React when concurrent rendering is supported, React will provide an option to support this case and avoid hiding already rendered content with a Suspense fallback when suspending.

</OssOnly>

## How We Use Suspense in Relay

### Queries

In our case, our query components are components that can suspend, so we use Suspense to render loading states while a query is being fetched. Let's see what that looks like in practice:

Say we have the following query renderer component:

```js
/**
 * MainContent.react.js
 *
 * Query Component
 */

const React = require('React');
const {graphql, usePreloadedQuery} = require('react-relay');

function MainContent(props) {
  // Fetch and render a query
  const data = usePreloadedQuery<...>(
    graphql`...`,
    props.queryRef,
  );

  return (...);
}
```

```js
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

function App() {
  return (
    // LoadingGlimmer is rendered via the Suspense fallback
    <Suspense fallback={<LoadingGlimmer />}>
      <MainContent /> {/* MainContent may suspend */}
    </Suspense>
  );
}
```

<FbSuspensePlaceholder />

Let's distill what's going on here:

* We have a `MainContent` component, which is a query renderer that fetches and renders a query. `MainContent` will *suspend* rendering when it attempts to fetch the query, indicating that it isn't ready to be rendered yet, and it will resolve when the query is fetched.
* The `Suspense `component that wraps `MainContent` will detect that `MainContent` suspended, and will render the `fallback` element (i.e. the `LoadingGlimmer` in this case) up until `MainContent` is ready to be rendered; that is, up until the query is fetched.


### Fragments

<FbInternalOnly>
  <FbSuspenseInRelayFragments />
</FbInternalOnly>

<OssOnly>

Fragments are also integrated with Suspense in order to support rendering of data that's being `@defer'`d or data that's partially available in the Relay Store (i.e. [partial rendering](../../reusing-cached-data/rendering-partially-cached-data/)).

</OssOnly>

### Transitions

<FbInternalOnly>
  <FbSuspenseInRelayTransitions />
</FbInternalOnly>

Additionally, our APIs for refetching ([Refreshing and Refetching](../../refetching/)) and for [rendering connections](../../list-data/connections/) are also integrated with Suspense; for these use cases, these APIs will also suspend.

<DocsRating />
