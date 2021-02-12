---
id: disallowed-inline-fragment-on-abstract-types
title: Disallowed Inline Fragment on Abstract Types
slug: /debugging/disallowed-inline-fragment-on-abstract-types/
---

import DocsRating from '../../src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'internaldocs-fb-helpers';

<FbInternalOnly>

> TL;DR **Violations of this error can substantially regress Comet VC. We strongly advise using the below workaround to avoid performance regressions on Comet**.

# Background

The Comet lint rule `fb-www/relay-no-abstract-type-refinement` disallows writing inline fragments on abstract types (interfaces or unions) if their parent type is also an abstract type.

The reason this rule exists is to prevent possible issues or SEVs in production (such as S198601 and S200121) due to a known issue in Relay which prevents it from correctly detecting whether data is actually "missing" when selected under an abstract type. This can cause Relay to incorrectly suspend, showing undesired or longer-than-necessary loading states in the app.

Relay is currently working on a fix for this issue ([T65855998](https://www.internalfb.com/tasks/?t=65855998)) and will remove this lint rule once it is fixed.

</FbInternalOnly>

<OssOnly>

# Summary

You should not write inline fragments on abstract types (interfaces or unions) if their parent type is also an abstract type. There is a known issue in Relay which prevents it from correctly detecting whether data is actually "missing" when selected under an abstract type. This can cause Relay to incorrectly suspend, showing undesired or longer-than-necessary loading states in the app.

</OssOnly>


# Workarounds

Instead of using a single inline fragment on an abstract type, you can convert it into one inline fragment per concrete type that implements the abstract type.

For example, given the following schema:

```
interface AbstractType {}

type A implements AbstractType {}

type B implements AbsstractType {}
```

The following inline fragment
```
... on AbstractType {
  # selections
}

```

Can be replaced with
```
... on A {
  # selections
}

... on B {
  # selections
}

```

<FbInternalOnly>

See [D20746012](https://www.internalfb.com/diff/D20746012) for an example of this change.

</FbInternalOnly>
