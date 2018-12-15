/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('React');
const ReactRelayContext = require('../modern/ReactRelayContext');
const RelayGraphQLTag = require('../classic/query/RelayGraphQLTag');

const assertFragmentMap = require('../modern/assertFragmentMap');
const invariant = require('invariant');
const mapObject = require('mapObject');
const readContext = require('../modern/readContext');

const {
  getComponentName,
  getContainerName,
} = require('../modern/ReactRelayContainerUtils');

import type {ConcreteFragmentSpread} from '../classic/query/ConcreteQuery';
import type {VariableMapping} from '../classic/query/RelayFragmentReference';
import type {GeneratedNodeMap} from '../modern/ReactRelayTypes';
import type {Variables} from 'relay-runtime';

type ContainerCreator = (
  Component: React$ComponentType<any>,
  fragments: Object,
) => React$ComponentType<any>;

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
    'injectDefaultVariablesProvider must be called no more than once.',
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
function buildCompatContainer(
  ComponentClass: React$ComponentType<any>,
  fragmentSpec: GeneratedNodeMap,
  createContainerWithFragments: ContainerCreator,
): any {
  // Sanity-check user-defined fragment input
  const containerName = getContainerName(ComponentClass);
  assertFragmentMap(getComponentName(ComponentClass), fragmentSpec);

  let injectedDefaultVariables = null;
  function getDefaultVariables() {
    if (injectedDefaultVariables == null) {
      injectedDefaultVariables = injectedDefaultVariablesProvider
        ? injectedDefaultVariablesProvider()
        : {};
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
      containerName,
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
      const fragment = RelayGraphQLTag.getClassicFragment(
        fragmentSpec[fragmentName],
      );
      return fragment.argumentDefinitions.some(
        argDef => argDef.name === variableName,
      );
    });
  }

  // Memoize a container for the last environment instance encountered
  let environment;
  let Container;
  function ContainerConstructor(props) {
    if (Container == null || props.__relayContext.environment !== environment) {
      environment = props.__relayContext.environment;

      const {getFragment: getFragmentFromTag} = environment.unstable_internal;
      const fragments = mapObject(fragmentSpec, getFragmentFromTag);
      Container = createContainerWithFragments(ComponentClass, fragments);

      // Attach static lifecycle to wrapper component so React can see it.
      ContainerConstructor.getDerivedStateFromProps = (Container: any).getDerivedStateFromProps;
    }
    // $FlowFixMe
    return new Container(props);
  }

  function forwardRef(props, ref) {
    const context = readContext(ReactRelayContext);
    invariant(
      context,
      `${containerName} tried to render a context that was ` +
        `not valid this means that ${containerName} was rendered outside of a ` +
        'query renderer.',
    );
    return (
      <ContainerConstructor
        {...props}
        __relayContext={context}
        componentRef={props.componentRef || ref}
      />
    );
  }
  forwardRef.displayName = containerName;
  const ForwardContainer = React.forwardRef(forwardRef);

  // Classic container static methods
  /* $FlowFixMe(>=0.89.0 site=www,mobile,react_native_fb,oss) Suppressing errors
   * found while preparing to upgrade to 0.89.0 */
  ForwardContainer.getFragment = getFragment;
  /* $FlowFixMe(>=0.89.0 site=www,mobile,react_native_fb,oss) Suppressing errors
   * found while preparing to upgrade to 0.89.0 */
  ForwardContainer.getFragmentNames = () => Object.keys(fragmentSpec);
  /* $FlowFixMe(>=0.89.0 site=www,mobile,react_native_fb,oss) Suppressing errors
   * found while preparing to upgrade to 0.89.0 */
  ForwardContainer.hasFragment = name => fragmentSpec.hasOwnProperty(name);
  /* $FlowFixMe(>=0.89.0 site=www,mobile,react_native_fb,oss) Suppressing errors
   * found while preparing to upgrade to 0.89.0 */
  ForwardContainer.hasVariable = hasVariable;

  if (__DEV__) {
    /* $FlowFixMe(>=0.89.0 site=www,mobile,react_native_fb,oss) Suppressing
     * errors found while preparing to upgrade to 0.89.0 */
    ForwardContainer.__ComponentClass = ComponentClass;
  }

  // Create a back-reference from the Component to the Container for cases
  // where a Classic Component might refer to itself, expecting a Container.
  (ComponentClass: any).__container__ = ForwardContainer;

  return ForwardContainer;
}

module.exports = {injectDefaultVariablesProvider, buildCompatContainer};
