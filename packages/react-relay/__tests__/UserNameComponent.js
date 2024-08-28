/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

import type {UserNameComponentFragment_user$key} from './__generated__/UserNameComponentFragment_user.graphql';

const useFragment = require('../relay-hooks/useFragment');
const {graphql} = require('relay-runtime');

export default function UserNameComponent(props: {
  user: UserNameComponentFragment_user$key,
  greeting: string,
}): React$Node {
  const data = useFragment(
    graphql`
      fragment UserNameComponentFragment_user on User {
        name
      }
    `,
    props.user,
  );

  return `${props.greeting} ${data.name}`;
}
