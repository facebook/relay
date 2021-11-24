---
id: graphql-in-relay
title: GraphQL in Relay
original_id: graphql-in-relay
---

import useBaseUrl from '@docusaurus/useBaseUrl';

<blockquote> <strong>Note:</strong> This section contains references to Relay Modern (pre-hooks) APIs. Prefer the documentation at <a href={useBaseUrl('docs')}>the current docs</a> instead.</blockquote>

Table of Contents:

-   [`graphql`](#graphql)
-   [Directives](#directives)
-   [Relay Compiler](#relay-compiler)

## `graphql`

The `graphql` template tag provided by Relay serves as the mechanism to write queries, fragments, mutations or subscriptions in the [GraphQL](http://graphql.org/learn/) language. For example:

```javascript
import {graphql} from 'react-relay';

graphql`
  query MyQuery {
    viewer {
      id
    }
  }
`;
```

The result of using the `graphql` template tag is a `GraphQLTaggedNode`; a runtime representation of the GraphQL document.

However, `graphql` template tags are **never executed at runtime**. Instead, they are compiled ahead of time by the [Relay Compiler](#relay-compiler) into generated artifacts that live alongside your source code, and which Relay requires to operate at runtime. The [Relay Babel plugin](./installation-and-setup#setup-babel-plugin-relay) will then convert the `graphql` literals in your code into `require()` calls for the generated files.

## Directives

Relay uses directives to add additional information to GraphQL documents, which are used by the [Relay Compiler](#relay-compiler) to generate the appropriate runtime artifacts. These directives only appear in your application code and are removed from requests sent to your GraphQL server.

**Note:** The relay-compiler will maintain any directives supported by your server (such as `@include` or `@skip`) so they remain part of the request to the GraphQL server and won't alter generated runtime artifacts.

### `@arguments`

`@arguments` is a directive used to pass arguments to a fragment that was defined using [`@argumentDefinitions`](#argumentdefinitions). For example:

```graphql
query TodoListQuery($userID: ID) {
  ...TodoList_list @arguments(count: $count, userID: $userID) # Pass arguments here
}
```

See the [the fragment docs](./a-guided-tour-of-relay#fragments) for more details.

### `@argumentDefinitions`

`@argumentDefinitions` is a directive used to specify arguments taken by a fragment. For example:

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

See the [the fragment docs](./a-guided-tour-of-relay#fragments) for more details.

### `@connection(key: String!, filters: [String])`

When using [`usePaginationFragment`](./a-guided-tour-of-relay#rendering-list-data-and-pagination), Relay expects connection fields to be annotated with a `@connection` directive.

### `@relay(plural: Boolean)`

When defining a fragment, you can use the `@relay(plural: true)` directive to indicate that the fragment is backed by a [GraphQL list](http://graphql.org/learn/schema/#lists-and-non-null), meaning that it will inform Relay that this particular field is an array. For example:

```javascript
graphql`
fragment TodoItems_items on TodoItem @relay(plural: true) {
  id
  text
}`;

// Plural fragment usage: note the parent type is a list of items (`TodoItem[]`)
fragment TodoApp_app on App {
  items {
    // parent type is a list here
    ...TodoItem_items
  }
}
```

### `@inline`

By default, Relay will only expose the data for fields explicitly requested by a [component's fragment](./a-guided-tour-of-relay#fragments), which is known as [data masking](./PrinciplesAndArchitecture-ThinkingInRelay.md#data-masking). Fragment data is unmasked for use in React components by `useFragment`. However, you may want to use fragment data in non-React functions that are called from React.

Non-React functions can also take advantage of data masking. A fragment can be defined with the `@inline` directive and stored in a local variable. The non-React function can then "unmask" the data using the `readInlineData` function.

In the example below, the function `processItemData` is called from a React component. It requires an item object with a specific set of fields. All React components that use this function should spread the `processItemData_item` fragment to ensure all of the correct item data is loaded for this function.

```javascript
import {graphql, readInlineData} from 'react-relay';

// non-React function called from React
function processItemData(itemRef) {
  const item = readInlineData(graphql`
    fragment processItemData_item on Item @inline {
      title
      price
      creator {
        name
      }
    }
  `, itemRef);
  sendToThirdPartyApi({
    title: item.title,
    price: item.price,
    creatorName: item.creator.name
  });
}
```

```javascript
// React Component
function MyComponent({item}) {
  function handleClick() {
    processItemData(item);
  }

  return (
    <button onClick={handleClick}>Process {item.title}</button>
  );
}

export default createFragmentContainer(MyComponent, {
  item: graphql`
    fragment MyComponent_item on Item {
      ...processItemData_item
      title
    }
  `
});
```

### `@relay(mask: Boolean)`

Relay by default will only expose the data for fields explicitly requested by a [fragment](./a-guided-tour-of-relay#fragments), which is known as [data masking](./PrinciplesAndArchitecture-ThinkingInRelay.md#data-masking).

However, `@relay(mask: false)` can be used to prevent data masking; when including a fragment and annotating it with `@relay(mask: false)`, its data will be available to the parent, recursively including the data from the fields of the referenced fragment.

This may be helpful to reduce redundant fragments when dealing with nested or recursive data within a single Component.

Keep in mind that it is typically considered an **anti-pattern** to create a single fragment shared across many containers. Abusing this directive could result in over-fetching in your application.

In the example below, the `user` prop will include the data for `id` and `name` fields wherever `...Component_internUser` is included, instead of Relay's normal behavior to mask those fields:

```javascript
graphql`
  fragment Component_internUser on InternUser {
    id
    name
  }
`;

createFragmentContainer(
  ({ user }) => /* ... */,
  graphql`
    fragment Component_user on User {
      internUser {
        manager {
          ...Component_internUser @relay(mask: false)
        }
        .... on Employee {
          admins {
            ...Component_internUser @relay(mask: false)
          }
          reports {
            ...Component_internUser @relay(mask: false)
          }
        }
      }
    }
  `,
);
```

## Relay Compiler

Relay uses the Relay Compiler to convert [`graphql`](#graphql) literals into generated files that live alongside your source files.

A query like the following:

```javascript
graphql`
  fragment MyComponent on Type {
    field
  }
`

```

Will cause a generated file to appear in `./__generated__/MyComponent.graphql`,
with both runtime artifacts (which help to read and write from the Relay Store)
and [Flow types](https://flow.org/) to help you write type-safe code.

The Relay Compiler is responsible for generating code as part of a build step which can then be referenced at runtime. By building the query ahead of time, the Relay's runtime is not responsible for generating a query string, and various optimizations can be performed on the query that could be too expensive at runtime (for example, fields that are duplicated in the query can be merged during the build step, to improve efficiency of processing the GraphQL response).

### Persisting queries

Relay Compiler supports the use of **persisted queries**, in which each version of a query is associated to a unique ID on the server and the runtime uploads only the persisted ID instead of the full query text. This has several benefits: it can significantly reduce the time to send a query (and the upload bytes) and enables _whitelisting_ of queries. For example, you may choose to disallow queries in text form and only allow queries that have been persisted (and that presumably have passed your internal code review process).

Persisted queries can be enabled by instructing Relay Compiler to emit metadata about each query, mutation, and subscription into a JSON file. The generated file will contain a mapping of query identifiers to query text, which you can then save to your server. To enable persisted queries, use the `--persist-output` flag to the compiler:

```javascript
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql --persist-output ./path/to/persisted-queries.json"
}
```

Relay Compiler will then create the id =&gt; query text mapping in the path you specify. You can then use this complete
json file in your server side to map query ids to operation text.

### Set up relay-compiler

See our relay-compiler section in our [Installation and Setup guide](./installation-and-setup#set-up-relay-compiler).

### GraphQL Schema

To use the Relay Compiler, you need either a .graphql or .json GraphQL schema file, describing your GraphQL server's API. Typically these files are local representations of a server source of truth and are not edited directly. For example, we might have a `schema.graphql` like:

```graphql
schema {
  query: Root
}

type Root {
  dictionary: [Word]
}

type Word {
  id: String!
  definition: WordDefinition
}

type WordDefinition {
  text: String
  image: String
}
```

### Source files

Additionally, you need a directory containing `.js` files that use the `graphql` tag to describe GraphQL queries and fragments. Let's call this `./src`.

Then run `yarn run relay` as set up before.

This will create a series of `__generated__` directories that are co-located with the corresponding files containing `graphql` tags.

For example, given the two files:

-   `src/Components/DictionaryComponent.js`

    ```javascript
    const DictionaryWordFragment = graphql`
      fragment DictionaryComponent_word on Word {
        id
        definition {
          ...DictionaryComponent_definition
        }
      }
    `

    const DictionaryDefinitionFragment = graphql`
      fragment DictionaryComponent_definition on WordDefinition {
        text
        image
      }
    `

    ```

-   `src/Queries/DictionaryQuery.js`

    ```javascript
    const DictionaryQuery = graphql`
      query DictionaryQuery {
        dictionary {
          ...DictionaryComponent_word
        }
      }
    `

    ```

This would produce three generated files, and two `__generated__` directories:

-   `src/Components/__generated__/DictionaryComponent_word.graphql.js`
-   `src/Components/__generated__/DictionaryComponent_definition.graphql.js`
-   `src/Queries/__generated__/DictionaryQuery.graphql.js`

### Importing generated definitions

Typically you will not need to import your generated definitions. The [Relay Babel plugin](./installation-and-setup#setup-babel-plugin-relay) will then convert the `graphql` literals in your code into `require()` calls for the generated files.

However the Relay Compiler also automatically generates [Flow](https://flow.org) types as [type comments](https://flow.org/en/docs/types/comments/). For example, you can import the generated flow types like so:

```javascript
import type {DictionaryComponent_word} from './__generated__/DictionaryComponent_word.graphql';
```

### Client schema extensions

The Relay Compiler fully supports client-side schema extensions, which allows you to extend the server schema by defining additional GraphQL types and fields on the client. Relay expects the client schema to be located in your `--src` directory.

For example, assuming the server schema `./schema.graphql`:

```graphql
schema {
  query: Root
}

type Root {
  title: String!
}
```

We can create a `./src/clientSchema.graphql` and define a new type called `Setting`:

```graphql
type Setting {
  name: String!
  active: Boolean!
}
```

We can then extend existing server types in the client schema `./src/clientSchema.graphql` with our new `Setting` type, like so:

```graphql
extend type Root {
  settings: [Setting]
}
```

Any fields specified in the client schema, can be fetched from the Relay Store by selecting it in a query or fragment.

### Advanced usage

In addition to the bin script, the `relay-compiler` package also [exports library code](https://github.com/facebook/relay/blob/main/packages/relay-compiler/RelayCompilerPublic.js) which you may use to create more complex configurations for the compiler, or to extend the compiler with your own custom output.

If you find you need to do something unique (like generate types that conform to an older version of flow, or to parse non-javascript source files), you can build your own version of the Compiler by swapping in your own `FileWriter` and `ASTCache`, or by adding on an additional `IRTransform`. Note, the internal APIs of the `RelayCompiler` are under constant iteration, so rolling your own version may lead to incompatibilities with future releases.
