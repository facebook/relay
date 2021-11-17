/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {$FragmentRef} from '../ReactRelayTypes';
import type {RelayModernFlowtest_badref} from './RelayModernFlowtest_badref.graphql';
import type {RelayModernFlowtest_notref} from './RelayModernFlowtest_notref.graphql';
import type {
  RelayModernFlowtest_user,
  RelayModernFlowtest_user$ref,
} from './RelayModernFlowtest_user.graphql';
import type {
  RelayModernFlowtest_users,
  RelayModernFlowtest_users$ref,
} from './RelayModernFlowtest_users.graphql';

const {
  createContainer: createFragmentContainer,
} = require('../ReactRelayFragmentContainer');
const React = require('react');
const {graphql} = require('relay-runtime');

declare function nullthrows<T>(x: ?T): T;

class NotReferencedTest_ extends React.Component<{
  notref: RelayModernFlowtest_notref,
  ...
}> {
  render(): React.Node {
    return null;
  }
}

const NotReferencedTest = createFragmentContainer(NotReferencedTest_, {
  notref: graphql`
    fragment RelayModernFlowtest_notref on User {
      id
      ...RelayModernFlowtest_user
    }
  `,
});

class BadReferenceTest_ extends React.Component<{
  badref: RelayModernFlowtest_badref,
  ...
}> {
  render(): React.Node {
    (this.props.badref.id: string);
    // $FlowExpectedError
    this.props.badref.name;
    // $FlowExpectedError The notref fragment was not used.
    return <NotReferencedTest notref={this.props.badref} />;
  }
}

const BadReferenceTest = createFragmentContainer(BadReferenceTest_, {
  badref: graphql`
    fragment RelayModernFlowtest_badref on User {
      id
      # Note: this test includes a reference, but *not the right one*.
      ...RelayModernFlowtest_user
    }
  `,
});

declare var someRef: $FragmentRef<RelayModernFlowtest_badref>;

<BadReferenceTest badref={someRef} />;

class SingularTest extends React.Component<{
  string: string,
  onClick: () => void,
  user: RelayModernFlowtest_user,
  nullableUser: ?RelayModernFlowtest_user,
  optionalUser?: RelayModernFlowtest_user,
  ...
}> {
  render(): React.Node {
    (nullthrows(this.props.user.name): string);
    // $FlowExpectedError
    this.props.nullableUser.name;
    // $FlowExpectedError
    this.props.optionalUser.name;
    (nullthrows(nullthrows(this.props.nullableUser).name): string);
    (nullthrows(nullthrows(this.props.optionalUser).name): string);
    return null;
  }
}
const SingularTestFragment = createFragmentContainer(SingularTest, {
  user: graphql`
    fragment RelayModernFlowtest_user on User {
      name
    }
  `,
});

class PluralTest extends React.Component<{
  users: RelayModernFlowtest_users,
  nullableUsers: ?RelayModernFlowtest_users,
  optionalUsers?: RelayModernFlowtest_users,
  ...
}> {
  render(): React.Node {
    const names = this.props.users.map(user => user.name).filter(Boolean);
    // $FlowExpectedError
    (names: Array<string>);
    // $FlowExpectedError
    (names: Array<number>);
    return null;
  }
}
const PluralTestFragment = createFragmentContainer(PluralTest, {
  users: graphql`
    fragment RelayModernFlowtest_users on User @relay(plural: true) {
      name
    }
  `,
});

declare var aUserRef: {
  +$fragmentSpreads: RelayModernFlowtest_user$ref,
  ...
};

declare var oneOfUsersRef: {
  +$fragmentSpreads: RelayModernFlowtest_users$ref,
  ...
};

declare var usersRef: $ReadOnlyArray<{
  +$fragmentSpreads: RelayModernFlowtest_users$ref,
  ...
}>;

declare var nonUserRef: {
  +$fragmentSpreads: {thing: true, ...},
  ...
};

function cb(): void {}

<SingularTestFragment
  onClick={cb}
  string="x"
  // $FlowExpectedError - can't pass null for user
  user={null}
  nullableUser={null}
/>;
// $FlowExpectedError - user is required
<SingularTestFragment onClick={cb} string="x" nullableUser={null} />;
<SingularTestFragment
  onClick={cb}
  string="x"
  // $FlowExpectedError - can't pass non-user ref for user
  user={nonUserRef}
  nullableUser={null}
/>;
<SingularTestFragment
  // $FlowExpectedError - `cb` prop is not a function
  onClick="cb"
  string="x"
  user={aUserRef}
  nullableUser={null}
/>;
<SingularTestFragment
  onClick={cb}
  // $FlowExpectedError - `string` prop is not a string
  string={1}
  user={aUserRef}
  nullableUser={null}
/>;

<SingularTestFragment
  onClick={cb}
  string="x"
  user={aUserRef}
  nullableUser={null}
/>;
<SingularTestFragment
  onClick={cb}
  string="x"
  user={aUserRef}
  nullableUser={aUserRef}
/>;
<SingularTestFragment
  onClick={cb}
  string="x"
  user={aUserRef}
  nullableUser={null}
  optionalUser={aUserRef}
/>;

// $FlowExpectedError - onClick is required
<SingularTestFragment
  string="x"
  user={aUserRef}
  nullableUser={null}
  // $FlowExpectedError - optional, not nullable!
  optionalUser={null}
/>;

declare var aComplexUserRef: {
  +$fragmentSpreads: {thing1: true, ...} & RelayModernFlowtest_user$ref & {
      thing2: true,
      ...
    },
  ...
};
<SingularTestFragment
  string="x"
  onClick={cb}
  user={aComplexUserRef}
  nullableUser={aComplexUserRef}
  optionalUser={aComplexUserRef}
/>;

// $FlowExpectedError - can't pass null for user
<PluralTestFragment users={null} nullableUsers={null} />;
// $FlowExpectedError - users is required
<PluralTestFragment nullableUsers={null} />;
// $FlowExpectedError - can't pass non-user refs for user
<PluralTestFragment users={[nonUserRef]} nullableUsers={null} />;

<PluralTestFragment users={usersRef} nullableUsers={null} />;

<PluralTestFragment
  users={([oneOfUsersRef]: Array<typeof oneOfUsersRef>)}
  nullableUsers={null}
/>;
<PluralTestFragment users={[oneOfUsersRef]} nullableUsers={null} />;

<PluralTestFragment users={usersRef} nullableUsers={[oneOfUsersRef]} />;
<PluralTestFragment
  users={usersRef}
  nullableUsers={null}
  optionalUsers={usersRef}
/>;
<PluralTestFragment
  users={usersRef}
  nullableUsers={null}
  // $FlowExpectedError - optional, not nullable!
  optionalUsers={null}
/>;

class AnyTest extends React.Component<{|
  anything: any,
|}> {}
const AnyTestContainer = createFragmentContainer(AnyTest, {});

<AnyTestContainer anything={42} />;
<AnyTestContainer anything={null} />;
<AnyTestContainer anything={() => {}} />;
// $FlowExpectedError - any other prop can not be passed
<AnyTestContainer anything={null} anythingElse={42} />;
// $FlowExpectedError - anything has to be passed
<AnyTestContainer />;
