---
id: inconsistent-typename-error
title: Inconsistent Typename Error
slug: /debugging/inconsistent-typename-error/
description: Debugging inconsistent typename errors in Relay
keywords:
- debugging
- troubleshooting
- inconsistent typename
- RelayResponseNormalizer
- globally unique id
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

## Inconsistent `__typename` error

The GraphQL server likely violated the globally unique ID requirement by returning the same ID for different objects.

If you're seeing an error like:

> `RelayResponseNormalizer: Invalid record '543'. Expected __typename to be consistent, but the record was assigned conflicting types Foo and Bar. The GraphQL server likely violated the globally unique ID requirement by returning the same ID for different objects.`

the server implementation of one of the types is not spec compliant. We require the `id` field to be globally unique. This is a problem because Relay stores objects in a normalized key-value store and one of the object just overwrote the other. This means your app is broken in some subtle or less subtle way.

## Common cause

The most common reason for this error is that 2 objects backed by an ID are using the plain ID as the id field, such as a `User` and `MessagingParticipant`.

Less common reasons could be using array indices or auto-increment IDs from some database that might not be unique to this type.

## Fix: Make your type spec compliant

The best way to fix this is to make your type spec compliant. For the case of 2 different types backed by the same ID, a common solution is to prefix the ID of the less widely used type with a unique string and then base64 encode the result. This can be accomplished fairly easily by implementing a `NodeTokenResolver` using the helper trait `NodeTokenResolverWithPrefix`.  When the `NodeTokenResolver` is registered is allows you to load your type using `node(id: $yourID)` GraphQL call and your type can return an encoded ID.

<FbInternalOnly>

### Example

See [D17996531](https://www.internalfb.com/diff/D17996531) for an example on how to fix this. It created a `FusionPlatformComponentsCategoryNodeResolver` added the trait `TGraphQLNodeMixin` to the conflicting class so that it generates the base64 encoded ID.

</FbInternalOnly>

<DocsRating />
