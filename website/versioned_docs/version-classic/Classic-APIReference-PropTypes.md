---
id: classic-api-reference-relay-proptypes
title: Relay.PropTypes
original_id: classic-api-reference-relay-proptypes
---
Relay introduces two new classes of objects: `RelayContainer` and `Relay.Route`. `Relay.PropTypes` provides prop validators used to assert that props are of these types.

## Overview

_Properties_

<ul className="apiIndex">
  <li>
    <a href="#example">
      <pre>static Container: ReactPropTypeValidator</pre>
      A prop type validator asserting that a prop is a valid Relay container.
    </a>
  </li>
  <li>
    <a href="#example">
      <pre>static QueryConfig: ReactPropTypeValidator</pre>
      A prop type validator asserting that a prop is a valid route.
    </a>
  </li>
</ul>

## Example

```

class MyApplication extends React.Component {
  static propTypes = {
    // Warns if `Component` is not a valid RelayContainer.
    Component: Relay.PropTypes.Container.isRequired,
    // Warns if `route` is not a valid route.
    route: Relay.PropTypes.QueryConfig.isRequired,
  };
  render() {
    return (
      <Relay.RootContainer
        Component={this.props.Component}
        route={this.props.route}
      />
    );
  }
}
```
