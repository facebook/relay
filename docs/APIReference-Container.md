---
id: api-reference-relay-container
title: RelayContainer
layout: docs
category: API Reference
permalink: docs/api-reference-relay-container.html
next: api-reference-relay-route
---

`RelayContainer` is a higher-order React component that lets a React component encode its data requirements.

- Relay ensures that this data is available before the component is rendered.
- Relay updates the component whenever the underlying data has changed.

Relay containers are created using `Relay.createContainer`.

## Overview

*Container Specification*

<ul class="apiIndex">
  <li>
    <a href="#fragments">
      <pre>fragments</pre>
      Declare the component's data requirements using fragments.
    </a>
  </li>
  <li>
    <a href="#initialvariables">
      <pre>initialVariables</pre>
      The initial set of variable values available to this component's fragments.
    </a>
  </li>
  <li>
    <a href="#preparevariables">
      <pre>prepareVariables</pre>
      A method to modify the variables based on the runtime environment or previous variable values.
    </a>
  </li>
</ul>

*Properties and Methods*

These are the methods and properties that the container will provide as `this.props.relay` in the plain React component.

<ul class="apiIndex">
  <li>
    <a href="#route">
      <pre>route</pre>
    </a>
  </li>
  <li>
    <a href="#variables">
      <pre>variables</pre>
    </a>
  </li>
  <li>
    <a href="#setvariables">
      <pre>setVariables([partialVariables, [onReadyStateChange]])</pre>
    </a>
  </li>
  <li>
    <a href="#forcefetch">
      <pre>forceFetch([partialVariables, [onReadyStateChange]]) </pre>
    </a>
  </li>
  <li>
    <a href="#hasoptimisticupdate">
      <pre>hasOptimisticUpdate(record)</pre>
    </a>
  </li>
  <li>
    <a href="#getpendingtransactions">
      <pre>getPendingTransactions(record) </pre>
    </a>
  </li>
</ul>

## Container Specification

### fragments

```
fragments: RelayQueryFragments<Tk> = {
  [propName: string]: (
    variables: {[name: string]: mixed}
  ) => Relay.QL`fragment on ...`
};
```

Containers declare data requirements on `fragments` using GraphQL fragments.

Only fields specified by these fragments will be populated in `this.props` when the component is rendered. This ensures that there are no implicit dependencies from a component on its parent component or any child components.

#### Example

```{8-14}
class StarWarsShip extends React.Component {
  render() {
    return <div>{this.props.ship.name}</div>;
  }
}

module.exports = Relay.createContainer(StarWarsShip, {
  fragments: {
    ship: () => Relay.QL`
      fragment on Ship {
        name
      }
    `,
  },
});

```
In this example, the fields associated with the `ship` fragment will be made available on `this.props.ship`.

