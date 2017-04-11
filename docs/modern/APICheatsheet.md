A reference for translating between the classic and modern APIs.

|I need to... | Legacy API | Modern API
|-----|-----|-----
|add a new root for relay components | `<RelayRootContainer>` | `<QueryRenderer>`
|add a new relay container | `Relay.createContainer`| `createFragmentContainer`
|add a new relay container that has changing data requirements| `Relay.createContainer` | `createRefetchContainer`
|add a new paginating relay container | `Relay.createContainer` | `createPaginationContainer`
|update a variable for my component| `this.props.relay.setVariable({foo: bar}...)`| `this.props.relay.refetch({foo:bar}...` in a `RefetchContainer`
|paginate through a connection| `this.props.relay.setVariable({count: prevCount + pageSize}...)` | `this.props.relay.loadMore(pageSize...)` in a `PaginationContainer`
|force fetch a component| `this.props.relay.forceFetch()` | `this.props.relay.refetchConnection(...)` in a `PaginationContainer` and `this.props.relay.refetch({}, callback, {force:true})` in a `RefetchContainer`
|commit a mutation| `this.props.relay.commitUpdate(mutation...)` | `commitMutation(this.props.relay.environment, {mutation...)`
