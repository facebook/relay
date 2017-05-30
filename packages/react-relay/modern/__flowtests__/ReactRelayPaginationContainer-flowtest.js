/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

'use strict';

const React = require('React');

const {graphql, createPaginationContainer} = require('ReactRelayPublic');

/**
 * Verifies that normal prop type checking, as well as the methods proxying Relay does, is
 * type-checked correctly on Relay components.
 */

class FooComponent extends React.Component {
  props: {
    optionalProp?: {foo: number},
    defaultProp: string,
    requiredProp: string,
  };
  static defaultProps = {
    defaultProp: 'default',
  };
  getNum(): number {
    return 42;
  }
  render() {
    const reqLen = this.props.requiredProp.length;
    const optionalProp = this.props.optionalProp;

    /** $FlowExpectedError: `optionalProp` might be null **/
    const optionalFoo = this.props.optionalProp.foo;

    /** $FlowExpectedError: there is no prop `missingProp` **/
    const missing = this.props.missingProp;

    const defLen = this.props.defaultProp.length; // always a valid string, so no error
    return (
      <div>{reqLen && optionalProp && optionalFoo && missing && defLen}</div>
    );
  }
}
// Note that we must reassign to a new identifier to make sure flow doesn't propogate types without
// the relay type definition doing the work.
const Foo = createPaginationContainer(
  FooComponent,
  graphql`
    fragment ReactRelayPaginationContainer-flowtest_Foo_viewer on Viewer {
      all_friends(after: $cursor, first: $count) @connection {
        edges {
          node {
            __typename
          }
        }
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps: props => props.viewer.all_friends,
    getFragmentVariables: (vars, totalCount) => ({
      ...vars,
      count: totalCount,
    }),
    getVariables: (props, {count, cursor}) => ({
      after: cursor,
      count,
    }),
    query: graphql`
      query ReactRelayPaginationContainer-flowtest_Foo_ViewerQuery(
        $count: Int!
        $cursor: ID
      ) {
        viewer {
          ...Foo_viewer
        }
      }
    `,
  },
);

module.exports = {
  checkMissingProp() {
    /** $ShouldBeFlowExpectedError: Foo missing `requiredProp` **/
    return <Foo />;
  },
  checkMinimalProps() {
    // All is well
    return <Foo requiredProp="foo" />;
  },
  checkWrongPropType() {
    /** $ShouldBeFlowExpectedError: Foo1 wrong `requiredProp` type, should be string **/
    return <Foo requiredProp={17} />;
  },
  checkWrongOptionalType() {
    /** $ShouldBeFlowExpectedError: Foo wrong `optionalProp` type, should be `{foo: string}` **/
    return <Foo optionalProp="wrongType" requiredProp="foo" />;
  },
  checkNullOptionalType() {
    /** $ShouldBeFlowExpectedError: Foo `optionalProp` must be omitted or truthy, not null **/
    return <Foo optionalProp={null} requiredProp="foo" />;
  },
  checkWrongDefaultPropType() {
    /** $ShouldBeFlowExpectedError: Foo wrong `defaultProp` type, should be string **/
    return <Foo defaultProp={false} requiredProp="foo" />;
  },
  checkAllPossibleProps() {
    // All is well
    return (
      <Foo defaultProp="bar" optionalProp={{foo: 42}} requiredProp="foo" />
    );
  },
  checkMinimalPropSpread() {
    // All is well
    const props = {requiredProp: 'foo'};
    return <Foo {...props} />;
  },
  checkMissingPropSpread() {
    const props = {defaultProp: 'foo'};
    /** $ShouldBeFlowExpectedError: Foo missing `requiredProp` with spread **/
    return <Foo {...props} />;
  },
  checkStaticsAndMethodsProxying() {
    class ProxyChecker extends React.PureComponent {
      _fooRef: ?Foo;
      getString(): string {
        const ok = this._fooRef ? this._fooRef.getNum() : 'default'; // legit

        /** $ShouldBeFlowExpectedError: Foo does not have `missingMethod` **/
        const bad = this._fooRef ? this._fooRef.missingMethod() : 'default';

        /** $ShouldBeFlowExpectedError: Foo `getNum` gives number, but `getString` assumes string  **/
        return bad ? 'not good' : ok;
      }
      render() {
        return (
          <Foo
            ref={ref => {
              this._fooRef = ref;
            }}
            requiredProp="bar"
          />
        );
      }
    }
    return <ProxyChecker />;
  },
};
