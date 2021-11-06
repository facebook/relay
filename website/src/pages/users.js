/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/* eslint-disable lint/no-value-import */
import Container from '../core/Container';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import * as React from 'react';
/* eslint-enable lint/no-value-import */

const Users = () => {
  const {siteConfig} = useDocusaurusContext();
  const showcase = siteConfig.customFields.users.map((user) => {
    return (
      <a href={user.infoLink} key={user.caption}>
        <img src={user.image} title={user.caption} />
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
          <p>Are you using this project?</p>
          <a href="https://github.com/facebook/relay/edit/main/website/docusaurus.config.js">
            Add your project
          </a>
        </div>
      </Container>
    </div>
  );
};

export default (props) => (
  <Layout>
    <Users {...props} />
  </Layout>
);
