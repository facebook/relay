---
id: configuration
title: Configuration
slug: /guides/data-driven-dependencies/configuration/
description: Data driven dependencies configuration
keywords:
- 3D
- 3D config
- data driven dependencies
- module
- match
- MatchContainer
---
import {FbInternalOnly, OssOnly} from 'docusaurus-plugin-internaldocs-fb/internal';
import DocsRating from '@site/src/core/DocsRating';

Server 3D is automatically enabled without any changes to your configuration.

In order to use Client 3D, you need to add an extra field to your relay [compiler configuration](https://relay.dev/docs/getting-started/installation-and-setup/#compiler-configuration) file: `moduleImportConfig`.

<FbInternalOnly>

If you're working on a project in xplat, [config.xplat.json](https://www.internalfb.com/code/fbsource/[3b58a2b59826]/xplat/relay/compiler-rs/config.xplat.json) is your configuration file. If you're working on a
project in www, [config.www.json](https://www.internalfb.com/code/www/[93b4b956668f]/scripts/relay/compiler-rs/config.www.json) is your configuration file.

</FbInternalOnly>


There are 2 subfields in `moduleImportConfig`:
- `dynamicModuleProvider`: This field defines the way the 3D components will be imported.
- `surface`: This field defines the surfaces for which client 3D should be enabled.

These fields are necessary to differentiate between different use cases in Meta's internal codebase, but in OSS they're more straightforward.

<FbInternalOnly>

### `dynamicModuleProvider`

`dynamicModuleProvider` has 2 subfields: `mode` and `statement`.

There are 2 modes that `dynamicModuleProvider` can be set to:
- `JSResource`: This indicates to the Relay Compiler that the 3D component should be imported as a [JSResource](https://www.internalfb.com/intern/wiki/Static_Resources/haste_comet/JSResource/), a dynamically loadable Javascript module. In this case, you can omit the `statement` subfield entirely.

For example:

```js
"moduleImportConfig": {
    "dynamicModuleProvider": {
        "mode": "JSResource"
    }
},
```

- `Custom`: This indicates that you want to write a custom statement import statement to load your 3D component. Fill in the `statement`
subfield with your custom import statement, using `<$module>` in place of your 3D component name.

For example:
```js
"moduleImportConfig": {
    "dynamicModuleProvider": {
        "mode": "Custom",
        "statement": "function() { var JSResource = require('JSResource'); return JSResource('m#<$module>'); }"
    }
}
```

### `surface`

Surface can be set to one of 3 options:
- `resolvers`: this indicates that Client 3D should work only for data fields determined entirely by Relay Resolvers on the client side. You can consider this to be the "vanilla" client 3D use case.

For example:
```js
"moduleImportConfig": {
    "dynamicModuleProvider": {
        "mode": "JSResource",
    },
    "surface": "resolvers"
}
```

- None: you can omit the `surface` configuration field altogether. This is what most projects in Xplat are configured to currently, as
you can see in the [Xplat relay configuration file](https://www.internalfb.com/code/fbsource/[3b58a2b59826]/xplat/relay/compiler-rs/config.xplat.json). This case is a special variation of Server 3D where the 3D component module information is stored on the client side by the Relay compiler, and not downloaded from the server along with the data at runtime. This variation of Client 3D doesn't offer any performance gains over server 3D. Rather, it was developed for Xplat to support code sharing between Xplat and WWW.

The two config examples given in the `dynamicModuleProvider` section above are both examples of this None case.
- `all`: this indicates that BOTH the `resolvers` case and None case above should work.

For example:
```js
"moduleImportConfig": {
    "dynamicModuleProvider": {
        "mode": "JSResource",
    },
    "surface": "all"
}
```

</FbInternalOnly>

<OssOnly>

### `dynamicModuleProvider`

In OSS, `dynamicModuleProvider` has two subfields:
- `mode`: This should be set to "Custom".
- `statement`: This is the statement that will be used to import your UI module `<$module>` into the
parent component where 3D is being used. You can set it to whatever you need to import your module successfully.

### `surface`

In OSS, the `surface` field should be set to `resolvers`.

Here is an example of what an OSS relay compiler configuration that enables client 3D could look like:

```js
"moduleImportConfig": {
    "dynamicModuleProvider": {
        "mode": "Custom",
        "statement": "() => require('./.<$module>')"
    },
    "surface": "resolvers"
}
```

</OssOnly>

<DocsRating />
