/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const React = require('react');
const Container = require(process.cwd() + '/core/AltContainer');
const GridBlock = require(process.cwd() + '/core/AltGridBlock');

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
            Many developers and users idle on Slack in the{' '}
            <a href="https://graphql.slack.com/messages/relay">#relay</a>{' '}
            channel of{' '}
            <a href="https://graphql-slack.herokuapp.com/">
              the GraphQL Slack community
            </a>
            .
          </span>
        ),
        title: 'Slack',
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

module.exports = Help;
