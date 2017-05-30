---
id: relay-compiler
title: Relay Compiler
layout: docs
category: Relay Modern
permalink: docs/relay-compiler.html
next: relay-compat
---

Relay Modern uses the Relay Compiler to convert `graphql` literals into generated
files that live alongside your source files.

While you type queries as:

```javascript
graphql`
  fragment MyComponent on Type {
    field
  }
`
```

This causes a generated file to appear in `./__generated__/MyComponent.graphql`,
with both runtime artifacts (which help to read and write from the Relay Store)
and [Flow types](https://flow.org/) to help you write type-safe code.

The Relay Compiler is responsible for generating code as part of a build step which, at runtime, can be used statically. By building the query ahead of time, the client's JS runtime is not responsible for generating a query string, and fields that are duplicated in the query can be merged during the build step, to improve parsing efficiency. If you have the ability to persist queries to your server, the compiler's code generation process provides a convenient time to convert a query or mutation's text into a unique identifier, which greatly reduces the upload bytes required.


## Setting up Relay Compiler

First, you need [watchman](https://facebook.github.io/watchman) installed:

```sh
brew install watchman
```

Next, install the compiler (typically as a `devDependency`):

```sh
yarn add --dev relay-compiler
```

This installs the bin script `relay-compiler` in your node_modules folder. It's
recommended to run this from a yarn/npm script by adding a script to your
`package.json` file:

```js
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema.graphql"
}
```

The `relay-compiler` script requires both the directory which holds your source files as well as a path to your GraphQL schema in either a .json or .graphql schema file.

Then after making edits to your application files, just run `yarn run relay` to generate new files, or `yarn run relay -- --watch` to run the compiler as a long-lived process which automatically generates new files whenever you save.


### Optionally install globally

Alternatively, you can install `relay-compiler` globally so you can access it directly:

```sh
yarn global add relay-compiler
```

Then after making edits to your application files, run `relay-compiler --src ./src --schema path/schema.graphql` to generate new files, or `relay-compiler --src ./src --schema path/schema.graphql --watch` to run the compiler as a long-lived process which automatically generates new files whenever you save.


## GraphQL Schema

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

## Source files

Additionally, you need a directory containing `.js` files that use the `graphql` tag to describe GraphQL queries and fragments. Let's call this `./src`.

Then run `yarn run relay` as set up before.

This will create a series of `__generated__` directories that are co-located with the corresponding files containing `graphql` tags.

For example, given the two files:

* `src/Components/DictionaryComponent.js`

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

* `src/Queries/DictionaryQuery.js`

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

* `src/Components/__generated__/DictionaryComponent_word.graphql.js`
* `src/Components/__generated__/DictionaryComponent_definition.graphql.js`
* `src/Queries/__generated__/DictionaryQuery.graphql.js`


## Importing generated definitions

Typically you will not need to import your generated definitions. The [Relay Babel plugin](./babel-plugin-relay.html) will convert the `graphql` literals to `require()` the generated files.

However the Relay Compiler also automatically generates flow types, as [type comments](https://flow.org/en/docs/types/comments/). To import the types:

```javascript
import type {DictionaryComponent_word} from './__generated__/DictionaryComponent_word.graphql';
```


## Advanced usage

In addition to the bin script, the `relay-compiler` package also [exports library
code](https://github.com/facebook/relay/blob/master/packages/relay-compiler/RelayCompilerPublic.js) which you may use to create more complex configurations for the compiler, or to extend the compiler with your own custom output.

If you find you need to do something unique (like generate types that conform to an older version of flow, or to parse non-javascript source files), you can build your own version of the Compiler by swapping in your own `FileWriter` and `FileParser`, or by adding on an additional `IRTransform`. Note, the internal APIs of the `RelayCompiler` are under constant iteration, so rolling your own version may lead to incompatibilities with future releases.
