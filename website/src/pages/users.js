/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

import Container from '../core/Container';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import * as React from 'react';

const Users = () => {
  const {siteConfig} = useDocusaurusContext();
  const showcase = siteConfig.customFields.users.map(user => {
    return (
      <a href={user.infoLink} key={user.caption} rel="nofollow">
        <img src={useBaseUrl(user.image)} title={user.caption} />
      </a>
    );
  });

  return (
    <div className="mainContainer">
      <Container padding={['bottom', 'top']}>
        <div className="showcaseSection">
          <div className="prose">
            <h1>Who's Using Relay?</h1>
            <p>Relay is used by many folks</p>
          </div>
          <div className="logos">{showcase}</div>
        </div>
      </Container>
    </div>
  );
};

export default props => (
  <Layout>
    <Users {...props} />
  </Layout>
);
