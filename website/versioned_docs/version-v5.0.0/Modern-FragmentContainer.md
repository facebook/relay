---
id: fragment-container
title: Fragment Container
original_id: fragment-container
---
A Fragment Container is a [higher-order component](https://reactjs.org/docs/higher-order-components.html) that allows components to specify their data requirements. A container does not directly fetch data, but instead declares a _specification_ of the data needed for rendering, and then Relay will guarantee that this data is available _before_ rendering occurs.

Table of Contents:

-   [`createFragmentContainer`](#createfragmentcontainer)
-   [Example](#example)
-   [Container Composition](#container-composition)
-   [Rendering Containers](#rendering-containers)

## `createFragmentContainer`

`createFragmentContainer` has the following signature:

```javascript
createFragmentContainer(
  component: ReactComponentClass,
  fragmentSpec: {[string]: GraphQLTaggedNode},
): ReactComponentClass;
```

### Arguments

-   `component`: The React Component _class_ of the component requiring the fragment data.
-   `fragmentSpec`: Specifies the data requirements for the Component via a GraphQL fragment. The required data will be available on the component as props that match the shape of the provided fragment. `fragmentSpec` should be an object whose keys are prop names and values are `graphql` tagged fragments. Each key specified in this object will correspond to a prop available to the resulting Component.
    -   **Note:** `relay-compiler` enforces fragments to be named as `<FileName>_<propName>`.

### Available Props

The Component resulting from `createFragmentContainer` will receive the following `props`:

```

type Props = {
  relay: {
    environment: Environment,
  },
  // Additional props as specified by the fragmentSpec
}
```

-   `relay`:
    -   `environment`: The current [Relay Environment](Modern-RelayEnvironment.md)

## Example

To start, let's build the plain React version of a hypothetical `<TodoItem />` component that displays the text and completion status of a `Todo`.

### React Component

Here's a basic implementation of `<TodoItem />` that ignores styling in order to highlight the functionality:

```javascript
// TodoItem.js
class TodoItem extends React.Component {
  render() {
    // Expects the `item` prop to have the following shape:
    // {
    //   item: {
    //     text,
    //     isComplete
    //   }
    // }
    const item = this.props.item;
    return (
      <View>
        <Checkbox checked={item.isComplete} />
        <Text>{item.text}</Text>
      </View>
    );
  }
}
```

### Data Dependencies With GraphQL

In Relay, data dependencies are described using [GraphQL](https://github.com/facebook/graphql). For `<TodoItem />`, the dependency can be expressed as follows. Note that this exactly matches the shape that the component expected for the `item` prop.

```javascript
graphql`
  # This fragment only applies to objects of type 'Todo'.
  fragment TodoItem_item on Todo {
    text
    isComplete
  }
`

```

### Defining Containers

Given the plain React component and a GraphQL fragment, we can now define a Fragment Container to specify this component's data requirements. Let's look at the code first and then see what's happening:

```javascript
// TodoItem.js
import {createFragmentContainer, graphql} from 'react-relay';

class TodoItem extends React.Component // as above

// Export a *new* React component that wraps the original `<TodoItem>`.
export default createFragmentContainer(TodoItem, {
  // For each of the props that depend on server data, we define a corresponding
  // key in this object. Here, the component expects server data to populate the
  // `item` prop, so we'll specify the fragment from above at the `item` key.
  item: graphql`
    fragment TodoItem_item on Todo {
      text
      isComplete
    }
  `,
});
```

## Container Composition

React and Relay support creating arbitrarily complex applications through _composition_. Larger components can be created by composing smaller components, helping us to create modular, robust applications.

Let's explore how this works via a `<TodoList />` component that composes the `<TodoItem />` we defined above.

### Composing Views

View composition is _exactly_ what you're used to — Relay containers are just standard React components. Here's the `<TodoList />` component:

```javascript
class TodoList extends React.Component {
  render() {
    // Expects a `list` with a string `title`, as well as the information
    // for the `<TodoItem>`s (we'll get that next).
    const list = this.props.list;
    return (
      <View>
        <Text>{list.title}</Text>
        {list.todoItems.map(item => <TodoItem
          // It works just like a React component, because it is one!
          item={item}
        />)}
      </View>
    );
  }
}
```

### Composing Fragments

Fragment composition works similarly — a parent container's fragment composes the fragment for each of its children. In this case, `<TodoList />` needs to fetch information about the `Todo`s that are required by `<TodoItem />`.

```javascript
class TodoList extends React.Component // as above

export default createFragmentContainer(TodoList, {
  // This `list` fragment corresponds to the prop named `list` that is
  // expected to be populated with server data by the `<TodoList>` component.
  list: graphql`
    fragment TodoList_list on TodoList {
      # Specify any fields required by '<TodoList>' itself.
      title
      # Include a reference to the fragment from the child component.
      todoItems {
        ...TodoItem_item
      }
    }
  `,
});
```

Note that when composing fragments, the type of the composed fragment must match the field on the parent in which it is embedded. For example, it wouldn't make sense to embed a fragment of type `Story` into a parent's field of type `User`. Relay and GraphQL will provide helpful error messages if you get this wrong (and if they aren't helpful, let us know!).

### Passing Arguments to a Fragment

#### `@argumentDefinitions`

When defining a fragment, you can use the [`@argumentDefinitions`](Modern-GraphQLInRelay.md#argumentdefinitions) directive to specify any arguments, with potentially default values, that the fragment expects.

For example, let's redefine our `TodoList_list` fragment to take some arguments using `@argumentDefinitions`:

```graphql
fragment TodoList_list on TodoList @argumentDefinitions(
  count: {type: "Int", defaultValue: 10},  # Optional argument
  userID: {type: "ID"},                    # Required argument
) {
  title
  todoItems(userID: $userID, first: $count) {  # Use fragment arguments here as variables
    ...TodoItem_item
  }
}
```

Any arguments defined inside `@argumentDefinitions` will be local variables available inside the fragment's scope. However, a fragment can also reference global variables that were defined in the root query.

#### `@arguments`

In order to pass arguments to a fragment that has `@argumentDefinitions`, you need to use the [`@arguments`](Modern-GraphQLInRelay.md#arguments) directive.

Following our `TodoList_list` example, we would pass arguments to the fragment like so:

```graphql
query TodoListQuery($count: Int, $userID: ID) {
  ...TodoList_list @arguments(count: $count, userID: $userID) # Pass arguments here
}
```

## Rendering Containers

As we've learned, Relay fragment containers only declare data requirements as GraphQL fragments. In order to actually fetch and render the specified data, we need to use a `QueryRenderer` component to render a root query and any fragment containers included within. Please refer to our [`QueryRenderer`](Modern-QueryRenderer.md) docs for more details.
