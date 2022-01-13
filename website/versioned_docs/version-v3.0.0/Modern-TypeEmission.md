---
id: type-emission
title: Type Emission
original_id: type-emission
---
As part of its normal work, `relay-compiler` will emit type information for your language of choice that helps you write type-safe application code. These types are included in the artifacts that `relay-compiler` generates to describe your operations and fragments.

Regardless of your choice of language, all language plugins will emit roughly the same sort of type-information, but be sure to read the documentation for other [language plugins](#language-plugins) to learn about their specifics.

### Operation input data

The shape of the variables object used for query, mutation, or subscription operations.

In this example the emitted type-information would require the variables object to contain a `page` key with a non-null string.

#### Flow

```javascript
/**
 * export type ExampleQueryVariables = {|
 *   +artistID: string
 * |}
 */
import type { ExampleQueryVariables } from "__generated__/ExampleQuery.graphql"

const variables: ExampleQueryVariables = {
  artistID: 'banksy',
}

<QueryRenderer
  query={graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
      }
    }
  `}
  variables={variables}
/>

```

#### TypeScript

```javascript
/**
 * export type ExampleQueryVariables = {
 *   readonly artistID: string
 * }
 * export type ExampleQuery = {
 *   readonly variables: ExampleQueryVariables
 * }
 */
import { ExampleQuery } from "__generated__/ExampleQuery.graphql"

<QueryRenderer<ExampleQuery>
  query={graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
      }
    }
  `}
  variables={{
    artistID: 'banksy',
  }}
/>

```

### Operation/Fragment selection-set data

The shape of the data selected in a operation or fragment, following the [data-masking] rules. That is, excluding any data selected by fragment spreads, unless the `@relay(mask: false)` directive is used.

In this example the emitted type-information describes the response data available to the operation’s render function.

#### Flow

```javascript
/**
 * export type ExampleQueryResponse = {|
 *   +artist: ?{|
 *     +name: string
 *   |}
 * |}
 */
import type { ExampleQueryResponse } from "__generated__/ExampleQuery.graphql"

<QueryRenderer
  query={graphql`
    query ExampleQuery {
      artist(id: "banksy") {
        name
      }
    }
  `}
  render={({ props }: { props?: ExampleQueryResponse }) => {
    if (props) {
      return props.artist && <div>{props.artist.name} is great!</div>
    }
    return <div>Loading</div>
  }}
/>

```

#### TypeScript

```javascript
/**
 * export type ExampleQueryResponse = {
 *   readonly artist?: {
 *     readonly name: string
 *   }
 * }
 * export type ExampleQuery = {
 *   readonly response: ExampleQueryResponse
 * }
 */
import { ExampleQuery } from "__generated__/ExampleQuery.graphql"

<QueryRenderer<ExampleQuery>
  query={graphql`
    query ExampleQuery {
      artist(id: "banksy") {
        name
      }
    }
  `}
  render={({ props }) => {
    if (props) {
      return props.artist && <div>{props.artist.name} is great!</div>
    }
    return <div>Loading</div>
  }}
/>

```

Similarly, in this example the emitted type-information describes the prop data that the container expects to receive.

#### Flow

```javascript
/**
 * export type ExampleFragment_artist = {|
 *   +name: string
 * |}
 */
import type { ExampleFragment_artist } from "__generated__/ExampleFragment_artist.graphql"

export const ExampleFragment = createFragmentContainer(
  (props: { artist: ExampleFragment_artist }) => (
    <div>About the artist: {props.artist.biography}</div>
  ),
  {
    artist: graphql`
      fragment ExampleFragment_artist on Artist {
        biography
      }
    `
  }
)

```

#### TypeScript

```javascript
/**
 * export type ExampleFragment_artist = {
 *   readonly name: string
 * }
 */
import { ExampleFragment_artist } from "__generated__/ExampleFragment_artist.graphql"

export const ExampleFragment = createFragmentContainer(
  (props: { artist: ExampleFragment_artist }) => (
    <div>About the artist: {props.artist.biography}</div>
  ),
  {
    artist: graphql`
      fragment ExampleFragment_artist on Artist {
        biography
      }
    `,
  }
)

```

### Fragment references

The opaque identifier described in [data-masking] that a child container expects to receive from its parent, which represents the child container’s fragment spread inside the parent’s fragment.

