/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const CompLibrary = require('../../core/CompLibrary.js');
const React = require('react');
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class Help extends React.Component {
  render() {
    const supportLinks = [
      {
        content:
          "Relay is worked on full-time by Facebook's product infrastructure engineering teams. They're often around and available for questions.",
        title: 'Need help?',
      },
      {
        content:
          'Many members of the community use Stack Overflow to ask questions. Read through the [existing questions](https://stackoverflow.com/questions/tagged/relayjs?sort=active) tagged with **#relayjs** or [ask your own](https://stackoverflow.com/questions/ask?tags=relayjs)!',
        title: 'Stack Overflow',
      },
      {
        content:
          'Many developers and users idle on Discord in [#relay](https://discord.gg/0ZcbPKXt5bX40xsQ) on [Reactiflux](https://www.reactiflux.com/).',
        title: 'Discord',
      },
      {
        content:
          'Hashtag [#relayjs](https://twitter.com/search?q=%23relayjs) is used on Twitter to keep up with the latest Relay news.',
        title: 'Twitter',
      },
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <GridBlock contents={supportLinks} layout="threeColumn" />
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Help;
