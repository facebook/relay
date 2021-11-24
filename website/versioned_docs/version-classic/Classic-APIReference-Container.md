---
id: classic-api-reference-relay-container
title: RelayContainer
original_id: classic-api-reference-relay-container
---

`RelayContainer` is a higher-order React component that lets a React component encode its data requirements.

-   Relay ensures that this data is available before the component is rendered.
-   Relay updates the component whenever the underlying data has changed.

Relay containers are created using `Relay.createContainer`.

## Overview

_Container Specification_

<ul className="apiIndex">
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
  <li>
    <a href="#shouldcomponentupdate">
      <pre>shouldComponentUpdate</pre>
      Optionally override RelayContainer's default implementation of `shouldComponentUpdate`.
    </a>
  </li>
</ul>

_Properties and Methods_

These are the methods and properties that the container will provide as `this.props.relay` in the plain React component.

<ul className="apiIndex">
  <li>
    <a href="#route">
      <pre>route</pre>
    </a>
  </li>
  <li>
    <a href="#pendingvariables">
      <pre>pendingVariables </pre>
    </a>
  </li>
  <li>
    <a href="#variables">
      <pre>variables</pre>
    </a>
  </li>
  <li>
    <a href="#setvariables">
      <pre>setVariables([partialVariables[, onReadyStateChange]])</pre>
    </a>
  </li>
  <li>
    <a href="#forcefetch">
      <pre>forceFetch([partialVariables[, onReadyStateChange]]) </pre>
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

_Static Methods_

<ul className="apiIndex">
  <li>
    <a href="#getfragment">
      <pre>getFragment(name[, vars])</pre>
      Get a reference to a container fragment for inclusion in a parent fragment.
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

```{"{"}8-14{"}"}

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

See also: [Containers &gt; Relay Containers](./classic-guides-containers#relay-containers)

### initialVariables

```

initialVariables: {[name: string]: mixed};
```

The initial set of variable values available to this component's fragments.

#### Example

```{"{"}4{"}"}

class ProfilePicture extends React.Component {...}

module.exports = Relay.createContainer(ProfilePicture, {
  initialVariables: {size: 50},
  fragments: {
    user: () => Relay.QL`
      # The variable defined above is available here as '$size'.
      # Any variable referenced here is required to have been defined in initialVariables above.
      # An 'undefined' variable value will throw an 'Invariant Violation' exception.
      # Use 'null' to initialize unknown values.
      fragment on User { profilePicture(size: $size) { ... } }
    `,
  },
});
```

In this example, `profilePicture(size: 50)` will be fetched for the initial render.

### prepareVariables

```

prepareVariables: ?(
  prevVariables: {[name: string]: mixed}
) => {[name: string]: mixed}
```

Containers can define a `prepareVariables` method which provides the opportunity to modify the variables that are available to fragments. The new variables can be generated based on the previous variables (or the `initialVariables` if no previous ones exist) in addition to the runtime environment.

This method is also called after the partial set of variables from `setVariables` has been applied. The variables returned are used to populate the fragments.

#### Example

```{"{"}3-9{"}"}

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

### shouldComponentUpdate

```

shouldComponentUpdate: () => boolean;
```

RelayContainer implements a conservative default `shouldComponentUpdate` that returns `false` if no fragment props have changed and all other props are equal scalar values. This may block updates to components that receive data via context. To ensure an update in this case override the default behavior by specifying a `shouldComponentUpdate` function.

#### Example

```{"{"}2{"}"}

module.exports = Relay.createContainer(ProfilePicture, {
  shouldComponentUpdate: () => true,
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

See also: [Routes](./classic-guides-routes)

### variables

```

variables: {[name: string]: mixed}
```

`variables` contains the set of variables that was used to fetch the current set of props.

#### Example

```{"{"}8{"}"}

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

<blockquote>
Note

Never mutate <code>this.props.relay.variables</code> directly as it will not trigger data to be fetched properly. Treat <code>this.props.relay.variables</code> as if it were immutable, just like props.

</blockquote>

### pendingVariables

```

pendingVariables: ?{[name: string]: mixed}
```

`pendingVariables` contains the set of variables that are being used to fetch the new props, i.e. when `this.props.relay.setVariables()` or `this.props.relay.forceFetch()` are called and the corresponding request is in flight.

If no request is in flight pendingVariables is `null`.

#### Example

```{"{"}12{"}"}

class ProfilePicture extends React.Component {
  requestRandomPictureSize = () => {
    const randIntMin = 10;
    const randIntMax = 200;
    const size = (Math.floor(Math.random() * (randIntMax - randIntMin + 1)) + randIntMin);
    this.props.relay.setVariables({size});
  }

  render() {
    const {relay, user} = this.props;
    const {pendingVariables} = relay;
    if (pendingVariables && 'size' in pendingVariables) {
      // Profile picture with new size is loading
      return (
        <View>
          <LoadingSpinner />
        </View>
      )
    }

    return (
      <View>
        <Image
          uri={user.profilePicture.uri}
          width={relay.variables.size}
        />
        <button onclick={this.requestRandomPictureSize}>
          Request random picture size
        </button>
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

In this example, whenever a picture with a new size is being loaded a spinner is displayed instead of the picture.

### setVariables

```

