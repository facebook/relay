---
id: type-emission
title: Type Emission
slug: /guides/type-emission/
description: Relay guide to type emission
keywords:
- type emission
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly, fbContent} from 'docusaurus-plugin-internaldocs-fb/internal';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

As part of its normal work, the [**Relay Compiler**](../compiler) will emit type information for your language of choice that helps you write type-safe application code. These types are included in the artifacts that `relay-compiler` generates to describe your operations and fragments.

## Operation variables

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
 * export type ExampleQuery$variables = {
 *   +artistID: string,
 * }
 * export type ExampleQuery$data = {
 *   +artist: {
 *     +name: ?string,
 *   }
 * }
 * export type ExampleQuery = {
 *   +variables: ExampleQuery$variables,
 *   +response: ExampleQuery$data,
 * }
 */

const data = useLazyLoadQuery(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
      }
    }
  `,
  // variables are expected to be of type ExampleQuery$variables
  {artistID: 'banksy'},
);
```

  </TabItem>

  <TabItem value="TypeScript">

```javascript
/**
 * export type ExampleQuery$variables = {
 *   readonly artistID: string
 * }
 * export type ExampleQuery$data = {
 *   readonly artist?: {
 *     readonly name?: string
 *   }
 * }
 * export type ExampleQuery = {
 *   readonly variables: ExampleQuery$variables
 *   readonly response: ExampleQuery$data
 * }
 */
const data = useLazyLoadQuery(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
      }
    }
  `,
  // variables are expected to be of type ExampleQuery$variables
  {artistID: 'banksy'},
);
```

  </TabItem>
</Tabs>

## Operation and fragment data

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
 * export type ExampleQuery$variables = {
 *   +artistID: string,
 * }
 * export type ExampleQuery$data = {
 *   +artist: {
 *     +name: ?string,
 *   }
 * }
 * export type ExampleQuery = {
 *   +variables: ExampleQuery$variables,
 *   +response: ExampleQuery$data,
 * }
 */

// data is of type ExampleQuery$data
const data = useLazyLoadQuery(
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
 * export type ExampleQuery$variables = {
 *   readonly artistID: string
 * }
 * export type ExampleQuery$data = {
 *   readonly artist?: {
 *     readonly name?: string
 *   }
 * }
 * export type ExampleQuery = {
 *   readonly variables: ExampleQuery$variables
 *   readonly response: ExampleQuery$data
 * }
 */

// data is of type ExampleQuery$data
const data = useLazyLoadQuery(
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


Similarly, in this example the emitted type-information describes the type of the prop to match the type of the fragment reference `useFragment` expects to receive.

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
import { ExampleFragmentComponent } from "./ExampleFragmentComponent"

/**
 * import type { ExampleFragmentComponent_artist$fragmentType } from "ExampleFragmentComponent_artist.graphql";
 *
 * export type ExampleQuery$data = {
 *   +artist: ?{
 *     +name: ?string,
 *     +$fragmentSpreads: ExampleFragmentComponent_artist$fragmentType,
 *   }
 * };
 * export type ExampleQuery$variables = {
 *   +artistID: string,
 * }
 * export type ExampleQuery = {
 *   +variables: ExampleQuery$variables,
 *   +response: ExampleQuery$data,
 * }
 */

// data is of type ExampleQuery$data
const data = useLazyLoadQuery(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
        ...ExampleFragmentComponent_artist
      }
    }
  `,
  {artistID: 'banksy'},
);

// Here only `data.artist.name` is directly visible,
// the marker prop $fragmentSpreads indicates that `data.artist`
// can be used for the component expecting this fragment spread.
return <ExampleFragmentComponent artist={data.artist} />;
```

  </TabItem>

  <TabItem value="TypeScript">

```javascript
import { ExampleFragmentComponent } from "./ExampleFragmentComponent"

/**
 * import { ExampleFragmentComponent_artist$fragmentType } from "ExampleFragmentComponent_artist.graphql";
 *
 * export type ExampleQuery$data = {
 *   readonly artist?: {
 *     readonly name: ?string,
 *     readonly " $fragmentSpreads": ExampleFragmentComponent_artist$fragmentType
 *   }
 * }
 * export type ExampleQuery$variables = {
 *   readonly artistID: string
 * }
 * export type ExampleQuery = {
 *   readonly variables: ExampleQuery$variables
 *   readonly response: ExampleQuery$data
 * }
 */

// data is of type ExampleQuery$data
const data = useLazyLoadQuery(
  graphql`
    query ExampleQuery($artistID: ID!) {
      artist(id: $artistID) {
        name
        ...ExampleFragmentComponent_artist
      }
    }
  `,
  {artistID: 'banksy'},
);

// Here only `data.artist.name` is directly visible,
// the marker prop $fragmentSpreads indicates that `data.artist`
// can be used for the component expecting this fragment spread.
return <ExampleFragmentComponent artist={data.artist} />;
```

  </TabItem>
</Tabs>

<OssOnly>

## Single artifact directory

An important caveat to note is that by default strict fragment reference type-information will _not_ be emitted, instead they will be typed as `any` and would allow you to pass in any data to the child component.

To enable this feature, you will have to tell the compiler to store all the artifacts in a single directory, by specifing the `artifactDirectory` in the
compiler configuration:

```
{
  // package.json
  "relay": {
    "artifactDirectory": "./src/__generated__",
    ...
  },
  ...
}
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

</OssOnly>

[data-masking]: ../../principles-and-architecture/thinking-in-relay#data-masking

[Haste]: https://twitter.com/dan_abramov/status/758655309212704768

<DocsRating />