See also: [Containers > Relay Containers](guides-containers.html#relay-containers)

### initialVariables

```
initialVariables: {[name: string]: mixed};
```

The initial set of variable values available to this component's fragments.

#### Example

```{4}
class ProfilePicture extends React.Component {...}

module.exports = Relay.createContainer(ProfilePicture, {
  initialVariables: {size: 50},
  fragments: {
    user: () => Relay.QL`
      # The variable defined above is available here as `$size`.
      fragment on User { profilePicture(size: $size) { ... } }
    `,
  },
});
```

In this example, `profilePicture(size: 50)` will be fetched for the intial render.

### prepareVariables

```
prepareVariables: ?(
  prevVariables: {[name: string]: mixed}
) => {[name: string]: mixed}
```

Containers can define a `prepareVariables` method which provides the opportunity to modify the variables that are available to fragments. The new variables can be generated based on the previous variables (or the `initialVariables` if no previous ones exist) in addition to the runtime environment.

This method is also called after the partial set of variables from `setVariables` has been applied. The variables returned are used to populate the fragments.

#### Example

```{3-9}
module.exports = Relay.createContainer(ProfilePicture, {
  initialVariables: {size: 50},
  prepareVariables: prevVariables => {
    return {
      ...prevVariables,
      // If devicePixelRatio is `2`, the new size will be `100`.
      size: prevVariables.size * window.devicePixelRatio,
    };
  },
  // ...
});
```

## Properties and Methods
The properties and methods listed below can be accessed on `this.props.relay` from the wrapped React component.

### route

```
route: RelayRoute
```

Route is useful in providing the context which a component is being rendered in. It includes information about the `name`, `params`, and `queries` of the current route.

#### Example

```
var name = this.props.relay.route.name;
if (name === 'SuperAwesomeRoute') {
  // Do something super cool.
}
```

See also: [Routes](guides-routes.html)

### variables

```
variables: {[name: string]: mixed}
```

`variables` contains the set of variables that was used to fetch the current set of props.

#### Example

```{8}
class ProfilePicture extends React.Component {
  render() {
    var user = this.props.user;
    return (
      <View>
        <Image
          uri={user.profilePicture.uri}
          width={this.props.relay.variables.size}
        />
      </View>
    );
  }
}
module.exports = Relay.createContainer(ProfilePicture, {
  initialVariables: {size: 50},
  fragments: {
    user: () => Relay.QL`
      fragment on User { profilePicture(size: $size) { ... } }
    `,
  },
});
```
In this example, the `width` of the rendered image will always correspond to the `$size` variable used to fetch the current version of `profilePicture.uri`.

> Note
>
> Never mutate `this.props.relay.variables` directly as it will not trigger data to be fetched properly. Treat `this.props.relay.variables` as if it were immutable, just like props.

### setVariables

```
setVariables([partialVariables: Object, [onReadyStateChange: Function]]): void
```

Components can change their data requirements by using `setVariables` to request an update to the current set of `variables`.

`this.props.relay.setVariables` can be called to update a subset or all of the variables at the same time. In return, Relay will use the new variables to attempt to fulfill the new fragment. This may involve sending a request to the server if data is not already available on the client.

An optional `onReadyStateChange` callback can be supplied to respond to the events involved with the data fulfillment.

#### Example

```{12-15}
class Feed extends React.Component {
  render() {
    return (
      <div>
        {this.props.viewer.feed.edges.map(
          edge => <Story story={edge.node} key={edge.node.id} />
        )}
      </div>
    );
  }
  _handleScrollLoad() {
    // Increments the number of stories being rendered by 10.
    this.props.relay.setVariables({
      count: this.props.relay.variables.count + 10
    });
  }
}
module.exports = Relay.createContainer(Feed, {
  initialVariables: {count: 10},
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        feed(first: $count) {
          edges {
            node {
              id,
              ${Story.getFragment('story')},
            },
          },
        },
      }
    `,
  },
});
```

> Note
>
> `setVariables` does not immediately mutate `variables`, but creates a  pending state transition. `variables` will continue returning the previous values until `this.props` has been populated with data that fulfills the new variable values.

See also: [Containers > Requesting Different Data](guides-containers.html#requesting-different-data), [Ready State](guides-ready-state.html)

### forceFetch

```
forceFetch([partialVariables: Object, [onReadyStateChange: Function]]): void
```

`forceFetch` is similar to `setVariables` because it is also used to change the data requirements by altering `variables`.

The two methods differ in that instead of sending a query that includes only fields missing from the client, `forceFetch` sends a request to refetch each and every fragment. This ensures that the props for the component are freshly fetched from the server.

An optional `onReadyStateChange` callback can be supplied to respond to the events involved with the data fulfillment.

> Note
>
> `forceFetch` can be called with an empty set of partial variables, meaning it can trigger a refresh of the currently rendered set of data.

See also: [Ready State](guides-ready-state.html)

### hasOptimisticUpdate

```
hasOptimisticUpdate(record: Object): boolean
```

Calling `hasOptimisticUpdate` with a record from `this.props` will return whether that given record is affected by an optimistic mutation. It allows the component to render local optimistic changes differently from data that has successfully synchronized with the server.

#### Example

```
class Feed extends React.Component {
  render() {
    var edges = this.props.viewer.feed.edges;
    return (
      <div>
        {edges.map(edge => {
          var node = edge.node;
          if (this.props.relay.hasOptimisticUpdate(node)) {
            // Render pending story that has not been stored
            // on the server using a diffrent component.
            return (
              <PendingStory
                key={edge.node.id}
                story={edge.node}
              />
            );
          } else {
            return (
              <Story
                key={edge.node.id}
                story={edge.node}
              />
            );
          }
        })}
      </div>
    );
  }
}

module.exports = Relay.createContainer(Feed, {
  initialVariables: {count: 10},
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        feed(first: $count) {
          edges {
            node {
              id,
              ${Story.getFragment('story')},
              ${PendingStory.getFragment('story')}
            }
          }
        }
      }
    `,
  },
});

```

See also: [Mutations > Optimistic Updates](guides-mutations.html#optimistic-updates)

### getPendingTransactions

```
getPendingTransactions(record: Object): ?Array<RelayMutationTransaction>
```

Components can inspect pending mutations on any record (i.e. data made available in props with a corresponding fragment). Calling `getPendingTransactions` with a record will return a list of the pending mutation transactions that affect that particular record.

Each `RelayMutationTransaction` has methods to check the status of the mutation and provide ways to rollback or resend the mutation as needed.

#### Example

```
class Story extends React.Component {
  render() {
    var story = this.props.story;
    var transactions = this.props.relay.getPendingTransactions(story);
    // For this example, assume there is only one transaction.
    var transaction = transactions ? transactions[0] : null;
    if (transaction) {
      // Display an error message with a retry link if a mutation failed.
      if (transaction.getStatus() === 'COMMIT_FAILED') {
        return (
          <span>
            This story failed to post.
            <a onClick={transaction.recommit}>Try Again.</a>
          </span>
        );
      }
    }
    // Render story normally.
  }
}

module.exports = Relay.createContainer(ProfilePicture, {
  fragments: {
    story: () => Relay.QL`
      fragment on story {
        # ...
      }
    `,
  },
});
```

`RelayMutationTransaction.getStatus` can return one of the following strings:

- `UNCOMMITTED` — Transaction hasn't yet been sent to the server. Transaction can be committed or rolled back.
- `COMMIT_QUEUED` —  Transaction was committed but another transaction with the same collision key is pending, so the transaction has been queued to send to the server.
- `COLLISION_COMMIT_FAILED` — Transaction was queued for commit but another transaction with the same collision key failed. All transactions in the collision queue, including this one, have been failed. Transaction can be recommitted or rolled back.
- `COMMITTING` — Transaction is waiting for the server to respond.
- `COMMIT_FAILED` — Transaction was sent to the server for comitting but failed.
