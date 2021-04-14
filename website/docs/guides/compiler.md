---
id: compiler
title: Relay Compiler
slug: /guides/compiler/
description: Relay guide to the compiler
keywords:
- compiler
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'internaldocs-fb-helpers';
import FbRunningCompiler from './fb/FbRunningCompiler.md';
import FbGraphQLSchema from './fb/FbGraphQLSchema.md';
import FbImportingGeneratedDefinitions from './fb/FbImportingGeneratedDefinitions.md';

## `graphql`

The `graphql` template tag provided by Relay serves as the mechanism to write queries, fragments, mutations and subscriptions in the [GraphQL](http://graphql.org/learn/) language. For example:

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

Note that `graphql` template tags are **never executed at runtime**. Instead, they are compiled ahead of time by the Relay compiler into generated artifacts that live alongside your source code, and which Relay requires to operate at runtime.


## Compiler

Relay uses the Relay Compiler to convert [`graphql`](#graphql) literals into generated files that live alongside your source files.

A fragment like the following:

```javascript
graphql`
  fragment MyComponent on Type {
    field
  }
`
```

Will cause a generated file to appear in `./__generated__/MyComponent.graphql.js`,
with both runtime artifacts (which help to read and write from the Relay Store)
and [Flow types](https://flow.org/) to help you write type-safe code.

The Relay Compiler is responsible for generating code as part of a build step which can then be referenced at runtime. By building the query ahead of time, the Relay's runtime is not responsible for generating a query string, and various optimizations can be performed on the query that could be too expensive at runtime (for example, fields that are duplicated in the query can be merged during the build step, to improve efficiency of processing the GraphQL response).

### GraphQL Schema

<FbInternalOnly>
  <FbGraphQLSchema />
</FbInternalOnly>

<OssOnly>

To use the Relay Compiler, you need either a `.graphql` or `.json` [GraphQL Schema](https://graphql.org/learn/schema/) file, describing your GraphQL server's API. Typically these files are local representations of a server source of truth and are not edited directly. For example, we might have a `schema.graphql` like:

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

</OssOnly>

### Running the Compiler

<FbInternalOnly>
  <FbRunningCompiler />
</FbInternalOnly>

<OssOnly>

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

</OssOnly>


### Importing generated definitions

<FbInternalOnly>
  <FbImportingGeneratedDefinitions />

</FbInternalOnly>

<OssOnly>

Typically you will not need to import your generated definitions. The [Relay Babel plugin](../../getting-started/installation-and-setup#setup-babel-plugin-relay) will then convert the `graphql` literals in your code into `require()` calls for the generated files.

However the Relay Compiler also automatically generates [Flow](https://flow.org) types as [type comments](https://flow.org/en/docs/types/comments/). For example, you can import the generated Flow types like so:

```javascript
import type {DictionaryComponent_word} from './__generated__/DictionaryComponent_word.graphql';
```

More rarely, you may need to access a query, mutation, fragment or subscription from multiple files. In these cases, you can also import it directly:

```js
import DictionaryComponent_word from './__generated__/DictionaryComponent_word.graphql';
```

</OssOnly>


<DocsRating />
