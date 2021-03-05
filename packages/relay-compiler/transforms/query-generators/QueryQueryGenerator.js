/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {
  buildFragmentSpread,
  buildOperationArgumentDefinitions,
} = require('./utils');

import type {Fragment} from '../../core/IR';
import type {Schema} from '../../core/Schema';
import type {QueryGenerator, RefetchRoot} from '.';

function buildRefetchOperation(
  schema: Schema,
  fragment: Fragment,
  queryName: string,
): ?RefetchRoot {
  const queryType = schema.expectQueryType();
  if (!schema.areEqualTypes(fragment.type, queryType)) {
    return null;
  }

  const {directives} = fragment.metadata || {}

  const a = ([]: Array<Directive>)
  const args = ([]: Array<LocalArgumentDefinition>)
  if (directives != null) {
    a.push(...((directives:any): Array<Directive>))
    a.forEach(d=>{
      d.args.forEach(aa=>{
        if (aa.value.kind == 'Variable' && null != aa.value.variableName && null != aa.value.type) {
          args.push({
            defaultValue:   null,
            kind: 'LocalArgumentDefinition',
            loc: aa.value.loc,
            name: aa.value.variableName,
            type: aa.value.type,
          })
        }
      })
    })
  }

  return {
    identifierField: null,
    path: [],
    node: {
      argumentDefinitions: [...buildOperationArgumentDefinitions(
        fragment.argumentDefinitions,
      ), ...args],
      directives: [...a],
      kind: 'Root',
      loc: {kind: 'Derived', source: fragment.loc},
      metadata: null,
      name: queryName,
      operation: 'query',
      selections: [buildFragmentSpread(fragment)],
      type: queryType,
    },
    transformedFragment: fragment,
  };
}

module.exports = ({
  description: 'the Query type',
  buildRefetchOperation,
}: QueryGenerator);
