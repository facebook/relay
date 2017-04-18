# The Relay "Compiler"

The Relay "Compiler" is responsible for generating code as part of a build step which, at runtime, can be used statically. By building the query ahead of time, the client's JS runtime is not responsible for generating a query string, and fields that are duplicated in the query can be merged during the build step, to improve parsing efficiency. If you have the ability to persist queries to your server, the compiler's code generation process provides a convenient time to convert a query or mutation's text into a unique identifier, which greatly reduces the upload bytes required.

Included in the `relay-compiler` package is a simple code generation utility, `RelayCompilerBin`, which provides a simple entry point to some of the more powerful transformation and generation utilities.

## Using `RelayCompilerBin` to generate runtime code

You need a valid schema file, describing your GraphQL server's API (as valid GraphQL):
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
  image: Url
}
```
Let's call this `schema.graphql`, and it lives in `./data`.

Additionally, you need a directory containing `.js` files that use the `graphql` tag to describe GraphQL queries and fragments. Let's call this `./js`

Once you've installed `relay-compiler`, you can generate query and fragment descriptions to use at runtime. If you don't generate the descriptions, at runtime, the `BabelPluginRelay` will not be able to transform your `graphql` tags into valid Relay runtime objects.

To create a re-useable build script, you can include `relay-compiler` in your `devDependencies` and add a script to your `package.json`:
```json
"scripts": {
  "build": "relay-compiler --src ./js --schema ./data/schema.graphql"
},
"devDependencies": {
  "relay-compiler": "<npm-version>"
}
```
Then run `npm run build`.

This will create a series of `__generated__` directories that are co-located with the corresponding files containing `graphql` tags. For instance, let's assume there are two files:
- `js/Components/DictionaryComponent.js`
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
- `js/Queries/DictionaryQuery.js`
```javascript
const DictionaryQuery = graphql`
  query DictionaryQuery {
    dictionary {
      ...Dictionary_word
    }
  }
`
```

This would produce three generated files, and two `__generated__` directories:
- `js/Components/__generated__/DictionaryComponent_word.graphql.js`
- `js/Components/__generated__/DictionaryComponent_definition.graphql.js`
- `js/Queries/DictionaryQuery.graphql.js`

## Importing generated definitions

For the most part, you won't need to manually import your generated definitions: the `BabelPluginRelay` will convert the
```javascript
const DictionaryWordFragment = graphql`
  fragment DictionaryComponent_word on Word {
    id
    definition {
      ...DictionaryComponent_definition
    }
  }
`
```
into
```javascript
const DictionaryWordFragment = require('./__generated__/DictionaryComponent_word.graphql.js');
```

## Flow
When using `RelayCompilerBin`, flow types are automatically generated, as [type comments](https://flow.org/en/docs/types/comments/). To import the type:
```javascript
import type {DictionaryComponent_word} from './__generated__/DictionaryComponent_word.graphql';
```

## More

The Relay Compiler was designed to be modular. While the `RelayCompilerBin` provides one approved entry point into Relay's code generation, if you find you need to do something unique (like generate types that conform to an older version of flow, or to parse non-javascript source files), you can build your own version of the `RelayCompilerBin` by swapping in your own `FileWriter` and `FileParser`, or by adding on an additional `IRTransform`. Note, the internal APIs of the `RelayCompiler` are in flux, so rolling your own version may lead to incompatibilities with future releases.
