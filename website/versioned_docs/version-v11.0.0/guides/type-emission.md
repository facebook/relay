---
id: type-emission
title: Type Emission
slug: /guides/type-emission/
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly, fbContent} from 'internaldocs-fb-helpers';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

As part of its normal work, the [**Relay Compiler**](../compiler) will emit type information for your language of choice that helps you write type-safe application code. These types are included in the artifacts that `relay-compiler` generates to describe your operations and fragments.

Regardless of your choice of language, all language plugins will emit roughly the same sort of type-information, but be sure to read the documentation for other [language plugins](#language-plugins) to learn about their specifics.

## Operation input data

The shape of the variables object used for query, mutation, or subscription operations.

In this example the emitted type-information would require the variables object to contain an `artistID` key with a non-null string.

<Tabs
  defaultValue={fbContent({internal: 'Flow', external: 'TypeScript'})}
  values={[
    {label: 'Flow', value: 'Flow'},
    {label: 'TypeScript', value: 'TypeScript'},
  ]}>
  <TabItem value="Flow">

```javascript
/**
 * export type ExampleQueryVariables = {
 *   +artistID: string,
 * }
 * export type ExampleQueryResponse = {
 *   +artist: {
 *     +name: ?string,
 *   }
 * }
 * export type ExampleQuery = {
 *   +variables: ExampleQueryVariables,
 *   +response: ExampleQueryResponse,
 * }
 */

import type { ExampleQuery } from "__generated__/ExampleQuery.graphql"

const data = useLazyLoadQuery<ExampleQuery>(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
      }
    }
  `,
  // variables are expected to be of type ExampleQueryVariables
  {artistID: 'banksy'},
);
```

  </TabItem>

  <TabItem value="TypeScript">

```javascript
/**
 * export type ExampleQueryVariables = {
 *   readonly artistID: string
 * }
 * export type ExampleQueryResponse = {
 *   readonly artist?: {
 *     readonly name?: string
 *   }
 * }
 * export type ExampleQuery = {
 *   readonly variables: ExampleQueryVariables
 *   readonly response: ExampleQueryResponse
 * }
 */

import { ExampleQuery } from "__generated__/ExampleQuery.graphql"

const data = useLazyLoadQuery<ExampleQuery>(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
      }
    }
  `,
  // variables are expected to be of type ExampleQueryVariables
  {artistID: 'banksy'},
);
```

  </TabItem>
</Tabs>

## Operation/Fragment selection-set data

The shape of the data selected in a operation or fragment, following the [data-masking] rules. That is, excluding any data selected by fragment spreads.

In this example the emitted type-information describes the response data which is returned by `useLazyLoadQuery` (or `usePreloadedQuery`).


<Tabs
  defaultValue={fbContent({internal: 'Flow', external: 'TypeScript'})}
  values={[
    {label: 'Flow', value: 'Flow'},
    {label: 'TypeScript', value: 'TypeScript'},
  ]}>
  <TabItem value="Flow">

```javascript
/**
 * export type ExampleQueryVariables = {
 *   +artistID: string,
 * }
 * export type ExampleQueryResponse = {
 *   +artist: {
 *     +name: ?string,
 *   }
 * }
 * export type ExampleQuery = {
 *   +variables: ExampleQueryVariables,
 *   +response: ExampleQueryResponse,
 * }
 */

import type { ExampleQuery } from "__generated__/ExampleQuery.graphql"

// data is of type ExampleQueryResponse
const data = useLazyLoadQuery<ExampleQuery>(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
      }
    }
  `,
  {artistID: 'banksy'},
);

return props.artist && <div>{props.artist.name} is great!</div>
```

  </TabItem>

  <TabItem value="TypeScript">

```javascript
/**
 * export type ExampleQueryVariables = {
 *   readonly artistID: string
 * }
 * export type ExampleQueryResponse = {
 *   readonly artist?: {
 *     readonly name?: string
 *   }
 * }
 * export type ExampleQuery = {
 *   readonly variables: ExampleQueryVariables
 *   readonly response: ExampleQueryResponse
 * }
 */

