### Behavior

* It is expected for `useLazyLoadQuery` to have been rendered under a [`RelayEnvironmentProvider`](../relay-environment-provider), in order to access the correct Relay environment, otherwise an error will be thrown.
* Calling `useLazyLoadQuery`  will fetch and render the data for this query, and it may [*_suspend_*](../../guided-tour/rendering/loading-states) while the network request is in flight, depending on the specified `fetchPolicy`, and whether cached data is available, or if it needs to send and wait for a network request. If `useLazyLoadQuery` causes the component to suspend, you'll need to make sure that there's a `Suspense` ancestor wrapping this component in order to show the appropriate loading state.
    * For more details on Suspense, see our [Loading States with Suspense](../../guided-tour/rendering/loading-states/) guide.
* The component is automatically subscribed to updates to the query data: if the data for this query is updated anywhere in the app, the component will automatically re-render with the latest updated data.
* After a component using `useLazyLoadQuery` has committed, re-rendering/updating the component will not cause the query to be fetched again.
    * If the component is re-rendered with *different query variables,* that will cause the query to be fetched again with the new variables, and potentially re-render with different data.
    * If the component *unmounts and remounts*, that will cause the current query and variables to be refetched (depending on the `fetchPolicy` and the state of the cache).

### Differences with `QueryRenderer`

* `useLazyLoadQuery` no longer takes a Relay environment as a parameter, and thus no longer sets the environment in React Context, like `QueryRenderer` did. Instead, `useLazyLoadQuery` should be used as a descendant of a [`RelayEnvironmentProvider`](../relay-environment-provider), which now sets the Relay environment in Context. Usually, you should render a single `RelayEnvironmentProvider` at the very root of the application, to set a single Relay environment for the whole application.
* `useLazyLoadQuery` will use [Suspense](../../guided-tour/rendering/loading-states) to allow developers to render loading states using Suspense boundaries, and will throw errors if network errors occur, which can be caught and rendered with Error Boundaries. This as opposed to providing error objects or null props to the `QueryRenderer` render function to indicate errors or loading states.
* `useLazyLoadQuery` fully supports fetch policies in order to reuse data that is cached in the Relay store instead of solely relying on the network response cache.
* `useLazyLoadQuery` has better type safety guarantees for the data it returns, which was not possible with QueryRenderer since we couldn't parametrize the type of the data with a renderer api.