setVariables([partialVariables: Object, [onReadyStateChange: Function]]): void

```

Components can change their data requirements by using `setVariables` to request an update to the current set of `variables`.

`this.props.relay.setVariables` can be called to update a subset or all of the variables at the same time. In return, Relay will use the new variables to attempt to fulfill the new fragment. This may involve sending a request to the server if data is not already available on the client.

An optional `onReadyStateChange` callback can be supplied to respond to the events involved with the data fulfillment.

#### Example

```{"{"}12-15{"}"}

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

<blockquote>
Note

<code>setVariables</code> does not immediately mutate <code>variables</code>, but creates a  pending state transition. <code>variables</code> will continue returning the previous values until <code>this.props</code> has been populated with data that fulfills the new variable values.

</blockquote>

See also: [Containers &gt; Requesting Different Data](./classic-guides-containers#requesting-different-data), [Ready State](./classic-guides-ready-state)

### forceFetch

```

forceFetch([partialVariables: Object, [onReadyStateChange: Function]]): void

```

`forceFetch` is similar to `setVariables` because it is also used to change the data requirements by altering `variables`.

The two methods differ in that instead of sending a query that includes only fields missing from the client, `forceFetch` sends a request to refetch each and every fragment. This ensures that the props for the component are freshly fetched from the server.

An optional `onReadyStateChange` callback can be supplied to respond to the events involved with the data fulfillment.

<blockquote>
Note

`forceFetch` can be called with an empty set of partial variables, meaning it can trigger a refresh of the currently rendered set of data.

</blockquote>

See also: [Ready State](./classic-guides-ready-state)

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
            // on the server using a different component.
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

See also: [Mutations &gt; Optimistic Updates](./classic-guides-mutations#optimistic-updates)

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

-   `UNCOMMITTED` — Transaction hasn't yet been sent to the server. Transaction can be committed or rolled back.
-   `COMMIT_QUEUED` —  Transaction was committed but another transaction with the same collision key is pending, so the transaction has been queued to send to the server.
-   `COLLISION_COMMIT_FAILED` — Transaction was queued for commit but another transaction with the same collision key failed. All transactions in the collision queue, including this one, have been failed. Transaction can be recommitted or rolled back.
-   `COMMITTING` — Transaction is waiting for the server to respond.
-   `COMMIT_FAILED` — Transaction was sent to the server for committing but failed.

## Static Methods

### getFragment

```

getFragment(
  fragmentName: string,
  variables?: {[name: string]: mixed}
): RelayFragmentReference

```

Gets a reference to a child container's fragment for inclusion in a parent fragment.

#### Example

Fragment composition is achieved via ES6 template string interpolation and `getFragment`:

```{"{"}6{"}"}

// Parent.js
Relay.createContainer(Parent, {
  fragments: {
    parentFragment: () => Relay.QL`
      fragment on Foo {
        id
        ${Child.getFragment('childFragment')}
      }
    `,
  }
});
// Child.js
Relay.createContainer(Child, {
  initialVariables: {
    size: 64,
  },
  fragments: {
    childFragment: () => Relay.QL`
      fragment on Foo {
        photo(size: $size) { uri }
      }
    `,
  }
});
```

In this example, whenever `Parent` is fetched, `Child`'s fragment will also be fetched. When rendering, `<Parent>` will only have access to the `props.foo.id` field;  data from the child fragment will be [_masked_](./PrinciplesAndArchitecture-ThinkingInRelay.md#data-masking). By default, `childFragment` will use its corresponding initial variables. Relay will fetch `photo(size: 64)`. When `<Child>` is rendered it will also make the initial variables available as `props.relay.variables = {size: 64}`.

#### Overriding Fragment Variables

Sometimes a parent needs to override the default variables of a child component. Imagine that we want to render `Child` above with a photo size of 128 instead of the default 64. To do this, we have to ensure that both the fragment _and_ the container know about the custom variable. To set a custom variable in the _query_, use the second argument to `getFragment`:

```{"{"}6{"}"}

// Parent.js
Relay.createContainer(Parent, {
  fragments: {
    parentFragment: () => Relay.QL`
      fragment on Foo {
        id
        ${Child.getFragment('childFragment', {size: 128})}
      }
    `,
  }
});
```

Now Relay will fetch the photo with size 128 - but the `Child` container won't magically know about this variable. We have to tell it by passing the variable value as a prop:

```{"{"}4{"}"}

const Parent = (props) => {
  return (
    <Child
      childFragment={props.parentFragment}
      size={128}
    />;
  );
}
```

Now Relay will both fetch the larger photo size _and_ `Child` will know to render it.
