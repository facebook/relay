---
id: classic-guides-containers
title: Containers
original_id: classic-guides-containers
---
The primary way to declare data requirements is via `Relay.Container` — a higher-order React component that lets React components encode their data requirements.

Similar to how a React component's `render` method does not directly modify native views, Relay containers do not directly fetch data. Instead, containers declare a _specification_ of the data needed to render. Relay guarantees that this data is available _before_ rendering.

## A Complete Example

To start, let's build the plain React version of a `<ProfilePicture>` component that displays the user's profile photo and a slider to adjust the photo's size.

### Base React Component

Here's a basic implementation of `<ProfilePicture>` that ignores styling in order to highlight the functionality:

```

class ProfilePicture extends React.Component {
  render() {
    // Expects the `user` prop to have the following shape:
    // {
    //   profilePhoto: {
    //     uri,
    //   }
    // }
    var user = this.props.user;
    return (
      <View>
        <Image uri={user.profilePhoto.uri} width={...} />
        <Slider onChange={value => this.setSize(value)} />
      </View>
    );
  }

  // Update the size of the photo
  setSize(photoSize) {
    // TODO: Fetch the profile photo URI for the given size...
  }
}
```

### Data Dependencies With GraphQL

In Relay, data dependencies are described using [GraphQL](https://github.com/facebook/graphql). For `<ProfilePicture>`, the dependency can be expressed as follows. Note that this exactly matches the shape that the component expected for the `user` prop.

```

Relay.QL`
  # This fragment only applies to objects of type 'User'.
  fragment on User {
    # Set the 'size' argument to a GraphQL variable named '$size' so that we can
    # later change its value via the slider.
    profilePhoto(size: $size) {
      # Get the appropriate URI for the given size, for example on a CDN.
      uri,
    },
  }
`

```

### Relay Containers

Given the plain React component and a GraphQL fragment, we can now define a `Container` to tell Relay about this component's data requirements. Let's look at the code first and then see what's happening:

```

class ProfilePicture extends React.Component // as above

// Export a *new* React component that wraps the original `<ProfilePicture>`.
module.exports = Relay.createContainer(ProfilePicture, {
  // Specify the initial value of the `$size` variable.
  initialVariables: {
    size: 32
  },
  // For each of the props that depend on server data, we define a corresponding
  // key in `fragments`. Here, the component expects server data to populate the
  // `user` prop, so we'll specify the fragment from above as `fragments.user`.
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        profilePhoto(size: $size) {
          uri,
        },
      }
    `,
  },
});
```

## Containers are Higher-Order Components

Relay containers are higher-order components — `Relay.createContainer` is a function that takes a React component as input and returns a new component as output. This means that the container can manage data fetching and resolution logic without interfering with the `state` of the inner component.

Here's what happens when the container is rendered:

<div className="diagram">
  <img src="/img/docs/Guides-Containers-HOC-Relay.png" title="Relay Containers" />
</div>

In the diagram above:

-   A parent component will pass in a reference to some `User` "record".
-   The container — named `Relay(ProfilePicture)` for debugging — will retrieve the response for each GraphQL fragment from the local store.
-   The container passes the results of each fragment (along with the other props) to the `<ProfilePicture>` component.
-   `<ProfilePicture>` receives a `user` prop with plain JavaScript data - objects, arrays, strings - and renders as usual.

## Requesting Different Data

One thing is left in the example above — implementing `setSize()`, which should change the photo's size when the slider values changes. In addition to passing the results of each query to the component, Relay also provides a `relay` prop that has Relay-specific methods and metadata. These include `variables` — the active variables used to fetch the current `props` — and `setVariables()` — a callback that can be used to request data for different variable values.

```{"{"}5-6,11,26-28{"}"}

class ProfilePicture extends React.Component {
  render() {
    // Access the resolved data for the `user` fragment.
    var user = this.props.user;
    // Access the current `variables` that were used to fetch the `user`.
    var variables = this.props.relay.variables;
    return (
      <View>
        <Image
          uri={user.profilePhoto.uri}
          width={variables.size}
        />
        <Slider onChange={value => this.setSize(value)} />
      </View>
    );
  }

  // Update the size of the photo.
  setSize(photoSize) {
    // `setVariables()` tells Relay that the component's data requirements have
    // changed. The value of `props.relay.variables` and `props.user` will
    // continue to reflect their previous values until the data for the new
    // variables has been fetched from the server. As soon as data for the new
    // variables becomes available, the component will re-render with an updated
    // `user` prop and `variables.size`.
    this.props.relay.setVariables({
      size: photoSize,
    });
  }
}
```

## Container Composition

React and Relay support creating arbitrarily complex applications through _composition_. Larger components can be created by composing smaller components, helping us to create modular, robust applications. There are two aspects to composing components in Relay:

-   Composing the view logic, and
-   Composing the data descriptions.

Let's explore how this works via a `<Profile>` component that composes the `<ProfilePicture>` from above.

### Composing Views - It's Plain React

View composition is _exactly_ what you're used to — Relay containers are standard React components. Here's the `<Profile>` component:

```{"{"}8-9{"}"}

class Profile extends React.Component {
  render() {
    // Expects a `user` with a string `name`, as well as the information
    // for `<ProfilePicture>` (we'll get that next).
    var user = this.props.user;
    return (
      <View>
        // It works just like a React component, because it is one!
        <ProfilePicture user={user} />
        <Text>{user.name}</Text>
      </View>
    );
  }
}
```

### Composing Fragments

Fragment composition works similarly — a parent container's fragment composes the fragment for each of its children. In this case, `<Profile>` needs to fetch information about the `User` that is required by `<ProfilePicture>`.

Relay containers provide a static `getFragment()` method that returns a reference to that component's fragment:

```{"{"}15{"}"}

class Profile extends React.Component // as above

module.exports = Relay.createContainer(Profile, {
  fragments: {
    // This `user` fragment name corresponds to the prop named `user` that is
    // expected to be populated with server data by the `<Profile>` component.
    user: () => Relay.QL`
      fragment on User {
        # Specify any fields required by '<Profile>' itself.
        name,

        # Include a reference to the fragment from the child component. Here,
        # the 'user' is the name of the fragment specified on the child
        # "<ProfilePicture>'s" 'fragments' definition.
        ${ProfilePicture.getFragment('user')},
      }
    `,
  }
});
```

The final data declaration is equivalent to the following plain GraphQL:

```

`
  fragment Profile on User {
    name,
    ...ProfilePhoto,
  }

  fragment ProfilePhoto on User {
    profilePhoto(size: $size) {
      uri,
    },
  }
`

```

Note that when composing fragments, the type of the composed fragment must match the field on the parent in which it is embedded. For example, it wouldn't make sense to embed a fragment of type `Story` into a parent's field of type `User`. Relay and GraphQL will provide helpful error messages if you get this wrong (and if they aren't helpful, let us know!).

## Rendering Containers

As we've learned, Relay containers declare data requirements as GraphQL fragments. This means that, for example, `<ProfilePicture>` can be embedded not only in `<Profile>`, but any container that fetches a field of type `User`.

We're almost ready to let Relay fulfill the data requirements for these components and render them. However, there is one problem. In order to actually fetch data with GraphQL, we need a query root. For example, we need to ground the `<Profile>` fragment in a concrete node of type `User`.

In Relay, the root of a query is defined by a **Route**. Continue to learn about Relay routes.
