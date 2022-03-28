---
id: graphql-in-relay
title: GraphQL in Relay
original_id: graphql-in-relay
---
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

The result of using the `graphql` template tag are `GraphQLTaggedNode`s, which are used to define [Query Renderers](Modern-QueryRenderer.md), [Fragment Containers](Modern-FragmentContainer.md), [Refetch Containers](Modern-RefetchContainer.md), [Pagination Containers](Modern-PaginationContainer.md), etc.

However, `graphql` template tags are **never executed at runtime**. Instead, they are compiled ahead of time by the [Relay Compiler](#relay-compiler) into generated artifacts that live alongside your source code, and which Relay requires to operate at runtime. The [Relay Babel plugin](Introduction-InstallationAndSetup.md#setup-babel-plugin-relay) will then convert the `graphql` literals in your code into `require()` calls for the generated files.

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

See [Fragment Container docs](Modern-FragmentContainer.md#passing-arguments-to-a-fragment) for more details.

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

See [Fragment Container docs](Modern-FragmentContainer.md#passing-arguments-to-a-fragment) for more details.

### `@connection(key: String!, filters: [String])`

When using the [Pagination Container](Modern-PaginationContainer.md), Relay expects connection fields to be annotated with a `@connection` directive. For more detailed information and example, check out our docs on using `@connection` inside a Pagination Container [`here`](Modern-PaginationContainer.md#connection).

**Note:** `@connection` is also supported in [compatibility mode](Modern-RelayCompat.md)

### `@relay(plural: Boolean)`

When defining a fragment, you can use the `@relay(plural: true)` directive to indicate that the fragment is backed by a [GraphQL list](http://graphql.org/learn/schema/#lists-and-non-null), meaning that it will inform Relay that this particular field is an array. For example:

```javascript
graphql`
fragment TodoItems_items on TodoItem @relay(plural: true) {
  id
  text
}`;
```

### `@relay(mask: Boolean)`

Relay by default will only expose the data for fields explicitly requested by a [component's fragment](Modern-FragmentContainer.md#createfragmentcontainer), which is known as [data masking](PrinciplesAndArchitecture-ThinkingInRelay.md#data-masking).

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

export default createFragmentContainer(
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

The Relay Compiler is responsible for generating code as part of a build step which, at runtime, can be used statically. By building the query ahead of time, the client's JS runtime is not responsible for generating a query string, and fields that are duplicated in the query can be merged during the build step, to improve parsing efficiency. If you have the ability to persist queries to your server, the compiler's code generation process provides a convenient time to convert a query or mutation's text into a unique identifier, which can greatly reduce the upload bytes required in some applications.

### Set up relay-compiler

See our relay-compiler section in our [Installation and Setup guide](Introduction-InstallationAndSetup.md#set-up-relay-compiler).

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

Typically you will not need to import your generated definitions. The [Relay Babel plugin](Introduction-InstallationAndSetup.md#setup-babel-plugin-relay) will then convert the `graphql` literals in your code into `require()` calls for the generated files.

However the Relay Compiler also automatically generates [Flow](https://flow.org) types as [type comments](https://flow.org/en/docs/types/comments/). For example, you can import the generated flow types like so:

```javascript
import type {DictionaryComponent_word} from './__generated__/DictionaryComponent_word.graphql';
```

### Advanced usage

In addition to the bin script, the `relay-compiler` package also [exports library code](https://github.com/facebook/relay/blob/main/packages/relay-compiler/RelayCompilerPublic.js) which you may use to create more complex configurations for the compiler, or to extend the compiler with your own custom output.

If you find you need to do something unique (like generate types that conform to an older version of flow, or to parse non-javascript source files), you can build your own version of the Compiler by swapping in your own `FileWriter` and `ASTCache`, or by adding on an additional `IRTransform`. Note, the internal APIs of the `RelayCompiler` are under constant iteration, so rolling your own version may lead to incompatibilities with future releases.
