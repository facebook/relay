---
id: api-cheatsheet
title: API Cheatsheet
original_id: api-cheatsheet
---
A reference for translating between the Relay Classic and Relay Modern APIs.

### To add a new root for relay components

Classic: `<RelayRootContainer>`

Modern: `<QueryRenderer>`

### To add a new relay container

Classic: `Relay.createContainer`

Modern: `createFragmentContainer`

### To add a new relay container that has changing data requirements

Classic: `Relay.createContainer`

Modern `createRefetchContainer`

### To add a new paginating relay container

Classic: `Relay.createContainer`

Modern: `createPaginationContainer`

### To update a variable for my component

Classic: `this.props.relay.setVariable({foo: bar}...)`

Modern: `this.props.relay.refetch({foo: bar}...` in a Refetch Container

### To paginate through a connection

Classic: `this.props.relay.setVariable({count: prevCount + pageSize}...)`

Modern `this.props.relay.loadMore(pageSize...)` in a Pagination Container

### To force fetch a component

Classic: `this.props.relay.forceFetch()`

Modern: `this.props.relay.refetchConnection(...)` in a Pagination Container

or: `this.props.relay.refetch({}, {}, callback, {force: true})` in a Refetch Container

### To commit a mutation

Classic: `this.props.relay.commitUpdate(mutation...)`

Modern: `commitMutation(this.props.relay.environment, {mutation...})`
