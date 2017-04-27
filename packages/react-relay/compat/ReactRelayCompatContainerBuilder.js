/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayCompatContainerBuilder
 * @flow
 */

'use strict';

const RelayContainerProxy = require('RelayContainerProxy');
const RelayGraphQLTag = require('RelayGraphQLTag');
const RelayPropTypes = require('RelayPropTypes');

const assertFragmentMap = require('assertFragmentMap');
const invariant = require('invariant');
const mapObject = require('mapObject');

const {getComponentName, getContainerName} = require('RelayContainerUtils');

import type {ConcreteFragmentSpread} from 'ConcreteQuery';
import type {GeneratedNodeMap} from 'ReactRelayTypes';
import type {VariableMapping} from 'RelayFragmentReference';
import type {Variables} from 'RelayTypes';

const containerContextTypes = {
  relay: RelayPropTypes.Relay,
};

type ContainerCreator = (
  Component: ReactClass<any>,
  fragments: Object,
) => ReactClass<any>;

type VariablesProvider = () => Variables;

/**
 * `injectDefaultVariablesProvider()` allows classic versions of a container to
 * inject default variable values for a fragment via the arguments of any
 * references to it. This is useful for fragments that need to reference
 * global query constants (e.g. the device pixel ratio) but may be included
 * in classic queries that do not define the necessary param.
 */
let injectedDefaultVariablesProvider = null;
function injectDefaultVariablesProvider(variablesProvider: VariablesProvider) {
  invariant(
    !injectedDefaultVariablesProvider,
    'injectDefaultVariablesProvider must be called no more than once.'
  );
  injectedDefaultVariablesProvider = variablesProvider;
}

/**
 * Creates a component class whose instances adapt to the
 * `context.relay.environment` in which they are rendered and which have the
 * necessary static methods (`getFragment()` etc) to be composed within classic
 * `Relay.Containers`.
 *
 * The returned constructor uses the given `createContainerForEnvironment` to
 * construct a new container type whenever a new environment is encountered;
 * while the constructor is being used for the same environment (the expected
 * majority case) this value is memoized to avoid creating unnecessary extra
 * container definitions or unwrapping the environment-specific fragment
 * defintions unnecessarily.
 */
function buildCompatContainer<TBase: ReactClass<*>>(
  ComponentClass: TBase,
  fragmentSpec: GeneratedNodeMap,
  createContainerWithFragments: ContainerCreator,
): TBase {
  // Sanity-check user-defined fragment input
  const containerName = getContainerName(ComponentClass);
  assertFragmentMap(getComponentName(ComponentClass), fragmentSpec);

  let injectedDefaultVariables = null;
  function getDefaultVariables() {
    if (injectedDefaultVariables == null) {
      injectedDefaultVariables = injectedDefaultVariablesProvider ?
        injectedDefaultVariablesProvider() :
        {};
    }
    return injectedDefaultVariables;
  }

  // Similar to RelayContainer.getFragment(), except that this returns a
  // FragmentSpread in order to support referencing root variables.
  function getFragment(
    fragmentName: string,
    variableMapping?: VariableMapping,
  ): ConcreteFragmentSpread {
    const taggedNode = fragmentSpec[fragmentName];
    invariant(
      taggedNode,
      'ReactRelayCompatContainerBuilder: Expected a fragment named `%s` to be defined ' +
      'on `%s`.',
      fragmentName,
      containerName
    );
    const fragment = RelayGraphQLTag.getClassicFragment(taggedNode);

    const args = {
      ...getDefaultVariables(),
      ...(variableMapping || {}),
    };

    return {
      kind: 'FragmentSpread',
      args,
      fragment,
    };
  }

  function hasVariable(variableName: string): boolean {
    return Object.keys(fragmentSpec).some(fragmentName => {
      const fragment = RelayGraphQLTag.getClassicFragment(fragmentSpec[fragmentName]);
      return fragment.argumentDefinitions.some(argDef => argDef.name === variableName);
    });
  }

  // Memoize a container for the last environment instance encountered
  let environment;
  let Container;
  function ContainerConstructor(props, context) {
    if (Container == null || context.relay.environment !== environment) {
      environment = context.relay.environment;
      const {getFragment: getFragmentFromTag} = environment.unstable_internal;
      const fragments = mapObject(fragmentSpec, getFragmentFromTag);
      Container = createContainerWithFragments(ComponentClass, fragments);
      RelayContainerProxy.proxyMethods(Container, ComponentClass);
    }
    return new Container(props, context);
  }
  ContainerConstructor.contextTypes = containerContextTypes;
  ContainerConstructor.displayName = containerName;

  // Classic container static methods
  ContainerConstructor.getFragment = getFragment;
  ContainerConstructor.getFragmentNames = () => Object.keys(fragmentSpec);
  ContainerConstructor.hasFragment = name => fragmentSpec.hasOwnProperty(name);
  ContainerConstructor.hasVariable = hasVariable;

  // Create a back-reference from the Component to the Container for cases
  // where a Classic Component might refer to itself, expecting a Container.
  ComponentClass.__container__ = ContainerConstructor;

  return (ContainerConstructor: any);
}

module.exports = {injectDefaultVariablesProvider, buildCompatContainer};
