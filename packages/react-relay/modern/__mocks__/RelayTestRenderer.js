/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayTestRenderer
 * @format
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('RelayPropTypes');

const invariant = require('invariant');

import type {ConcreteBatch} from 'RelayConcreteNode';
import type {Environment, Snapshot} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

type Props = {
  environment?: Environment,
  query?: ConcreteBatch,
  variables?: Variables,
  children: Array<React.Component>,
};

class RelayTestRenderer extends React.Component {
  constructor(props: Props) {
    super(props);

    invariant(
      React.Children.count(this.props.children) === 1,
      'Expected only a single child to be passed to `RelayTestContainer`',
    );

    invariant(
      React.isValidElement(this.props.children),
      'Expected child of `RelayTestContainer` to be a React element',
    );

    let {query, environment, variables} = props;

    if (query == null) {
      query = this.props.children.props.query;
    }

    invariant(
      query,
      'Query must be supplied to either `RelayTestContainer` or its child',
    );

    if (environment == null) {
      environment = this.props.children.props.environment;
    }

    invariant(
      environment,
      'Environment must be supplied to either `RelayTestContainer` or its ' +
        'child',
    );

    if (variables == null) {
      variables = this.props.children.props.variables;
    }

    invariant(
      variables,
      'Variables must be supplied to either `RelayTestContainer` or its ' +
        'child',
    );

    const {
      createOperationSelector,
      getOperation,
    } = environment.unstable_internal;
    const operation = getOperation(query);
    const operationSelector = createOperationSelector(operation, variables);
    const snapshot = environment.lookup(operationSelector.fragment);

    this.state = {data: snapshot.data};
    environment.subscribe(snapshot, this._onChange);
  }

  getChildContext() {
    return {
      relay: {
        environment:
          this.props.environment || this.props.children.props.environment,
        variables: this.props.variables || this.props.children.props.variables,
      },
    };
  }

  _onChange = (snapshot: Snapshot): void => {
    this.setState({data: snapshot.data});
  };

  render() {
    const childProps = this.props.children.props;
    const newProps = {...childProps, ...this.state.data};
    return React.cloneElement(
      this.props.children,
      newProps,
      this.props.children.children,
    );
  }
}

RelayTestRenderer.childContextTypes = {
  relay: RelayPropTypes.Relay,
};

module.exports = RelayTestRenderer;
