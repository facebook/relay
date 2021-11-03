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
import GridBlock from '../core/GridBlock';
import Layout from '@theme/Layout';
import * as React from 'react';
/* eslint-enable lint/no-value-import */

class Help extends React.Component {
  render() {
    const supportLinks = [
      {
        content: (
          <span>
            Relay is worked on full-time by Facebook's product infrastructure
            engineering teams. They're often around and available for questions.
          </span>
        ),
        title: 'Need help?',
      },
      {
        content: (
          <span>
            Many members of the community use Stack Overflow to ask questions.
            Read through the{' '}
            <a href="https://stackoverflow.com/questions/tagged/relayjs?sort=active">
              existing questions
            </a>{' '}
            tagged with <b>#relayjs</b> or{' '}
            <a href="https://stackoverflow.com/questions/ask?tags=relayjs">
              ask your own
            </a>
            !
          </span>
        ),
        title: 'Stack Overflow',
      },
      {
        content: (
          <span>
            Many developers and users idle in the #relay channel of the{' '}
            <a href="https://discord.gg/Kb3SFkUeQt">GraphQL Discord server</a>.
          </span>
        ),
        title: 'Discord',
      },
      {
        content: (
          <span>
            Hashtag{' '}
            <a href="https://twitter.com/search?q=%23relayjs">#relayjs</a> is
            used on Twitter to keep up with the latest Relay news.
          </span>
        ),
        title: 'Twitter',
      },
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <GridBlock contents={supportLinks} />
          </div>
        </Container>
      </div>
    );
  }
}

export default (props) => (
  <Layout>
    <Help {...props} />
  </Layout>
);
