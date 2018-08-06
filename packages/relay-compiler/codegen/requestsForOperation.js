/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const {filterContextForNode, Printer} = require('graphql-compiler');

import type {
  CompilerContext,
  DependentRequest,
  Request,
} from 'graphql-compiler';

function requestsForOperation(
  printContext: CompilerContext,
  codeGenContext: CompilerContext,
  initialRootName: string,
): Array<Request> {
  const operationToRequestName: Map<string, string> = new Map();
  return requestsInto([], {
    operationName: initialRootName,
    argumentDependencies: [],
  });
  function requestsInto(
    requests: Array<Request>,
    dependent: DependentRequest,
  ): Array<Request> {
    const name = dependent.operationName;
    // Create a unique name for this request.
    let num = 0;
    let requestName;
    do {
      requestName = name + (++num > 1 ? num : '');
    } while (requests.some(request => request.name === requestName));
    operationToRequestName.set(name, requestName);
    // Collect the dependent arguments for this request.
    const codeGenRoot = codeGenContext.getRoot(name);
    let argumentDependencies = dependent.argumentDependencies;
    let dependentRequests = codeGenRoot.dependentRequests;
    const rerunDependency = dependentRequests.find(
      next => next.operationName === dependent.operationName,
    );
    if (rerunDependency) {
      dependentRequests = dependentRequests.filter(
        next => next !== rerunDependency,
      );
      argumentDependencies = argumentDependencies.concat(
        rerunDependency.argumentDependencies,
      );
    }
    // Create a request for this operation.
    requests.push({
      kind: 'Request',
      name: requestName,
      id: null,
      text: printOperation(printContext, name),
      argumentDependencies: argumentDependencies.map(argDep => ({
        ...argDep,
        fromName: operationToRequestName.get(argDep.fromName),
      })),
      root: codeGenRoot,
      /* $FlowFixMe(>=0.68.0 site=react_native_fb,react_native_oss) This comment
       * suppresses an error found when Flow v0.68 was deployed. To see the
       * error delete this comment and run Flow. */
      metadata: dependent.metadata || undefined,
    });
    // Collect any requests that were dependent on this one as well.
    return dependentRequests.reduce(requestsInto, requests);
  }
}

function printOperation(printContext: CompilerContext, name: string): string {
  const printableRoot = printContext.getRoot(name);
  return filterContextForNode(printableRoot, printContext)
    .documents()
    .map(Printer.print)
    .join('\n');
}

module.exports = requestsForOperation;
