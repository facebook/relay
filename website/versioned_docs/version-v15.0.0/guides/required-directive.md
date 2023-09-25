---
id: required-directive
title: "@required Directive"
slug: /guides/required-directive/
description: Relay guide to @required
keywords:
- required
- directive
- optional
- nullthrows
---

import DocsRating from '@site/src/core/DocsRating';

The `@required` directive can be added to fields in your Relay queries to declare how null values should be handled at runtime. You can think of it as saying "if this field is ever null, its parent field is invalid and should be null".

When you have a GraphQL schema where many fields are nullable, a considerable amount of product code is needed to handle each field's potential "nullness" before the underlying data can be used. With `@required`, Relay can handle some types of null checks before it returns data to your component, which means that **any field you annotate with** **`@required`** **will become non-nullable in the generated types for your response**.

If a `@required` field is null at runtime, Relay will "bubble" that nullness up to the field's parent. For example, given this query:

```graphql
query MyQuery {
  viewer {
    name @required(action: LOG)
    age
  }
}
```

If `name` is null, relay would return `{ viewer: null }`. You can think of `@required` in this instance as saying "`viewer` is useless without a `name`".

## Action

The `@required` directive has a required `action` argument which has three possible values:

### `NONE` (expected)

This field is expected to be null sometimes.

### `LOG` (recoverable)

This value is not expected to ever be null, but the component **can still render** if it is. If a field with `action: LOG` is null, the Relay environment logger will receive an event that looks like this:

```javascript
{
  name: 'read.missing_required_field',
  owner: string, // MyFragmentOrQueryName
  fieldPath: string, // path.to.my.field
};
```

### `THROW` (unrecoverable)

