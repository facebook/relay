/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');

import type {MatchPointer} from 'relay-runtime';

/**
Lazy load a FragmentContainer associated with the result of a field
marked with a @match directive.

lazyLoadFragmentMatch takes the following arguments:

- `match`: Corresponds to the result of a field marked with the @match directive
  in a fragment declaration.
- opts:
  - `load`: Function that takes a moduleName and synchronously returns a
    module, or throws a Promise to suspend rendering while the module is
    being loaded. `React.lazy` can be used here.

Example usage:
```
// FooContainer.react.js
function FooContainer() {...};

module.exports = createSuspenseFragmentContainer(
  FooContainer,
  graphql`
    fragment FooContainer_foo on Foo {
      # ...
    }
  `
);
```

```
// Parent.react.js

function Parent(props) {
  const {obj, ...restPropsj} = props;

  const MatchedContainer = lazyLoadFragmentMatch(obj.matchField, {
    load: (moduleName) => React.lazy(moduleName),
  })
  return <MatchedContainer {...restProps} />;
}

module.exports = createSuspenseFragmentContainer(
  Parent,
  graphql`
    fragment Parent_obj on ParentType {
      # ...
      matchField @match(onTypes: [
        {
          type: 'Foo'
          fragment: 'FooContainer_foo'
          module: 'FooContainer.react'
        },
        {
          type: 'Baz'
          fragment: 'BazContainer_foo'
          module: 'BazContainer.react'
        },
      ])
    }
  `
);
```
 */

function lazyLoadFragmentMatch<TProps: {}>(
  // TODO(T35918564) Should accept an opaque type
  match: mixed,
  opts: {|
    load: (moduleName: string) => React.ComponentType<TProps>,
  |},
  // TODO(T35921850) Properly specify type of lazy loaded fragment container
): React.ComponentType<TProps> {
  const {load} = opts;

  function Container(props) {
    if (match == null) {
      throw new Error(
        'lazyLoadFragmentMatch(): Expected to have found a match',
      );
    }
    //$FlowExpectedError
    const matchPointer: MatchPointer = match;

    const {__id, __fragments, __fragmentPropName, __module} = matchPointer;
    const LoadedContainer = load(__module);
    const fragmentProps = {[__fragmentPropName]: {__id, __fragments}};
    return <LoadedContainer {...props} {...fragmentProps} />;
  }
  return Container;
}

module.exports = lazyLoadFragmentMatch;
