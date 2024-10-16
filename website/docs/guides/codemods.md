---
id: codemods
title: Codemods
slug: /guides/codemods/
description: Relay guide to codemods
keywords:
  - codemod
  - codemods
---

import DocsRating from '@site/src/core/DocsRating'; import {FbInternalOnly,
OssOnly, fbContent} from 'docusaurus-plugin-internaldocs-fb/internal'; import
Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';

The Relay compiler has the ability to make changes across the source files of
your projects with the use of codemods. You can see the list of codemods
available by running the Relay compiler's `codemod` command:

```
> relay codemod --help
Apply codemod (verification with auto-applied fixes)

Usage: relay codemod [OPTIONS] --codemod <CODEMOD> [CONFIG]

Arguments:
  [CONFIG]
          Compile using this config file. If not provided, searches for a config in package.json under the `relay` key or `relay.config.json` files among other up from the current working directory

Options:
  -p, --project <project>
          Compile only this project. You can pass this argument multiple times. to compile multiple projects. If excluded, all projects will be compiled

  -c, --codemod <CODEMOD>
          The name of the codemod to run

          Possible values:
          - mark-dangerous-conditional-fragment-spreads: Marks unaliased conditional fragment spreads as @dangerously_unaliased_fixme

  -h, --help
          Print help (see a summary with '-h')
```

## Available codemods

The compiler currently has one available codemod:

- **mark-dangerous-conditional-fragment-spreads**: This codemod finds fragment
  spreads that are _dangerously unaliased_; that is, the fragment might not be
  fetched due to a directive such as `@skip` or its inclusion on a mismatched
  type within a union. If such a conditional fragment is not aliased with
  `@alias`, there is no way for the resulting generated Flow or TypeScript types
  to reflect its nullability. This codemod will add the
  `@dangerously_unaliased_fixme` directive to such fragment spreads, indicating
  to developers that there is a problem to be fixed. After applying this
  codemod, the `enforce_fragment_alias_where_ambiguous` feature flag can be
  enabled, which will ensure any future ambiguous fragment spreads must be
  aliased.
