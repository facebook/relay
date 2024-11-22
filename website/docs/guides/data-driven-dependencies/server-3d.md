---
id: server-3d
title: Server 3D
slug: /guides/data-driven-dependencies/server-3d/
description: Server side data driven dependencies (3D)
keywords:
- 3D
- Server 3D
- data driven dependencies
- module
- match
- MatchContainer
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'docusaurus-plugin-internaldocs-fb/internal';
import FbSuspensePlaceholder from '../../fb/FbSuspensePlaceholder.md';

<FbInternalOnly>

> **NOTE:** throughout this guide, we use `MatchContainer`. If you are in www, but not in Comet, you should use RelayFBMatchContainer.

</FbInternalOnly>

<OssOnly>

> **NOTE:** Server 3D requires configuring your server to support various features! It is unlikely to work in OSS without significant work. Relay does not claim to fully support Server 3D in OSS (yet), but [Client 3D](../client-3d/) is fully supported.

</OssOnly>

Use server 3D when all the data fields used to render your 3D components are fetched from GraphQL servers.

## Simple 3D with @module

The basic case for 3D are the first two cases described in [Use Cases](../introduction/#use-cases): content that is typically missing (where the corresponding rendering code is typically unused) or a union of many types (where only some of the possible rendering code is typically used). These cases are supported with the `@module(name: String)` directive on fragment spreads, which specifies a React component to download only if the data exists and fragment's type matches.

### @module Usage Guide

Let's walk through how to handle a comment that may contain an image attachment, where we only want to download the image rendering code when an image is actually present.

#### Server Changes

<FbInternalOnly>

* For each concrete (GraphQLObject) type that you want to use `@module` with, update the schema to use the `HasJSDependency` trait. In this case we'd add the trait to the type of the `Comment.image` field - lets say that's `CommentImage`:

```php
<<
  GraphQLObject('CommentImage', 'An image attached to a comment'),
  Oncalls('<todo>')
>>
final class CommentImage ... {
  // Note: Each type used with @module must use the `HasJSDependency` trait
  // to allow dynamically loading a client-specified React component
  use HasJSDependency;

  ...
}
```
* Rebuild the GraphQL schema with `phps graphql`.

</FbInternalOnly>

<OssOnly>

* For each concrete (GraphQLObject) type that you want to use `@module` with, update the schema to support the fields (`__fragment` and `__component`) that are present later in this document.

</OssOnly>

#### Client Changes

Your Relay fragment can now use `@module`. In this example, if the `comment.image` field is present (non-null), we load the `CommentImage.react` component and use the `CommentImage_image` fragment to load its data.

On the Relay side you'd write:

```graphql
fragment Comment_comment on Comment {
  image {
    ...CommentImage_image
      @module(name: "CommentImage.react")
  }
}
```

Which the server receives as the following:

```graphql
fragment Comment_comment on Comment {
  image {
    ... on CommentImage {
       ...CommentImage_image
       __component: js("CommentImage.react")
       __fragment: js("CommentImage_image$normalization.graphql")
    }
  }
}
```

To consume the `comment.image` field and render the component when the data exists, you shouldn't statically require the component (which would introduce a static dependency) and instead use `CometRelay.MatchContainer` (Comet) or `RelayFBMatchContainer` (www) to return the dynamically selected component:

```js
const {useFragment, graphql, MatchContainer} = require('react-relay');

function CommentRenderer(props) {
  const comment = useFragment(
    /* fragment Comment_comment from above */,
    props.comment,
  );

  if (comment.image == null) {
    // Handle cases where the field failed to load or was null
    return null;
  }
  // MatchContainer may suspend while loading the component or its data,
  // consider wrapping with React.Suspense.
  return (
    <Suspense fallback={null}>
      <MatchContainer
        // data for field containing @module selection
        match={comment.image}
        props={{ /* ...other props... */ }}
      />
    </Suspense>
  );
}
module.exports = CommentRenderer;
```

> **IMPORTANT:** When using MatchContainer, the component loaded using 3D needs to have the same prop name as the fragment suffix e.g. if your fragment is `Comment_comment`, your prop needs to be called `comment` instead of something like `comment$key`

## Advanced 3D with match

In some cases a given piece of content can be rendered in a variety of different rendering strategies. In this case, the client and server have to negotiate to choose the ideal strategy for each piece of content: the content may be eligible to be rendered as SuperFancyMarkdown, but if the client doesn't support that type the app should fallback to just regular Markdown rather than showing nothing at all. Relay supports this client/server negotiation with the `@match` directive.

### @match Design Principles

* The client specifies which strategies it supports (a given client may not support all possible strategies), how it will render that data (one React component per strategy), and what data it needs (a GraphQL fragment for each strategy, describing the React component's data dependencies).
* The server - specifically *product logic in the schema* - selects the rendering strategy to use, selecting the "best" strategy given the user, data, and the client's supported strategies.
* The code (Component) and data (GraphQL) for the selected strategy is downloaded *dynamically* once the strategy is selected. Data is downloaded as normal GraphQL data, and metadata about the code is sent down in a side-channel (technically, in the `extensions` field of the GraphQL payload).

### @match Usage Guide

Let's walk through the steps to implementing the above example of adding a new data-driven dependency for a `Comment` type with `markdown` and `plaintext` rendering strategies.

#### Server Changes

<FbInternalOnly>

* Define a new `GraphQLUnion` type with a variant for each rendering strategy:

```php
<<
  GraphQLUnion('CommentRenderer', 'Data-driven dependency for comments...'),
  Oncalls('<todo>')
>>
interface ICommentRenderer extends IGraphQLUnion {}

<<
  GraphQLObject('CommentMarkdownRenderer', 'Comment with markdown rendering'),
  Oncalls('<todo>')
>>
final class CommentMarkdownRenderer implements ICommentRenderer {
  // Note: Each class in the union must use the `HasJSDependency` trait to allow
  // dynamically loading a client-specified React compon
  use HasJSDependency;

  <<GraphQLField('markdown', 'Markdown text')>>
  public function markdown(): string {
    return 'markdown'; // todo: load markdown content from the comment
  }
}

<<
  GraphQLObject('CommentPlaintextRenderer', 'Comment with plaintext rendering'),
  Oncalls('<todo>')
>>
final class CommentPlaintextRenderer implements ICommentRenderer {
  // Note: Each class in the union must use the `HasJSDependency` trait to allow
  // dynamically loading a client-specified React compon
  use HasJSDependency;

  <<GraphQLField('plaintext', 'Plaintext')>>
  public function plaintext(): string {
    return 'plaintext'; // todo: load text content from the comment
  }
}
```
* Add a new field on the `Comment` type that accepts a `Traversable<string> supported` argument listing the client's supported strategies, and returns one of the union values to indicate the selected strategy:

```php
<<
  GraphQLObject('Comment', 'Comment on a post'),
  Oncalls('<todo>')
>>
final class Comment {
  <<GraphQLField(
    'comment_content_renderer',
    'Field that returns a rendering strategy for the main content of the comment',
  )>>
  public function commentContentRenderer(Traversable<string> $supported): ICommentRenderer {
    if (C\contains($supported, 'CommentMarkdownRenderer') && userIsEligibleForMarkdownContent()) {
      return new CommentMarkdownRenderer();
    }
    return new CommentPlaintextRenderer();
  }
}
```
* Rebuild the GraphQL schema with `arc rebuild`.

#### Choose Render Strategy API

In some cases, your use case might require multiple and more complex checks in order to choose a proper render strategy. For those cases, you can extend your strategies with `IRenderStrategy`.  So, the example above could be extended aggregating `CommentMarkupRenderer` simply writing the following code:

```php
<<
  GraphQLObject('CommentMarkupRenderer', 'Comment with markup rendering'),
  Oncalls('<todo>')
>>
final class CommentMarkupRenderer implements ICommentRenderer, IRenderStrategy {

  use HasJSDependency;

  <<GraphQLField('markup', 'Markdown text')>>
  public function markdown(): string {
    return 'markup'; // todo: load markup content from the comment
  }

  <<__Override>>
  public async function genShouldShow(): Awaitable<bool> {
    return userIsEligibleForMarkupContent();
  }
}
final class CommentMarkdownRenderer implements ICommentRenderer, IRenderStrategy {
  // ...
  <<__Override>>
  public async function genShouldShow(): Awaitable<bool> {
    return userIsEligibleForMarkdownContent();
  }
}

final class CommentPlaintextRenderer implements ICommentRenderer, IRenderStrategy {
  // ...
  <<__Override>>
  public async function genShouldShow(): Awaitable<bool> {
    // By default we want to use this strategy as a fallback
    return true;
  }
}
```
having all RendererStrategies implementing IRenderStrategy, we can choose the strategy using `RenderStrategySelector::genChooseStrategy`. Making sure to place strategies in the proper order, since the first strategy that `genShouldShow` returns true will be picked as:

```php
public function commentContentRenderer(Traversable<string> $supported): Awaitable<ICommentRenderer> {
  return await RenderStrategySelector::genChooseStrategy(
    vec[
      CommentMarkdownRenderer(),
      CommentMarkupRenderer(),
      CommentPlaintextRenderer(),
    ],
    $supported,
  )
}
```

</FbInternalOnly>

<OssOnly>

* Define a new `GraphQLUnion` type with a variant for each rendering strategy.
* Add a new field on the `Comment` type that accepts an `Array<string> supported` argument listing the client's supported strategies, and returns one of the union values to indicate the selected strategy.

</OssOnly>


#### Client Changes

Your Relay fragment can now use `@match` to specify that for the `comment_content_renderer` field, we expect dependencies to be decided by the data. In this example, if the `comment_content_renderer` field is of type `CommentMarkdownRenderer`, we load the `CommentMarkdownRenderer.react` component and use the `CommentMarkdownRenderer_comment` fragment to load its data. Similar for the plaintext variant.

On the Relay side you'd write:

```graphql
fragment Comment_comment on Comment {
  comment_content_renderer @match {
    ...CommentMarkdownRenderer_comment
      @module(name: "CommentMarkdownRenderer.react")

    ...CommentPlaintextRenderer_comment
      @module(name: "CommentPlaintextRenderer.react")
  }
}
```
Which the server receives as the following - note that the `supported` argument is generated automatically based on the types that we have provided fragments for above:

```graphql
fragment Comment_comment on Comment {
  comment_content_renderer(supported: ["CommentMarkdownRenderer", "CommentPlaintextRenderer"]) {
    ... on CommentMarkdownRenderer {
       ...CommentMarkdownRenderer_comment
       __component: js("CommentMarkdownRenderer.react")
       __fragment: js("CommentMarkdownRenderer_comment$normalization.graphql")
    }
    ... on CommentPlaintextRenderer {
       ...CommentPlaintextRenderer_comment
       __component: js("CommentPlaintextRenderer.react")
       __fragment: js("CommentPlaintextRenderer_comment$normalization.graphql")
    }
  }
}
```
To consume the comment_content_renderer field and render the appropriate container, you shouldn't statically require the component (which would introduce a static dependency) and instead use `MatchContainer` to return the dynamically selected component:

```js
const React = require('React');
const {Suspense} = React;
const {graphql, useFragment, MatchContainer} = require('react-relay');

function CommentRenderer(props) {
  const comment = useFragment(
    /* fragment from above */,
    props.comment,
  );

  if (comment.comment_content_renderer == null) {
    // Handle cases where the field failed to load or was null
    return null;
  }

  // MatchContainer may suspend while loading the component/its data,
  // consider wrapping with React.Suspense.
  return (
    <Suspense fallback={null}>
      <MatchContainer
        // data for field containing at-module selection
        match={comment.comment_content_renderer}
        props={{/* other props */}}
      />
    </Suspense>
  );
}
module.exports = CommentRenderer;
```

> **IMPORTANT:** When using MatchContainer, the component loaded using 3D needs to have the same prop name as the fragment suffix e.g. if your fragment is `Comment_comment`, your prop needs to be called `comment` instead of something like `comment$key`

## Multiple 3D Selections Per Fragment

If your component needs to select multiple data-driven dependencies in a single fragment, each field must be named with a distinct `key`. The key can be provided by adding the `@match` directive on the parent field:

```graphql
# DOESN'T WORK
fragment Example_comment on Comment {
  comment_content_renderer @match {
    ...CommentMarkdownRenderer_comment
      @module(name: "CommentMarkdownRenderer.react")
  }
  attachments {
    attachment_renderer {
      ...CommentAttachmentPhotoRenderer_comment
        @module(name: "CommentPhotoRenderer.react")
    }
  }
}
```

This will fail with a message such as:

```
`Error: Invalid @module selection: documents with multiple fields containing 3D
selections must specify a unique 'key' value for each field:
use 'attachment_renderer @match(key: "ExampleComment_<localName>")'.`
```

In this case, follow the suggestion in the error and add `@match(key: "...")` on the second 3D field ('attachment_renderer' in this case):

```
// OK - different keys with @match
fragment Example_comment on Comment {
  comment_content_renderer @match {
    ...CommentMarkdownRenderer_comment
      @module(name: "CommentMarkdownRenderer.react")
  }
  attachments {
    attachment_renderer @match(key: "Example_comment__attachment") {
      ...CommentAttachmentPhotoRenderer_comment
        @module(name: "CommentPhotoRenderer.react")
    }
  }
}
```

Internally, Relay uses the 'key' value to isolate the results of each field in the store. This ensures that even if both fields return the same object, that the results can't collide.

## Usage with Relay Hooks

The preferred way of using 3D is with with the [`useFragment`](../../../api-reference/use-fragment/) API.

```js
// CommentRenderer.react.js

const {graphql, useFragment, MatchContainer} = require('react-relay');

function CommentRenderer(props) {
  const comment = useFragment(
    graphql`
      fragment Comment_comment on Comment {
        image {
          ...CommentImageRenderer_image @module(name: "CommentImageRenderer.react")
        }
      }
    `,
    props.comment,
  );

  if (comment.image == null) {
    // Handle cases where the field failed to load or was null
    return null;
  }

  // MatchContainer may suspend while loading the component/its data,
  // consider wrapping with React.Suspense.
  return (
    <Suspense fallback={null}>
      <MatchContainer
        // data for field containing @module selection
        match={comment.image}
        props={{...other props...}}
      />
    </Suspense>
  );
}
module.exports = CommentRenderer;
```

<FbSuspensePlaceholder />


The component that is dynamically loaded via 3D can also be a component that uses `useFragment`:

```js
// CommentImageRenderer.react.js
import type {CommentImageRenderer_image$key} from 'CommentImageRenderer_image.graphql'

const {useFragment} = require('react-relay');

type Props = {
  image: CommentImageRenderer_image$key,
};

function CommentImageRenderer(props) {
  const data = useFragment(
    graphql`
      fragment CommentImageRenderer_image on Image {
        src
      }
    `,
    props.image,
  );

  return (...);
}

module.exports = CommentImageRenderer;
```

## Using non-React modules

The typical usage of data-driven dependencies is to dynamically load modules that export a React component with data-dependencies expressed via Relay. However, Relay also supports dynamically loading *arbitrary* JS modules. This works the same `@match` / `@module` syntax, but (as you may expect) `MatchContainer` won't work for this case. Instead, use `ModuleResource.read()`. The above example using `MatchContainer` can be rewritten to manually read and use the `@module` result:

<FbInternalOnly>

> In www, outside of Comet, you should use `RelayFBModuleResource.read()` instead of `ModuleResource.read()`.

</FbInternalOnly>



```js
const React = require('React');
const {Suspense} = React;
const {graphql, useFragment, ModuleResource} = require('react-relay');
const CommentFragment = graphql`
  fragment Comment_comment on Comment {
    comment_content_renderer @match {
      ...CommentMarkdownRenderer_comment
        @module(name: "CommentMarkdownRenderer.react")
      ...CommentPlaintextRenderer_comment
        @module(name: "CommentPlaintextRenderer.react")
    }
  }
`;
function CommentRenderer(props) {
  const comment = useFragment(
    CommentFragment,
    props.comment,
  );
  if (comment.image == null) {
    // Handle cases where the field failed to load or was null
    return null;
  }
  // NOTE: this will suspend if the module is not loaded:
  // the *parent* component should wrap this one in a Suspense boundary
  // MatchedModule will be:
  // - null if there was no match
  // - CommentMarkdownRenderer.react if the result was markdown
  // - CommentPlaintextRenderer.react if the result was plaintext

  const MatchedModule = ModuleResource.read(comment.image);

  if (MatchedModule == null) {
    return null; // no match
  }
  // Here we ensure that all possible matched components accept the data
  // on the same prop key, in this case 'comment'
  // Note that MatchContainer automatically determines the
  // correct prop key to use for the matched data.
  return (
    <MatchedModule
      comment={comment.image}
    />
  );
}
module.exports = CommentRenderer;
```

You can also use `@module` directly to load a non-React module for a field if it isn't null (without using `@match`), and similarly consume the module using `ModuleResource.read()`:

<FbInternalOnly>

> In www, outside of Comet, you should use `RelayFBModuleResource.read()` instead of `ModuleResource.read()`.

</FbInternalOnly>

```js
function CommentRenderer(props) {
  const comment = useFragment(
    graphql`
      fragment Comment_comment on Comment {
        image {
          ...CommentImage_image
            @module(name: "ImageProcessingModule")
        }
      }
    `,
    props.comment,
  );

  if (comment.image == null) {
    // Handle cases where the field failed to load or was null
    return null;
  }

  // NOTE: this will suspend if the module is not loaded
  const ImageProcessingModule = ModuleResource.read(comment.image);

  if (ImageProcessingModule == null) {
    return null; // no match
  }

  // ...
}
```

**Note:** `@module` requires a fragment, which cannot be empty. If you don't want to fetch any data from the server (only conditionally files), you can define a "dummy" fragment for your field:

```javascript
// Define a fragment as a wrapper to use with @module
// The fragment below will be able to reference this fragment by name
graphql`
  fragment FragmentForModule_image on Image {
    __typename # only use __typename here since we don't need any data
  }
`;

function CommentRenderer(props) {
  const comment = useFragment(
    graphql`
      fragment Comment_comment on Comment {
        image {
          # Spread wrapper fragment
          ...FragmentForModule_image
            @module(name: "ImageProcessingModule")
        }
      }
    `,
    props.comment,
  );

  // ...
}
```


## Important Notes / Troubleshooting


* Note that `MatchContainer` will suspend until the selected component finishes loading, so be sure to wrap it in a `Suspense` placeholder.

<FbInternalOnly>

## ServerCallableModule Is No Longer Required

Usage of 3D **previously** required adding an `@ServerCallableModule` annotation to components loaded with `@module`. **This annotation is no longer required**. You may see diffs titled "[Codemod][DeadServerCallable" that remove these now-unnecessary annotations, these diffs are expected and safe to land so long as they are only removing these annotations and not accidentally making other changes (i.e., please sanity-check the bot!).

</FbInternalOnly>

<DocsRating />