_Please read [this important caveat](#single-artifact-directory) about actually enabling type-safe fragment reference checking._

Consider a component that composes the above fragment container example. In this example, the emitted type-information of the child container receives a unique opaque identifier type, called a fragment reference, which the type-information emitted for the parent’s fragment references in the location where the child’s fragment is spread. Thus ensuring that the child’s fragment is spread into the parent’s fragment _and_ the correct fragment reference is passed to the child container at runtime.

#### Flow

```javascript
/**
 * import type { FragmentReference } from "relay-runtime";
 * declare export opaque type ExampleFragment_artist$ref: FragmentReference;
 * export type ExampleFragment_artist = {|
 *   +name: string,
 *   +$refType: ExampleFragment_artist$ref,
 * |};
 */
import { ExampleFragment } from "./ExampleFragment"

/**
 * import type { ExampleFragment_artist$ref } from "ExampleFragment_artist.graphql";
 * export type ExampleQueryResponse = {|
 *   +artist: ?{|
 *     +$fragmentRefs: ExampleFragment_artist$ref,
 *   |}
 * |};
 */
import type { ExampleQueryResponse } from "__generated__/ExampleQuery.graphql"

<QueryRenderer
  query={graphql`
    query ExampleQuery {
      artist(id: "banksy") {
        ...ExampleFragment_artist
      }
    }
  `}
  render={({ props }: { props?: ExampleQueryResponse }) => {
    if (props) {
      // Here only `props.artist` is an object typed as the appropriate prop
      // for the `artist` prop of the `ExampleFragment` container.
      return <ExampleFragment artist={props.artist} />
    }
    return <div>Loading</div>
  }}
/>

```

#### TypeScript

```javascript
/**
 * declare const _ExampleFragment_artist$ref: unique symbol;
 * export type ExampleFragment_artist$ref = typeof _ExampleFragment_artist$ref;
 * export type ExampleFragment_artist = {
 *   readonly name: string
 *   readonly " $refType": ExampleFragment_artist$ref
 * }
 */
import { ExampleFragment } from "./ExampleFragment"

/**
 * import { ExampleFragment_artist$ref } from "ExampleFragment_artist.graphql";
 * export type ExampleQueryResponse = {
 *   readonly artist?: {
 *     readonly " $fragmentRefs": ExampleFragment_artist$ref
 *   }
 * }
 * export type ExampleQuery = {
 *   readonly response: ExampleQueryResponse
 * }
 */
import { ExampleQuery } from "__generated__/ExampleQuery.graphql"

<QueryRenderer<ExampleQuery>
  query={graphql`
    query ExampleQuery {
      artist(id: "banksy") {
        ...ExampleFragment_artist
      }
    }
  `}
  render={({ props }) => {
    if (props) {
      // Here only `props.artist` is an object typed as the appropriate prop
      // for the `artist` prop of the `ExampleFragment` container.
      return props.artist && <ExampleFragment artist={props.artist} />
    }
    return <div>Loading</div>
  }}
/>

```

## Single artifact directory

An important caveat to note is that by default strict fragment reference type-information will _not_ be emitted, instead they will be typed as `any` and would allow you to pass in any data to the child container.

To enable this feature, you will have to tell the compiler to store all the artifacts in a single directory, like so:

```shell

$ relay-compiler --artifactDirectory ./src/__generated__ […]

```

…and additionally inform the babel plugin in your `.babelrc` config where to look for the artifacts:

```json

{
  "plugins": [
    ["relay", { "artifactDirectory": "./src/__generated__" }]
  ]
}
```

It is recommended to alias this directory in your module resolution configuration such that you don’t need to specify relative paths in your source files. This is what is also done in the above examples, where artifacts are imported from a `__generated__` alias, rather than relative paths like `../../../../__generated__`.

### Background information

The reason is that `relay-compiler` and its artifact emission is stateless. Meaning that it does not keep track of locations of original source files and where the compiler previously saved the accompanying artifact on disk. Thus, if the compiler were to emit artifacts that try to import fragment reference types from _other_ artifacts, the compiler would:

-   first need to know where on disk that other artifact exists;
-   and update imports when the other artifact changes location on disk.

Facebook uses a module system called [Haste], in which all source files are considered in a flat namespace. This means that an import declaration does not need to specify the path to another module and thus there is no need for the compiler to ever consider the above issues. I.e. an import only needs to specify the basename of the module filename and Haste takes care of actually finding the right module at import time. Outside of Facebook, however, usage of the Haste module system is non-existent nor encouraged, thus the decision to not import fragment reference types but instead type them as `any`.

At its simplest, we can consider Haste as a single directory that contains all module files, thus all module imports always being safe to import using relative sibling paths. This is what is achieved by the single artifact directory feature. Rather than co-locating artifacts with their source files, all artifacts are stored in a single directory, allowing the compiler to emit imports of fragment reference types.

## Language plugins

-   Flow: This is the default and builtin language plugin. You can explicitly enable it like so:

    ```shell

    $ relay-compiler --language javascript […]

    ```

-   [TypeScript](https://github.com/relay-tools/relay-compiler-language-typescript): This is a language plugin for the TypeScript language maintained by the community. Install and enable it like so:

    ```shell

    $ yarn add --dev relay-compiler-language-typescript @types/react-relay @types/relay-runtime
    $ relay-compiler --language typescript […]

    ```

If you are looking to create your own language plugin, refer to the `relay-compiler` [language plugin interface][plugin-interface].

[data-masking]: ./PrinciplesAndArchitecture-ThinkingInRelay.md#data-masking

[Haste]: https://twitter.com/dan_abramov/status/758655309212704768

[plugin-interface]: https://github.com/facebook/relay/blob/main/packages/relay-compiler/language/RelayLanguagePluginInterface.js