This value should not be null, and the component **cannot render without it**. If a field with `action: THROW` is null at runtime, the component which reads that field **will throw during render**. The error message includes both the owner and field path. Only use this option if your component is contained within an [error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

## Locality

A field's `@required` status is **local to the fragment where it is specified**. This allows you to add add/remove the directive without having to think about anything outside the scope of your component.

This choice reflects the fact that some components may be able to recover better from missing data than others. For example, a `<RestaurantInfo />` component could probably render something sensible even if the restaurant's address is missing, but a `<RestaurantLocationMap />` component might not.

However, all usages of the `@required` directive on the same field in a single fragment must be consistent with their usage. This situation mostly occurs when selecting fields in inline fragments. For example, the following fragment would fail to compile:

```graphql
fragment UserInfo on User {
  job {
    ... on Actor {
      certifications
    }
    ... on Lawyer {
      certifications @required(action: LOG)
    }
  }
}
```

The Relay compiler will give you an error like `All references to a field must have matching @required declarations.`. To fix this, either set the `@required` directive on each of the fields selected in the inline fragment or remove the directive entirely.

## Chaining

`@required` directives can be chained to make a deeply nested field accessible after just one null check:

```javascript
const user = useFragment(graphql`
  fragment MyUser on User {
    name @required(action: LOG)
    profile_picture @required(action: LOG) {
      url @required(action: LOG)
    }
  }`, key);
 if(user == null) {
   return null;
 }
 return <img src={user.profile_picture.url} alt={user.name} />
```

**Note**: If you use `@required` on a top level field of a fragment, the object returned from `useFragment` itself may become nullable. The generated types will reflect this.

When chaining `@required` directives, the Relay compiler will help you from unintentionally creating a chain with a more severe action than intended. Consider the following fragment

```graphql
fragment MyUser on User {
  profile_picture @required(action: THROW) {
    url @required(action: LOG)
  }
}
```

In this example we want the component to THROW if the `profile_picture` field is null but we only want to LOG an error if the `url` field is null. But recall, Relay will "bubble" nullness up to the parent field, if the `url` field is null it will then cause the `profile_picture` field to become null as well. And once that happens, the component will THROW. If you implement a pattern like this, the Relay compiler will give you an error

```
A @required field may not have an `action` less severe than that of its @required parent. This @required directive should probably have `action: LOG` so that it can match its parent
```

To fix this, either change the `profile_picture` to use `action: LOG` or change the `url` field to use `action: THROW`.

## Caveats with Connections

There are currently some limitations in using the `@required` and `@connection` directives together. When you use the `@connection` directive, Relay  automatically inserts some additional fields into the connection, and those fields won't be generated with the `@required` directive. This can result in inconsistencies if you use the `@required` directive on fields in a Connection type. Consider the following example:

```graphql
fragment FriendsList on User @refetchable(queryName: "FriendsListQuery") {
  friends(after: $cursor, first: $count) @connection(key: "FriendsList_friends") {
    edges {
      node @required(action: LOG) {
        job @required(action: LOG) {
          title @required(action: LOG)
        }
      }
    }
  }
}
```

Any usages of `@required` on the `node` field or any of its direct child fields will cause the Relay compiler to give you an error saying `All references to a field must have matching @required declarations.`. In order to bypass this you'll need to remove the `@required` directives on those fields.

In the above example, we'd need to remove the `@required` directives on both the `node` and `job` fields, but the usage on the `title` field would not create an error.

```graphql
fragment FriendsList on User @refetchable(queryName: "FriendsListQuery") {
  friends(after: $cursor, first: $count) @connection(key: "FriendsList_friends") {
    edges {
      node {
        job {
          title @required(action: LOG)
        }
      }
    }
  }
}
```

## FAQ

### Why did @required make a non-nullable field/root nullable?

When using the `LOG` or `NONE` actions, Relay will "bubble" a missing field up to its parent field or fragment root. This means that adding `@required(action: LOG)` (for example) to a child of a non-nullable fragment root will cause the type of the fragment root to become nullable.

### What happens if you use `@required` in a plural field

If a `@required(action: LOG)` field is missing in a plural field, the _item_ in the list will be returned as null. It will _not_ cause the entire array to become null.. If you have any question about how it will behave, you can inspect the generated Flow types.

### Why are @required fields in an inline fragment still nullable?

Imagine a fragment like this:

```graphql
fragment MyFrag on Actor {
  ... on User {
    name @required(action: THROW)
  }
}
```

It's possible that your `Actor` will not be a `User` and therefore not include a `name`. To represent that in types, we generate a Flow type that looks like this: `{name?: string}`.

If you encounter this issue, you can add a `__typename` like this:

```graphql
fragment MyFrag on Actor {
  __typename
  ... on User {
    name @required(action: THROW)
  }
}
```

In this situation Relay will generate a union type like: `{__typename: 'User', name: string} | {__typename: '%ignore this%}`. Now you can check the `__typename` field to narrow your object's type down to one that has a non-nullable `name`.

<FbInternalOnly>
Example diff showing the adoption of this strategy: D24370183
</FbInternalOnly>

### Why not implement this at the schema/server level?

The "requiredness" of a field is actually a product decision and not a schema question. Therefore we need to implement the handling of it at the product level. Individual components need to be able to decide for themselves how to handle a missing value.

For example, if a notification is trying to show the price for a Marketplace listing, it could probably just omit the price and still render. If payment flow for that same listing is missing the price, it should probably blow up.

Another issue is that changes to the server schema are much more difficult to ship since they affect all existing clients across all platforms.

Basically every value returned by Relay is nullable. This is intentional since we want to be able to handle field-level errors whenever possible. If we lean into KillsParentOnException we would end up wanting to make basically every field use it and our apps would be becomes more brittle since errors which used to be small, become large.

<FbInternalOnly>

_Extracted from [this comment thread](https://fb.workplace.com/groups/cometeng/permalink/937671436726844/?comment_id=937681186725869)._
_Further discussion in [this comment thread](https://fb.workplace.com/groups/cometeng/permalink/937671436726844/?comment_id=938335873327067)._
</FbInternalOnly>

### Can `(action: NONE)` be the default?

On one hand action: NONE makes the most sense as a default (omitted action == no action). However, we are aware that whichever value we choose as the default will be considered the default action for engineers to choose since it's the path of least resistance.

We actually believe that in most cases LOG is the most ideal choice. It gives the component a chance to gracefully recover while also giving us signal that a part of our app is rendering in a sub-optimal way.

We debated making LOG the default action for that reason, but I think that's confusing as well.

So, for now we are planning to not offer a default argument. After all, it's still much less to write out than the equivalent manual null checks. Once we see how people use it we will consider what value (if any) should be the default.

<FbInternalOnly>

### Does @required change anything about the logger project field?

When using recoverableViolation or unrecoverableViolation, the second argument is the FBLogger project name ([defined on Comet here](https://fburl.com/diffusion/rn99dl4s)):

```javascript
recoverableViolation('My error string', 'my_logger_project');
```

When you switch to using `@required`, any `THROW` or `LOG` actions will log to the `relay-required` logger project instead ([see here in logview](https://fburl.com/logview/l40t7cjv)).

For most teams, this shouldn't be an issue; care has been taken to ensure tasks still get routed to the correct owner of the file that is using `@required`. However, if your team has any queries that utilize the logger project field, you may want to consider the implications.

</FbInternalOnly>
