---
id: alias-directive
title: "@alias Directive"
slug: /guides/alias-directive/
description: Relay guide to @alias
keywords:
- alias
- directive
- fragment
---

The `@alias` directive allows you to expose a spread fragment — either a named fragment spread or an inline fragment — as a named field within your selection. This allows Relay to provide additional type safety in the case where your fragment’s type may not match the parent selection.

:::info
This document describes why the `@alias` directive was introduced, and how it can be used to improve type safety in your Relay applications. **To learn about it's API, see the [API Reference](../api-reference/graphql/graphql-directives.md#alias).**
:::

Let’s look at an examples where `@alias` can be useful:

## Abstract Types

Imagine you have a component that renders information about a Viewer:

```ts
function MyViewer({viewerKey}) {
  const {name} = useFragment(graphql`
    fragment MyViewer on Viewer {
      name @required(action: THROW)
    }`, viewerKey);

  return `My name is ${name}. That's ${name.length} letters long!`;
}
```

To use that component in a component that has a fragment on Node (which Viewer implements), you could write something like this:

```ts
function MyNode({nodeKey}) {
  const node = useFragment(graphql`
    fragment MyFragment on Node {
      ...MyViewer
    }`, nodeKey);

  return <MyViewer viewerKey={node} />
}
```

Can you spot the problem? We don’t actually know that the node we are passing to `<MyViewer />` is actually a Viewer `<MyViewer />`. If `<MyNode />` tries to render a Comment — which also implements Node — we will get a runtime error in `<MyViewer />` because the field name is not present on Comment.

```
TypeError: Cannot read properties of undefined (reading 'length')
```

Not only do we not get a type letting us know that about this potential issue, but even at runtime, there is no way way to check if node implements Viewer because Viewer is an abstract type!

## Aliased Fragments

Aliased fragments can solve this problem. Here’s what `<MyNode />` would look like using them:

```ts
function MyNode({nodeKey}) {
  const node = useFragment(graphql`
    fragment MyFragment on Node {
      ...MyViewer @alias(as: "my_viewer")
    }`, nodeKey);

  // Relay returns the fragment key as its own nullable property
  if(node.my_viewer == null) {
    return null;
  }

  // Because `my_viewer` is typed as nullable, Flow/TypeScript will
  // show an error if you try to use the `my_viewer` without first
  // performing a null check.
  //                          VVVVVVVVVVVVVV
  return <MyViewer viewerKey={node.my_viewer} />
}
```

With this approach, you can see that Relay exposes the fragment key as its own nullable property, which allows us to check that node actually implements Viewer and even allows Flow to enforce that the component handles the possibility!

## @skip and @include

A similar problem can occur when using `@skip` and `@include` directives on fragments. In order to safely use the spread fragment, you need to check if it was fetched. Historically this has required gaining access to the query variable that was used to determine if the fragment was skipped or included.

With `@alias`, you can now check if the fragment was fetched by simply assigning the fragment an alias, and checking if the alias is null:

```ts
function MyUser({userKey}) {
  const user = useFragment(graphql`
    fragment MyFragment on User {
      ...ConditionalData @skip(if: $someVar) @alias
    }`, userKey);

  if(user.ConditionalData == null) {
    return "No data fetched";
  }
  return <ConditionalData userKey={user.ConditionalData} />
}
```

## Enforced Safety

We've outlined two different ways that fragments can be unsafe in Relay today without `@alias`. To help prevent runtime issues resulting from these unsafe edge cases, Relay requires that all conditionally fetched fragments are aliased.

To disable this validation in your project, you can disable the `enforce_fragment_alias_where_ambiguous` compiler feature flag for your project. If you need to enable incremental adoption of this enforcement, Relay exposes a directive `@dangerously_unaliased_fixme` which will suppress enforcement errors. This will allow you to enable the enforcement for all new spreads without first needing to migrate all existing issues.

The [Relay VSCode extension](../editor-support.md) offers quick fixes to add either `@alias` or `@dangerously_unaliased_fixme` to unsafe fragments, and the
[mark-dangerous-conditional-fragment-spreads](../codemods/#mark-dangerous-conditional-fragment-spreads) codemod can be used to apply `@dangerously_unaliased_fixme` across your entire project.

## Use with @required

`@alias` can be used with [`@required(action: NONE)`](./required-directive.md) to group together required fields. In the following example, we group `name` and `email` together as `requiredFields`. If either is null, that null will bubble up to, the `user.requiredFields` field, making it null. This allows us to perform a single check, without impacting the `id` field.

```ts
function MyUser({userKey}) {
  const user = useFragment(graphql`
    fragment MyFragment on User {
      id
      ... @alias(as: "requiredFields") {
        name @required(action: NONE)
        email @required(action: NONE)
      }
    }`, userKey);

  if(user.requiredFields == null) {
    return `Missing required fields for user ${user.id}`;
  }
  return `Hello ${user.requiredFields.name} (${user.requiredFields.email}).!`;
}
```

:::note
Using `@required` on a fragment spread that has an `@alias` is not currently supported, but we may add support in the future.
:::

## Under the Hood

For people familiar with Relay, or curious to learn, here is a brief description of how this feature is implemented:

Under the hood, `@alias` is implemented entirely within Relay (compiler and runtime). It does not require any server support. The Relay compiler interprets the `@alias` directive, and generates types indicating that the fragment key, or inline fragment data, will be attached to the new field, rather than directly on the parent object. In the Relay runtime artifact, it wraps the fragment node with a new node indicating the name of the alias and additional information about the type of the fragment.

The Relay compiler also inserts an additional field into the spread which allows it to determine if the fragment has matched:

```graphql
fragment Foo on Node {
  ... on Viewer {
    isViewer: __typename # <-- Relay inserts this
    name
  }
}
```

Relay can now check for the existence of the `isViewer` field in the response to know if the fragment matched.

When Relay reads the content of your fragment out of the store using its runtime artifact, it uses this information to attach the fragment key to this new field, rather than attaching it directly to the parent object.

### Related

While `@alias` is a Relay-specific feature, it draws inspiration from fragment modularity as outlined in the GraphQL [RFC Fragment Modularity](https://github.com/graphql/graphql-wg/blob/main/rfcs/FragmentModularity.md).
