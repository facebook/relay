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

const {graphql, createFragmentContainer} = require('ReactRelayPublic');

/**
 * Verifies that normal prop type checking, as well as the methods proxying Relay does, is
 * type-checked correctly on Relay components.
 */

const FooComponent = ({requiredProp}: {requiredProp: string}) => (
  <div>{requiredProp}</div>
);

// Note that we must reassign to a new identifier to make sure flow doesn't propogate types without
// the relay type definition doing the work.
const Foo = createFragmentContainer(
  FooComponent,
  graphql`
    fragment ReactRelayFragmentContainer-flowtest_Foo_viewer on Viewer {
      actor { id }
    }
  `,
);

class BarComponent extends React.Component {
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
const Bar = createFragmentContainer(
  BarComponent,
  graphql`
    fragment ReactRelayFragmentContainer-flowtest_Bar_viewer on Viewer {
      actor { id }
    }
  `,
);

module.exports = {
  checkMissingPropOnFunctionalComponent() {
    /** $ShouldBeFlowExpectedError: Foo missing `requiredProp` **/
    return <Foo />;
  },
  checkMinimalPropsOnFunctionalComponent() {
    // Fine, no expected errors
    return <Foo requiredProp="foo" />;
  },
  checkMissingPropOnClassComponent() {
    /** $ShouldBeFlowExpectedError: Bar missing `requiredProp` **/
    return <Bar />;
  },
  checkMinimalPropsOnClassComponent() {
    // All is well
    return <Bar requiredProp="foo" />;
  },
  checkWrongPropType() {
    /** $ShouldBeFlowExpectedError: Bar wrong `requiredProp` type, should be string **/
    return <Bar requiredProp={17} />;
  },
  checkWrongOptionalType() {
    /** $ShouldBeFlowExpectedError: Bar wrong `optionalProp` type, should be `{foo: string}` **/
    return <Bar optionalProp="wrongType" requiredProp="foo" />;
  },
  checkNullOptionalType() {
    /** $ShouldBeFlowExpectedError: Bar `optionalProp` must be omitted or truthy, not null **/
    return <Bar optionalProp={null} requiredProp="foo" />;
  },
  checkWrongDefaultPropType() {
    /** $ShouldBeFlowExpectedError: Bar wrong `defaultProp` type, should be string **/
    return <Bar defaultProp={false} requiredProp="foo" />;
  },
  checkAllPossibleProps() {
    // All is well
    return (
      <Bar defaultProp="bar" optionalProp={{foo: 42}} requiredProp="foo" />
    );
  },
  checkMinimalPropSpread() {
    // All is well
    const props = {requiredProp: 'foo'};
    return <Bar {...props} />;
  },
  checkMissingPropSpread() {
    const props = {defaultProp: 'foo'};
    /** $ShouldBeFlowExpectedError: Bar missing `requiredProp` with spread **/
    return <Bar {...props} />;
  },
  checkStaticsAndMethodsProxying() {
    class ProxyChecker extends React.PureComponent {
      _barRef: ?Bar;
      getString(): string {
        const ok = this._barRef ? this._barRef.getNum() : 'default'; // legit

        /** $ShouldBeFlowExpectedError: Bar does not have `missingMethod` **/
        const bad = this._barRef ? this._barRef.missingMethod() : 'default';

        /** $ShouldBeFlowExpectedError: Bar `getNum` gives number, but `getString` assumes string  **/
        return bad ? 'not good' : ok;
      }
      render() {
        return (
          <Bar
            ref={ref => {
              this._barRef = ref;
            }}
            requiredProp="bar"
          />
        );
      }
    }
    return <ProxyChecker />;
  },
};
