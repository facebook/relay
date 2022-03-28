---
id: relay-compat
title: Compatibility Mode
original_id: relay-compat
---
Migrating a Relay Classic app to Relay Modern doesn't require rewriting from
scratch. Instead, convert one component at a time to the Relay Modern API while
continuing to have a working app. Once all components have been converted, the
smaller and faster Relay Modern runtime can be used.

During this migration, use the [Relay Compat](Modern-RelayCompat.md) tools and APIs to work with both Relay Classic and Relay Modern.

## API and Runtime

Relay can be thought of as two parts which work together: an API for building
data-driven components and a runtime which fetches and stores data from GraphQL
to populate your app. Relay Modern brings both a new API and a new runtime.

In order to incrementally convert an existing codebase, we will need to use the
Relay Modern API while continuing to use the Relay Classic runtime until all
components are converted.

Relay Compat is part of `'react-relay'` which allows you to do exactly this,
providing an identical API to Relay Modern, while allowing interoperability with
both runtimes.

## Getting started

Require the Relay Compat API from `'react-relay/compat'` and use it as you would
Relay Modern. The components using Relay Compat can be referred to by both other
Relay Modern and Relay Classic components.

```javascript
const {createFragmentContainer, graphql} = require('react-relay/compat');

class TodoItem extends React.Component {
  render() {
    const item = this.props.item;
    // ...
  }
}

module.exports = createFragmentContainer(TodoItem, graphql`
  fragment TodoItem_item on Todo {
    text
    isComplete
  }
`);
```
