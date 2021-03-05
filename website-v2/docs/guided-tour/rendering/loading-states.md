---
id: loading-states
title: Loading States with Suspense
slug: /guided-tour/rendering/loading-states/
---

import DocsRating from '../../../src/core/DocsRating';
import FbCometPlaceholder from '../../fb/FbCometPlaceholder.md';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';


As you may have noticed, we mentioned that using `usePreloadedQuery` will render data from a query that was (or is) being fetched from the server, but we didn't elaborate on how to render a loading UI while and if that data is still being fetched when we try to render it. We will cover that in this section.

<FbInternalOnly>

To render loading states while a query is being fetched, we rely on [React Suspense](https://our.internmc.facebook.com/intern/wiki/Comet/Placeholders_in_Comet#usesuspensetransition). Suspense is a new feature in React that allows components to interrupt or *"suspend"* rendering in order to wait for some asynchronous resource (such as code, images or data) to be loaded; when a component "suspends", it indicates to React that the component isn't *"ready"* to be rendered yet, and won't be until the asynchronous resource it's waiting for is loaded. When the resource finally loads, React will try to render the component again.

</FbInternalOnly>

<OssOnly>

To render loading states while a query is being fetched, we rely on [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html). Suspense is a new feature in React that allows components to interrupt or *"suspend"* rendering in order to wait for some asynchronous resource (such as code, images or data) to be loaded; when a component "suspends", it indicates to React that the component isn't *"ready"* to be rendered yet, and won't be until the asynchronous resource it's waiting for is loaded. When the resource finally loads, React will try to render the component again.

</OssOnly>

This capability is useful for components to express asynchronous dependencies like data, code, or images that they require in order to render, and lets React coordinate rendering the loading states across a component tree as these asynchronous resources become available. More generally, the use of Suspense give us better control to implement more deliberately designed loading states when our app is loading for the first time or when it's transitioning to different states, and helps prevent accidental flickering of loading elements (such as spinners), which can commonly occur when loading sequences aren't explicitly designed and coordinated.


<FbInternalOnly>

For a lot more details on Suspense, check out our [Suspense in Comet docs](https://our.internmc.facebook.com/intern/wiki/Comet/Placeholders_in_Comet) and the official [React docs on Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html).

</FbInternalOnly>

## Loading fallbacks with Suspense Boundaries

When a component is suspended, we need to render a *fallback* in place of the component while we wait for it to become *"ready"*. In order to do so, we use the `Suspense` component provided by React:

```js
const React = require('React');
const {Suspense} = require('React');

function App() {
  return (
    // Render a fallback using Suspense as a wrapper
    <Suspense fallback={<LoadingSpinner />}>
      <CanSuspend />
    </Suspense>
  );
}
```


`Suspense` components can be used to wrap any component; if the target component suspends, `Suspense` will render the provided fallback until all its descendants become *"ready"* (i.e. until *all* of the promises thrown inside its subtree of descendants resolve). Usually, the fallback is used to render a loading state, such as a glimmer.

Usually, different pieces of content in our  app might suspend, so we can show loading state until they are resolved by using `Suspense` :

```js
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

const LoadingSpinner = require('./LoadingSpinner.react');
const MainContent = require('./MainContent.react');

function App() {
  return (
    // LoadingSpinner is rendered via the Suspense fallback
    <Suspense fallback={<LoadingSpinner />}>
      <MainContent /> {/* MainContent may suspend */}
    </Suspense>
  );
}
```

<FbCometPlaceholder />

Let's distill what's going on here:

* If `MainContent` suspends because it's waiting on some asynchronous resource (like data), the `Suspense` component that wraps `MainContent` will detect that it suspended, and will render the `fallback` element (i.e. the `LoadingSpinner` in this case) up until `MainContent` is ready to be rendered. Note that this also transitively includes descendants of `MainContent`, which might also suspend.


What's nice about Suspense is that you have granular control about how to accumulate loading states for different parts of your component tree:

```js
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

const LoadingSpinner = require('./LoadingSpinner.react');
const MainContent = require('./MainContent.react');
const SecondaryContent = require('./SecondaryContent.react');

function App() {
  return (
    // A LoadingSpinner for *_all_* content is rendered via the Suspense fallback
    <Suspense fallback={<LoadingSpinner />}>
      <MainContent />
      <SecondaryContent />  *{**/* SecondaryContent can also suspend */**}*
    </Suspense>
  );
}
```

<FbCometPlaceholder />

* In this case, both `MainContent` and `SecondaryContent` may suspend while they load their asynchronous resources; by wrapping both in a `Suspense`, we can show a single loading state up until they are *all* ready, and then render the entire content in a single paint, after everything has successfully loaded.
* In fact, `MainContent` and `SecondaryContent` may suspend for different reasons other than fetching data, but the same `Suspense` component can be used to render a fallback up until *all* components in the subtree are ready to be rendered. Note that this also transitively includes descendants of `MainContent` or `SecondaryContent`, which might also suspend.


Conversely, you can also decide to be more granular about your loading UI and wrap Suspense components around smaller or individual parts of your component tree:

```js
/**
 * App.react.js
 */

const React = require('React');
const {Suspense} = require('React');

const LoadingSpinner = require('./LoadingSpinner.react');
const LeftColumn = require('./LeftHandColumn.react');
const LeftColumnPlaceholder = require('./LeftHandColumnPlaceholder.react');
const MainContent = require('./MainContent.react');
const SecondaryContent = require('./SecondaryContent.react');


function App() {
  return (
    <>
      {/* Show a separate loading UI for the LeftHandColumn */}
      <Suspense fallback={<LeftColumnPlaceholder />}>
        <LeftColumn />
      </Suspense>

      {/* Show a separate loading UI for both the Main and Secondary content */}
      <Suspense fallback={<LoadingSpinner />}>
        <MainContent />
        <SecondaryContent />
      </Suspense>
    </>
  );
}
```

<FbCometPlaceholder />

* In this case, we're showing 2 separate loading UIs:
    * One to be shown until the `LeftColumn` becomes ready
    * And one to be shown until both the `MainContent` and `SecondaryContent` become ready.
* What is powerful about this is that by more granularly wrapping our components in Suspense, *we allow other components to be rendered earlier as they become ready*. In our example, by separately wrapping `MainContent` and `SecondaryContent` under `Suspense`, we're allowing `LeftColumn` to render as soon as it becomes ready, which might be earlier than when the content sections become ready.



## Transitions and Updates that Suspend

`Suspense` boundary fallbacks allow us to describe our loading states when initially rendering some content, but our applications will also have transitions between different content. Specifically, when switching between two components within an already mounted boundary, the new component you're switching to might not have loaded all of its async dependencies, which means that it will also suspend.

<FbInternalOnly>

Whenever we're going to make a transition that might cause new content to suspend, we should use [`useTransition`](https://our.internmc.facebook.com/intern/wiki/Comet/Placeholders_in_Comet#usesuspensetransition) to schedule the update for transition:

</FbInternalOnly>

<OssOnly>

Whenever we're going to make a transition that might cause new content to suspend, we should use [`useTransition`](https://reactjs.org/docs/concurrent-mode-patterns.html#transitions) to schedule the update for  transition:

</OssOnly>

```js
function TabSwitcher() {
  // We use startTransition to schedule the update
  const [startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = useState('Home');

  return (
    <div>
      <Suspense fallback={<LoadingGlimmer />}>
        <MainContent tab={selectedTab} />
      </Suspense>
      <Button
        onClick={() =>
          startTransition(() => {
            // Schedule an update that might suspend
            setSelectedTab('Photos');
          })
        }>
        Show Photos
      </Button>
    </div>
  );
}
```

Let's take a look at what's happening here:

* We have a `MainContent` component that takes a tab to render. This component might suspend while it loads the content for the current tab. During initial render, if this component suspends, we'll show the `LoadingGlimmer` fallback from the `Suspense` boundary that is wrapping it.
* Additionally, in order to change tabs, we're keeping some state for the currently selected tab; when we set state to change the current tab, this will be an update that can cause the `MainContent` component to suspend again, since it may have to load the content for the new tab. Since this update may cause the component to suspend, we need to make sure to schedule it using the ** `startTransition` ** function we get from ** `useTransition`. By doing so, we're letting React know that the update may suspend, so React can coordinate and render it at the right priority.


<FbInternalOnly>

However, when we make these sorts of transitions, we ideally want to avoid "bad loading states", that is, loading states (e.g. a glimmer) that would replace content that has already been rendered on the screen. In this case for example, if we're already showing content for a tab, instead of immediately replacing the content with a glimmer, we might instead want to render some sort of "pending" or "busy" state to let the user know that we're changing tabs, and then render the new selected tab when it's hopefully mostly ready. In order to do so, this is where we need to take into account the different [stages](https://fb.workplace.com/notes/sebastian-markbage/3-paints/462082611213402/) of a transition (*pending* → *loading* → *complete*), and make use of additional Suspense [primitives](https://our.internmc.facebook.com/intern/wiki/Comet/Placeholders_in_Comet#usesuspensetransition) that allow us to control what we want to show at each stage.

</FbInternalOnly>

<OssOnly>

However, when we make these sorts of transitions, we ideally want to avoid "bad loading states", that is, loading states (e.g. a glimmer) that would replace content that has already been rendered on the screen. In this case for example, if we're already showing content for a tab, instead of immediately replacing the content with a glimmer, we might instead want to render some sort of "pending" or "busy" state to let the user know that we're changing tabs, and then render the new selected tab when it's hopefully mostly ready. In order to do so, this is where we need to take into account the different stages of a transition (*pending* → *loading* → *complete*), and make use of additional Suspense primitives that allow us to control what we want to show at each stage.

</OssOnly>

The *pending* state is the first state in a transition, and is usually rendered close to the element that initiated the action (e.g. a "busy spinner" next to a button); it should occur immediately (at a high priority), and be rendered quickly in order to give feedback to the user that their action has been registered. The *loading* state occurs when we actually start showing the new content or the next screen; this update is usually heavier it can take a little longer, so it doesn't need to be executed at the highest priority. *During the loading state is where we'll show the fallbacks from our `Suspense` boundaries* (i.e. placeholders for the new content, like glimmers);  some of the content might be partially rendered during this stage as async resources are loaded, so it can occur in multiple steps, until we finally reach the *complete* state, where the full content is rendered.

By default, when a suspense transition occurs, if the new content suspends, React will automatically transition to the loading state and show the fallbacks from any `Suspense` boundaries that are in place for the new content.  However, if we want to delay showing the loading state, and show a *pending* state instead, we can also use `useTransition` to do so:

```js
const SUSPENSE_CONFIG = {
  // timeoutMs allows us to delay showing the "loading" state for a while
  // in favor of showing a "pending" state that we control locally
  timeoutMs: 10 * 1000, // 10 seconds
};

function TabSwitcher() {
  // isPending captures the "pending" state. It will become true
  // **immediately** when the transition starts, and will be set back to false
  // when the transition reaches the fully "completed" stage (i.e. when all the
  // new content has fully loaded)
  const [startTransition, isPending] = useTransition(SUSPENSE_CONFIG);
  const [selectedTab, setSelectedTab] = useState('Home');

  return (
    <div>
      <Suspense fallback={<LoadingGlimmer />}>
        <MainContent tab={selectedTab} />
      </Suspense>
      <Button
        onClick={() =>
          startTransition(() => {
            // Schedule an update that might suspend
            setSelectedTab('Photos');
          })
        }
        disabled={isPending}>
        Show Photos
      </Button>
    </div>
  );
}
```

> NOTE: Providing a Suspense config to `useTransition` will only work in *_React Concurrent Mode_*


Let's take a look at what's happening here:

* In this case, we're passing the `SUSPENSE_CONFIG` config object to `useTransition` in order to configure how we want this transition to behave. Specifically, we can pass a `timeoutMs` property in the config, which will dictate how long React should wait before transitioning to the *"loading"* state (i.e. transition to showing the fallbacks from the `Suspense` boundaries), in favor of showing a *"pending"* state controlled locally by the component during that time.
* `useTransition` will also return a `isPending` boolean value, which captures the pending state. That is, this value will become `true` *immediately* when the transition starts, and will become `false` when the transition reaches the fully *"completed"* stage, that is, when all the new content has been fully loaded. As mentioned above, the pending state should be used to give immediate feedback to the user that they're action has been received, and we can do so by using the `isPending` value to control what we render; for example, we can use that value to render a spinner next to the button, or in this case, disable the button immediately after it is clicked.


<FbInternalOnly>

For more details, check out the [Suspense in Comet docs](https://our.internmc.facebook.com/intern/wiki/Comet/Placeholders_in_Comet).

</FbInternalOnly>


## How We Use Suspense in Relay

_Queries_

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

function MainContent() {
  // Fetch and render a query
  const data = usePreloadedQuery<...>(
    graphql`...`,
    {...}, /* variables */
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

const LoadingSpinner = require('./LoadingSpinner.react');
const MainContent = require('./MainContent.react');

function App() {
  return (
    // LoadingSpinner is rendered via the Suspense fallback
    <Suspense fallback={<LoadingSpinner />}>
      <MainContent /> {/* MainContent may suspend */}
    </Suspense>
  );
}
```

<FbCometPlaceholder />

Let's distill what's going on here:

* We have a `MainContent` component, which is a query renderer that fetches and renders a query. `MainContent` will *suspend* rendering when it attempts to fetch the query, indicating that it isn't ready to be rendered yet, and it will resolve when the query is fetched.
* The `Suspense `component that wraps `MainContent` will detect that `MainContent` suspended, and will render the `fallback` element (i.e. the `LoadingSpinner` in this case) up until `MainContent` is ready to be rendered; that is, up until the query is fetched.


_Fragments_

<FbInternalOnly>

Fragments are also integrated with Suspense in order to support rendering of data that's being [`@defer'`d](https://www.internalfb.com/intern/wiki/Relay/Web/incremental-data-delivery-defer-stream/#defer) or data that's partially available in the Relay Store (i.e. [partial rendering](../../reusing-cached-data/)).

</FbInternalOnly>

<OssOnly>

Fragments are also integrated with Suspense in order to support rendering of data that's being `@defer'`d or data that's partially available in the Relay Store (i.e. [partial rendering](../../reusing-cached-data/)).

</OssOnly>

_Transitions_

Additionally, our APIs for refetching ([re-rendering with different data](../../refetching/)) and for [rendering connections](../../list-data/connections/) are also integrated with Suspense; for these use cases, we are initiating Suspense transitions after initial content has been rendered, such as by refetching or paginating, which means that these transitions should also use `useTransition`. Check out those sections for more details.

<DocsRating />
