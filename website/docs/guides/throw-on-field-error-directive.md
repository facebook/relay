---
id: throw-on-field-error-directive
title: '@throwOnFieldError Directive'
slug: /guides/throw-on-field-error-directive/
description: Relay guide to @throwOnFieldError
keywords:
  - directive
  - optional
  - errors
---

import DocsRating from '@site/src/core/DocsRating';

The `@throwOnFieldError` directive can be added to fragments and queries. When
this directive is used, the Relay runtime will throw an exception if a field
with a field error is encountered while reading the fragment or query, or if
Relay is missing data due to a
[graph relationship change](../debugging/why-null.md/#graph-relationship-change).

In addition to causing the Relay runtime to throw an exception if a field error
is encountered, the `@throwOnFieldError` directive also enables generation of
non-null Flow types for fields that have the `@semanticNonNull` directive in the
schema. This means that if a field has the `@semanticNonNull` directive, the
generated Flow type for that field will be non-nullable; if an error were to
occur while reading that field, the thrown exception will prevent your
application from receiving a null value.

To use the `@throwOnFieldError` directive, add it to a fragment or query in your
Relay code. For example:

```
fragment MyFragment on User @throwOnFieldError {
  id
  name
}
```

In this example, the `@throwOnFieldError` directive is added to the MyFragment
fragment. If any of the fields in this fragment (in this case, id and name) have
a field error, the Relay runtime will throw an exception at the time the
fragment is read.

If you wish to handle a specific field error locally within your `@throwOnFieldError` fragment or query instead of having that error throw, you can catch the error with [@catch](./catch-directive.md).

**Read more about Relay's experimental support for
[Semantic Nullability](./semantic-nullability.md).**
