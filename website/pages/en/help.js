/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class Help extends React.Component {
  render() {
    const supportLinks = [
      {
        content:
          "Relay is worked on full-time by Facebook's product infrastructure engineering teams. They're often around and available for questions.",
        title: "Need help?"
      },
      {
        content:
          "Many members of the community use Stack Overflow to ask questions. Read through the [existing questions](https://stackoverflow.com/questions/tagged/relayjs?sort=active) tagged with **#relayjs** or [ask your own](https://stackoverflow.com/questions/ask?tags=relayjs)!",
        title: "Stack Overflow"
      },
      {
        content:
          "Many developers and users idle on Discord in #relay on Reactiflux.",
        title: "Discord"
      },
      {
        content:
          "[*#relayjs* hash tag on Twitter](https://twitter.com/search?q=%23relayjs) is used to keep up with the latest Relay news.",
        title: "Twitter"
      }
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