import { ExampleQuery } from "__generated__/ExampleQuery.graphql"

// data is of type ExampleQueryResponse
const data = useLazyLoadQuery<ExampleQuery>(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
      }
    }
  `,
  {artistID: 'banksy'},
);

return props.artist && <div>{props.artist.name} is great!</div>
```

  </TabItem>
</Tabs>


Similarly, in this example the emitted type-information describes the type of the prop to match the type of the fragment reference `useFragment`  expects to receive.


<Tabs
  defaultValue={fbContent({internal: 'Flow', external: 'TypeScript'})}
  values={[
    {label: 'Flow', value: 'Flow'},
    {label: 'TypeScript', value: 'TypeScript'},
  ]}>
  <TabItem value="Flow">

```javascript
/**
 * export type ExampleFragmentComponent_artist$data = {
 *   +name: string
 * }
 *
 * export type ExampleFragmentComponent_artist$key = { ... }
 */

import type { ExampleFragmentComponent_artist$key } from "__generated__/ExampleFragmentComponent_artist.graphql"

type Props = {
  artist: ExampleFragmentComponent_artist$key,
};

export default ExampleFragmentComponent(props) {
  // data is of type ExampleFragmentComponent_artist$data
  const data = useFragment(
    graphql`
      fragment ExampleFragmentComponent_artist on Artist {
        biography
      }
    `,
    props.artist,
  );

  return <div>About the artist: {props.artist.biography}</div>;
}
```

  </TabItem>

  <TabItem value="TypeScript">

```javascript
/**
 * export type ExampleFragmentComponent_artist$data = {
 *   readonly name: string
 * }
 *
 * export type ExampleFragmentComponent_artist$key = { ... }
 */

import { ExampleFragmentComponent_artist$key } from "__generated__/ExampleFragmentComponent_artist.graphql"

interface Props {
  artist: ExampleFragmentComponent_artist$key,
};

export default ExampleFragmentComponent(props: Props) {
  // data is of type ExampleFragmentComponent_artist$data
  const data = useFragment(
    graphql`
      fragment ExampleFragmentComponent_artist on Artist {
        biography
      }
    `,
    props.artist,
  );

  return <div>About the artist: {props.artist.biography}</div>;
}
```

  </TabItem>
</Tabs>

## Fragment references

The opaque identifier described in [data-masking] that a child container expects to receive from its parent, which represents the child container’s fragment spread inside the parent’s fragment.

<OssOnly>

