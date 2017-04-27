---
id: fragment-container
title: FragmentContainer
layout: docs
category: Relay Modern
permalink: docs/fragment-container.html
next: refetch-container
---

The primary way to declare data requirements is via `createFragmentContainer` — a higher-order React component that lets React components encode their data requirements.

Similar to how a React component's `render` method does not directly modify native views, Relay containers do not directly fetch data. Instead, containers declare a *specification* of the data needed to render. Relay guarantees that this data is available *before* rendering.

## A Complete Example

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

React and Relay support creating arbitrarily complex applications through *composition*. Larger components can be created by composing smaller components, helping us to create modular, robust applications. There are two aspects to composing components in Relay:

- Composing the view logic, and
- Composing the data descriptions.

Let's explore how this works via a `<TodoList>` component that composes the `<TodoItem>` from above.

### Composing Views - It's Plain React

View composition is *exactly* what you're used to — Relay containers are standard React components. Here's the `<TodoList>` component:

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

Fragment composition works similarly — a parent container's fragment composes the fragment for each of its children. In this case, `<TodoList>` needs to fetch information about the `Todo`s that are required by `<TodoItem>`.

```javascript
class TodoList extends React.Component {/* as above */}

module.exports = createFragmentContainer(
  TodoList, {
  // This `_list` fragment name suffix corresponds to the prop named `list` that
  // is expected to be populated with server data by the `<TodoList>` component.
  graphql`
    fragment TodoList_list on TodoList {
      # Specify any fields required by '<TodoList>' itself.
      title,
      # Include a reference to the fragment from the child component.
      todoItems {
        ...TodoItem_item
      }
    }
  `,
);
```

Note that when composing fragments, the type of the composed fragment must match the field on the parent in which it is embedded. For example, it wouldn't make sense to embed a fragment of type `Story` into a parent's field of type `User`. Relay and GraphQL will provide helpful error messages if you get this wrong (and if they aren't helpful, let us know!).

## Rendering Containers

As we've learned, Relay fragment containers declare data requirements as GraphQL fragments.
We're almost ready to let Relay fulfill the data requirements for these components and render them. However, there is one problem. In order to actually fetch data with GraphQL, we need a query root. For example, we need to ground the `<TodoList>` fragment in a GraphQL query.

In Relay, the root of a query is defined by a **QueryRenderer** so check out that section for more details.
