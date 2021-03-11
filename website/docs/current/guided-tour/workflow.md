---
id: workflow
title: Workflow
slug: /guided-tour/workflow/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbWorkflow from './fb/FbWorkflow.md';

<FbInternalOnly>
  <FbWorkflow />
</FbInternalOnly>

<OssOnly>

Before we can get started writing Relay code, we need to make sure to **[setup the Relay Compiler](../../getting-started/installation-and-setup/#set-up-relay-compiler)**.

The **[Relay Compiler](../../guides/compiler/)** will analyze any `graphql` literals inside your Javascript code, and produce a set of artifacts that are used by Relay at runtime, when the application is running on the browser.

So whenever we're developing Relay components, for example by writing [Fragments](../rendering/fragments/) or [Queries](../rendering/queries/), we will need to run the Relay Compiler:

```sh
yarn run relay
```

Or we can run it in watch mode, so the artifacts are re-generated as we update our source code:

```sh
yarn run relay --watch
```

</OssOnly>

<DocsRating />
