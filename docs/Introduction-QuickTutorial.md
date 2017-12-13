---
id: quick-start-guide
title: Quick Start Guide
---

In this guide we are going to give a brief overview of how Relay works and how to use it, using as reference an example todo list app. For more thorough documentation, check out our Guides and API sections.

Table of contents:

- [Setup](#setup)
- [Relay Environment](#relay-environment)
- [Rendering GraphQL Queries](#rendering-graphql-queries)
- [Using Query Variables](#using-query-variables)
- [Using Fragments](#using-fragments)
- [Composing Fragments](#composing-fragments)
- [Rendering Fragments](#rendering-fragments)
- [Mutating Data](#mutating-data)

## Setup

Before starting, make sure to check out our [Prerequisites](./prerequisites.html) and [Installation and Setup](./installation-and-setup.html) guides. As mentioned in the prerequisites, we need to make sure that we've set up a GraphQL server and schema.

Fortunately, we are going to be using this [example todo list app](https://github.com/relayjs/relay-examples/tree/master/todo), which already has a  [server](https://github.com/relayjs/relay-examples/blob/master/todo/server.js) and schema [schema](https://github.com/relayjs/relay-examples/blob/master/todo/data/schema.graphql) available for us to use:

```graphql
# From schema.graphql
# https://github.com/relayjs/relay-examples/blob/master/todo/data/schema.graphql

type Query {
  viewer: User

  # Fetches an object given its ID
  node(
    # The ID of an object
    id: ID!
  ): Node
}
```

Additionally, we will be using [Flow](https://flow.org/) inside our Javascript code examples. Flow is optional to set up in your project, but we will include it in our examples for completeness.

## Relay Environment

Before we can start rendering pixels on the screen, we need to configure Relay via a [Relay Envionment](./relay-environment.html). The environment bundles together the configuration, cache storage, and network-handling that Relay needs in order to operate.

For the purposes of our example, we are simply going to configure our environment to communicate with our existing GraphQL server:

```javascript
import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';

function fetchQuery(
  operation,
  variables,
) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables: variables,
    }),
  }).then(response => {
    return response.json();
  });
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),  
});
```
A Relay Environment requires at least a [Store](./api-reference-store.html) and a [Network Layer](./network-layer). The above code uses the default implementation for `Store`, and creates a [Network Layer](./network-layer) using a simple `fetchQuery` function to fetch a GraphQL query from our server.

Usually we'd want a single environment in our app, so you could export this environment as a singleton instance from a module to make it accessible across your app.

## Rendering GraphQL Queries

Now that we've configured our Relay Environment, we can start fetching queries and rendering data on the screen. The entry point to render data from a GraphQL query is the [`QueryRenderer`](./query-renderer) component provided by `react-relay`.

To start, let's assume we just want to render the user id on the screen. From our [schema](https://github.com/relayjs/relay-examples/blob/master/todo/data/schema.graphql#L66), we know that we can get the current `User` via the `viewer` field, so let's write a sample query to fetch the current user id:

```graphql
query UserQuery {
  viewer {
    id
  }  
}
```

Now, let's see what it would take to create a component that fetches and renders the above query:

```javascript
// App.js
import React from 'react';
import {graphql, QueryRenderer} from 'react-relay';

const environment = /* defined or imported above... */;

export default App extends React.Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query UserQuery {
            viewer {
              id
            }  
          }
        `}
        variables={{}}
        render={({error, props}) => {
          if (error) {
            return <div>Error!</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return <div>User ID: {props.viewer.id}</div>;
        }}
      />
    );
  }
}
```

Our app is rendering a `QueryRenderer` in the above code, like any other React Component, but let's see what's going on in the props that we are passing to it:

- We're passing the `environment` we defined earlier.
- We're using using the [`graphql`](./api-reference-graphql) function to define our GraphQL query. `graphql` is a function that is never executed at runtime, but rather used by the [Relay Compiler](./relay-compiler) to generate the runtime artifacts that Relay requires to operate. We don't need to worry about this right now; for more details check out our [`graphql`](./api-reference-graphql) and [Relay Compiler](./relay-compiler) docs.
- We're passing an empty set of `variables`. We'll look into how to use variables in the next section.
- We're passing a `render` function; as you can tell from the code, Relay gives us some information about whether an error occurred, or if we're still fetching the query. If everything succeeds, the data we requested will be available inside `props`, with the same shape as the one specified in the query.

In order to run this app, we need to first compile our query using the Relay Compiler. Assuming the setup from [Installation and Setup](./installation-and-setup), we can just run `yarn relay` or `npm run relay`.

For more details on `QueryRenderer`, check out the [docs](./query-renderer).

## Using Query Variables

Let's assume for a moment that in our app we want to be able to view data for different users, so we're going to somehow need to query users by id. From our [schema](https://github.com/relayjs/relay-examples/blob/master/todo/data/schema.graphql#L69), we know we can query nodes given an id, so let's write a parametrized query to get a user by id:

```graphql
query UserQuery($userID: ID!) {
  node(id: $userID) {
    id
  }
}
```

Now, let's see how we would fetch the above query using a `QueryRenderer`:

```javascript
// UserTodoList.js
// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {graphql, QueryRenderer} from 'react-relay';

const environment = /* defined or imported above... */;

type Props = {
  userID: string,
};

export default UserTodoList extends React.Component<Props> {
  render() {
    const {userID} = this.props;

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query UserQuery($userID: ID!) {
            node(id: $userID) {
              id
            }  
          }
        `}
        variables={{userID}}
        render={({error, props}) => {
          if (error) {
            return <div>Error!</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return <div>User ID: {props.node.id}</div>;
        }}
      />
    );
  }
}
```

The above code is doing something very similar to our [previous example](#rendering-graphql-queries), however, we are now passing a `$userID` variable to the GraphQL query, via the `variables` prop. This has a couple of important implications:

- Given that `userID` is also a prop that our component takes, it could receive a new `userID` from its parent component at any moment. When this happens, we new `variables` will be passed down to our `QueryRenderer`, which will automatically cause it to re-fetch the query with the new value for `$userID`.
- The `$userID` variable will now be available anywhere inside that query; this will become important when to keep in mind when using fragments.

Now that we've updated the query, don't forget to run `yarn relay`.

## Using Fragments

Now that we know how to define and fetch queries, let's actually start building a todo list.

First, let's start at the bottom; let's say that we want to render a component that given a todo item, simply displays the item's text and completed state:

```javascript
// Todo.js
import React from 'react';

type Props = {
  todo: {
    complete: boolean,
    text: string,
  },
};

export default class Todo extends React.Component<Props> {
  render() {
    const {complete, text} = this.props.todo;

    return (
      <li>
        <div>
          <input
            checked={complete}
            type="checkbox"
          />
          <label>
            {text}
          </label>
        </div>
      </li>
    );
  }
}
```

From our [schema](https://github.com/relayjs/relay-examples/blob/master/todo/data/schema.graphql#L107), we know that we can query this data on the `Todo` type. However, we don't want to have to send a separate query for each todo item; that would defeat the purpose of using GraphQL over a traditional REST API. We could manually query for these fields directly in our `QueryRenderer` query, but that would hurt re-usability: what if we want to query the same set of fields as part of a different query? Additionally, we wouldn't know which component needs the data we're querying, a problem Relay directly tries to address.

Instead, we can define a reusable [Fragment](http://graphql.org/learn/queries/#fragments), which allows us to define a set of fields on a type and reuse them within our queries wherever we need to:

```graphql
fragment TodoItemFragment on Todo {
  complete
  text
}
```

Our component can then use this fragment to declare its data dependency on the `Todo` GraphQL type:

```javascript
// Todo.js

// OPTIONAL: Flow type generated after running `yarn relay`, defining an Object type with shape of the fragment:
import type {Todo_todo} from './__generated__/Todo_todo.graphql';

import React from 'react';
import {graphql, createFragmentContainer} from 'react-relay'

type Props = {
  todo: Todo_todo
}

class Todo extends React.Component<Props> {
  render() {
    const {complete, text} = this.props.todo;

    return (
      <li>
        <div>
          <input
            checked={complete}
            type="checkbox"
          />
          <label>
            {text}
          </label>
        </div>
      </li>
    );
  }
}

export default createFragmentContainer(
  Todo,
  grapqhl`
    # As a convention, we name the fragment as '<ComponentFileName>_<PropName>'
    fragment Todo_todo on Todo {
      complete
      text
    }
  `
)
```

The above code highlights one of Relay's most important principles which is colocation of components with their data dependencies. This is beneficial for a few reasons:

- It becomes obvious at a glance what data is required to render a given component, without having to search which query in our app is fetching the required data.
- As a corollary, the component is de-coupled from the query that renders it. We can change the data dependencies for the component without having to update the queries that render them or worrying about breaking other components.

Check out our [Thinking in Relay](./thinking-in-relay) guide for more details behind Relay's principles.

Before proceeding, don't forget to run the Relay Compiler with `yarn relay`.

## Composing Fragments

Given that [Fragment Containers](./fragment-containers) are just React components, we can compose them as such, and even re-use fragment containers within other fragment containers. As an example, let's see how we would define a `TodoList` component that just renders a list of todo items:

```javascript
// TodoList.js

// OPTIONAL: Flow type generated after running `yarn relay`, defining an Object type with shape of the fragment:
import type {TodoList_userTodoData} from './__generated__/TodoList_userTodoData.graphql';

import React from 'react';
import {graphql, createFragmentContainer} from 'react-relay';

type Props = {
  userTodoData: TodoList_userTodoData,
}

class TodoList extends React.Component<Props> {
  renderTodos() {
    return this.props.userTodoData.todos.edges.map(edge =>
      <Todo
        key={edge.node.id}
        {/*We pass the required todo data here*/}
        todo={edge.node}
      />
    );
  }

  render() {
    const numTodos = this.props.viewer.totalCount;
    const numCompletedTodos = this.props.viewer.completedCount;
    return (
      <section>
        <input
          checked={numTodos === numCompletedTodos}
          type="checkbox"
        />
        <ul>
          {this.renderTodos()}
        </ul>
      </section>
    );
  }
}

export default createFragmentContainer(
  TodoList,
  graphql`
    fragment TodoList_userTodoData on User {
      todos(
        first: 2147483647  # max GraphQLInt, to fetch all todos
      ) {
        edges {
          node {
            id,
            # We use the fragment defined by the child Todo component here
            ...Todo_todo,
          },
        },
      },
      id,
      totalCount,
      completedCount,
    }
  `,
);
```

As with the first fragment container we defined, `TodoList` declares it's data dependencies via a fragment. However, this component additionally also uses a previously defined fragment by the child component, and passes the appropriate data to the child `Todo` fragment containers.

One final thing to note when composing fragment containers, is that the parent will not have access to the data defined by the child container, i.e. Relay only allows components to access data they specifically ask for in GraphQL fragments — nothing more. This is called [Data Masking](./thinking-in-relay), and it's intentional to prevent components from depending on data they didn't declare as a dependency.

## Rendering Fragments

Now that we have some components (a.k.a fragment containers) that declare their data dependencies, we need to hook them up to a `QueryRenderer` so that the data is actually fetched and rendered; remember,
fragment containers do not directly fetch data. Instead, containers declare a specification of the data needed to render, and Relay guarantees that this data is available before rendering.

A `QueryRenderer` using these fragments could look something like the following:

```javascript
// UserTodoList.js
import React from 'react';
import PropTypes from 'prop-types';
import {graphql, QueryRenderer} from 'react-relay';
import TodoList from './TodoList'

const environment = /* defined or imported above... */;

export default UserTodoList extends React.Component {
  static propTypes = {
    userID: PropTypes.string,
  }

  render() {
    const {userID} = this.props;

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query UserQuery($userID: ID!) {
            user: node(id: $userID) {
              id
              # Re-use the fragment here
              ...TodoList_userTodoData  
            }
          }
        `}
        variables={{userID}}
        render={({error, props}) => {
          if (error) {
            return <div>Error!</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return (
            <div>
              <div>Todo list for User {props.user.id}:</div>
              <TodoList userTodoData={props.user.userTodoData} />
            </div>
          );
        }}
      />
    );
  }
}
```

Check out or docs for [Fragment Containers](./fragment-container) for more details, and our guides on [Refetch](./refetch-container) and [Pagination](./pagination-container) for more advanced usage of containers.

## Mutating Data

TODO