:::important
Please read [this important caveat](#single-artifact-directory) about actually enabling type-safe fragment reference checking.
:::

</OssOnly>

Consider a component that [composes](../../guided-tour/rendering/fragments/#composing-fragments) the above fragment component example. In this example, the emitted type-information of the child component receives a unique opaque identifier type, called a fragment reference, which the type-information emitted for the parent’s fragment references in the location where the child’s fragment is spread. Thus ensuring that the child’s fragment is spread into the parent’s fragment _and_ the correct fragment reference is passed to the child component at runtime.

<Tabs
  defaultValue={fbContent({internal: 'Flow', external: 'TypeScript'})}
  values={[
    {label: 'Flow', value: 'Flow'},
    {label: 'TypeScript', value: 'TypeScript'},
  ]}>
  <TabItem value="Flow">

```javascript
/**
 * import type { FragmentReference } from "relay-runtime";
 * declare export opaque type ExampleFragmentComponent_artist$ref: FragmentReference;
 *
 * export type ExampleFragmentComponent_artist$data = {
 *   +name: string,
 *   +$refType: ExampleFragmentComponent_artist$ref,
 * };
 */

import { ExampleFragmentComponent } from "./ExampleFragmentComponent"

/**
 * import type { ExampleFragmentComponent_artist$ref } from "ExampleFragmentComponent_artist.graphql";
 *
 * export type ExampleQueryResponse = {
 *   +artist: ?{
 *     +$fragmentRefs: ExampleFragmentComponent_artist$ref,
 *   }
 * };
 * export type ExampleQueryVariables = {
 *   +artistID: string,
 * }
 * export type ExampleQuery = {
 *   +variables: ExampleQueryVariables,
 *   +response: ExampleQueryResponse,
 * }
 */
import type { ExampleQuery } from "__generated__/ExampleQuery.graphql"

// data is of type ExampleQueryResponse
const data = useLazyLoadQuery<ExampleQuery>(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        ...ExampleFragmentComponent_artist
      }
    }
  `,
  {artistID: 'banksy'},
);

// Here only `data.artist` is an object typed as the appropriate type
// for the `artist` prop of `ExampleFragmentComponent`.
return <ExampleFragmentComponent artist={data.artist} />;
```

  </TabItem>

  <TabItem value="TypeScript">

```javascript
/**
 * declare const _ExampleFragmentComponent_artist$ref: unique symbol;
 * export type ExampleFragmentComponent_artist$ref = typeof _ExampleFragmentComponent_artist$ref;
 *
 * export type ExampleFragmentComponent_artist = {
 *   readonly name: string
 *   readonly " $refType": ExampleFragmentComponent_artist$ref
 * }
 */
import { ExampleFragmentComponent } from "./ExampleFragmentComponent"

/**
 * import { ExampleFragmentComponent_artist$ref } from "ExampleFragmentComponent_artist.graphql";
 *
 * export type ExampleQueryResponse = {
 *   readonly artist?: {
 *     readonly " $fragmentRefs": ExampleFragmentComponent_artist$ref
 *   }
 * }
 * export type ExampleQueryVariables = {
 *   readonly artistID: string
 * }
 * export type ExampleQuery = {
 *   readonly variables: ExampleQueryVariables
 *   readonly response: ExampleQueryResponse
 * }
 */
import { ExampleQuery } from "__generated__/ExampleQuery.graphql"

// data is of type ExampleQueryResponse
const data = useLazyLoadQuery<ExampleQuery>(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        ...ExampleFragmentComponent_artist
      }
    }
  `,
  {artistID: 'banksy'},
);

// Here only `data.artist` is an object typed as the appropriate type
// for the `artist` prop of `ExampleFragmentComponent`.
return <ExampleFragmentComponent artist={data.artist} />;
```

  </TabItem>
</Tabs>

<OssOnly>

## Single artifact directory

An important caveat to note is that by default strict fragment reference type-information will _not_ be emitted, instead they will be typed as `any` and would allow you to pass in any data to the child component.

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

By default, Flow types are emitted inside of comments to avoid forcing your project to use Flow. Flow types inside of comments is perfectly valid Flow, however, some editors and IDEs (like WebStorm/IDEA) do not understand Flow unless it's in plain source code. In order to solve that, there's a language plugin maintained by the community that replicates the functionality of the default builtin plugin, but emits the Flow types as plain source and not inside comments. Installation and usage:

```shell

  $ yarn add --dev relay-compiler-language-js-flow-uncommented
  $ relay-compiler --language js-flow-uncommented […]

```

-   [TypeScript](https://github.com/relay-tools/relay-compiler-language-typescript): This is a language plugin for the TypeScript language maintained by the community. Install and enable it like so:

    ```shell

    $ yarn add --dev relay-compiler-language-typescript @types/react-relay @types/relay-runtime
    $ relay-compiler --language typescript […]

    ```

If you are looking to create your own language plugin, refer to the `relay-compiler` [language plugin interface][plugin-interface].

</OssOnly>

[data-masking]: ../../principles-and-architecture/thinking-in-relay#data-masking

[Haste]: https://twitter.com/dan_abramov/status/758655309212704768

[plugin-interface]: https://github.com/facebook/relay/blob/main/packages/relay-compiler/language/RelayLanguagePluginInterface.js

<DocsRating />
