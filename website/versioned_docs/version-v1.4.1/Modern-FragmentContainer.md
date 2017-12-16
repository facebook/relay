---
id: version-v1.4.1-fragment-container
title: FragmentContainer
original_id: fragment-container
---

Table of Contents:
- [`createFragmentContainer`](#createFragmentContainer)
- [Complete Example](#complete-example)
- [Container Composition](#container-composition)
- [Rendering Containers](#rendering-containers)

## `createFragmentContainer`

`createFragmentContainer` is a [higher-order component](https://reactjs.org/docs/higher-order-components.html) that allows components to specify their data requirements. Relay containers do not directly fetch data; instead, containers declare a *specification* of the data needed to render, and Relay guarantees that this data is available *before* rendering.

`createFragmentContainer` has the following signature:
```javascript
createFragmentContainer(
  component: ReactComponentClass,
  fragmentSpec: GraphQLTaggedNode | {[string]: GraphQLTaggedNode},
): ReactComponentClass;
```

### Arguments

* `component`: The React Component *class* of the component that requires the fragment data.
* `fragmentSpec`: Specifies the data requirements for the Component via a GraphQL fragment. The required data will be available on the component as props that match the shape of the provided fragment. `fragmentSpec` can be one of 2 things:
  * A `graphql` tagged fragment. If the fragment uses the name convention `<FileName>_<propName>`, the fragment's data will be available as a prop with the given `<propName>` in the resulting Component.
  If the fragment name doesn't specify a prop name, the data will be available in a `data` prop.
  * An object whose keys are prop names and values are `graphql` tagged fragments. Each key specified in this object will correspond to a prop in the resulting Component.
  * **Note:** To enable [compatibility mode](./relay-compat.html), `relay-compiler` enforces fragments to be named as `<FileName>_<propName>`.

## Complete Example

To start, let's build the plain React version of a `<TodoItem>` component that displays the text and completion status of a `Todo`.

### Base React Component
Here's a basic implementation of `<TodoItem>` that ignores styling in order to highlight the functionality:

```javascript
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

In Relay, data dependencies are described using [GraphQL](https://github.com/facebook/graphql). For `<TodoItem>`, the dependency can be expressed as follows. Note that this exactly matches the shape that the component expected for the `item` prop.

A naming convention of `<FileName>_<propName>` for fragments is advised. This restriction is required while migrating from classic to modern APIs to allow for cross-compatibility.

```javascript
graphql`
  # This fragment only applies to objects of type 'Todo'.
  fragment TodoItem_item on Todo {
    text
    isComplete
  }
`
```

### Relay Containers

Given the plain React component and a GraphQL fragment, we can now define a `Container` to tell Relay about this component's data requirements. Let's look at the code first and then see what's happening:

```javascript
class TodoItem extends React.Component {/* as above */}

// Export a *new* React component that wraps the original `<TodoItem>`.
module.exports = createFragmentContainer(TodoItem, {
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

The example above is very similar to the classic container API, but in the modern API we can just pass the `graphql` template literal directly as the second argument. Relay will infer the prop name from the fragment name according to the fragment naming convention `<FileName>_<propName>`. The example below is equivalent to the one above:

```javascript
module.exports = createFragmentContainer(
  TodoItem,
  graphql`
    fragment TodoItem_item on Todo {
      text
      isComplete
    }
  `,
);
```

If there is no `_<propName>` suffix, the `data` prop name will be used:

```javascript
class TodoItem extends React.Component {
  render() {
    const item = this.props.data;

  }
}
module.exports = createFragmentContainer(
  TodoItem,
  graphql`
    fragment TodoItem on Todo {
      text
      isComplete
    }
  `,
);
```

## Container Composition

React and Relay support creating arbitrarily complex applications through *composition*. Larger components can be created by composing smaller components, helping us to create modular, robust applications.

Let's explore how this works via a `<TodoList>` component that composes the `<TodoItem>` we defined above.

### Composing Views

View composition is *exactly* what you're used to— Relay containers are just standard React components. Here's the `<TodoList>` component:

```javascript
class TodoList extends React.Component {
  render() {
    // Expects a `list` with a string `title`, as well as the information
    // for the `<TodoItem>`s (we'll get that next).
    const list = this.props.list;
    return (
      <View>
        {/* It works just like a React component, because it is one! */}
        <Text>{list.title}</Text>
        {list.todoItems.map(item => <TodoItem item={item} />)}
      </View>
    );
  }
}
```

### Composing Fragments

Fragment composition works similarly— a parent container's fragment composes the fragment for each of its children. In this case, `<TodoList>` needs to fetch information about the `Todo`s that are required by `<TodoItem>`.

```javascript
class TodoList extends React.Component {/* as above */}

module.exports = createFragmentContainer(
  TodoList,
  // This `_list` fragment name suffix corresponds to the prop named `list` that
  // is expected to be populated with server data by the `<TodoList>` component.
  graphql`
    fragment TodoList_list on TodoList {
      # Specify any fields required by '<TodoList>' itself.
      title
      # Include a reference to the fragment from the child component.
      todoItems {
        ...TodoItem_item
      }
    }
  `,
);
```

Note that when composing fragments, the type of the composed fragment must match the field on the parent in which it is embedded. For example, it wouldn't make sense to embed a fragment of type `Story` into a parent's field of type `User`. Relay and GraphQL will provide helpful error messages if you get this wrong (and if they aren't helpful, let us know!).

### Calling Component Instance Methods

React component classes may have methods, often accessed via [refs](https://facebook.github.io/react/docs/refs-and-the-dom.html).
Since Relay composes these component instances in a container, you need to use the `componentRef` prop to access them:

Consider an input with a server-defined placeholder text and an imperative method to focus the input node:

```javascript
module.exports = createFragmentContainer(
  class TodoInput extends React.Component {
    focus() {
      this.input.focus();
    }

    render() {
      return <input
        ref={node => { this.input = node; }}
        placeholder={this.props.data.suggestedNextTitle}
      />;
    }
  },
  graphql`
    fragment TodoInput on TodoList {
      suggestedNextTitle
    }
  `,
);
```

To call this method on the underlying component, first provide a `componentRef` function to the Relay container. This differs from providing a [`ref`](https://facebook.github.io/react/docs/refs-and-the-dom.html) function which would provide a reference to the Relay container itself, not the underlying React Component.

```javascript
module.exports = createFragmentContainer(
  class TodoListView extends React.Component {
    render() {
      return <div onClick={() => this.input.focus()}>
        <TodoInput
          data={this.props.data}
          componentRef={ref => { this.input = ref; }}
        />
      </div>;
    }
  },
  graphql`
    fragment TodoListView on TodoList {
      ...TodoInput
    }
  `,
);
```

## Rendering Containers

As we've learned, Relay fragment containers only declare data requirements as GraphQL fragments. In order to actually fetch and render the specified data, we need to use a `QueryRenderer` component to render a root query and any fragment containers included within. Please refer to our [`QueryRenderer`](./query-renderer.html) docs for more details.
