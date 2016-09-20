/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const H2 = require('H2');
const React = require('React');
const Site = require('Site');

const center = require('center');

const support = React.createClass({
  render: function() {
    return (
      <Site section="support" title="Relay Support">

        <section className="content wrap documentationContent nosidebar">
          <div className="inner-content">
            <h1>Need help?</h1>
            <div className="subHeader"></div>
            <p>
              <strong>Relay</strong> is worked on full-time by Facebook&#39;s product infrastructure engineering teams. They&#39;re often around and available for questions.
            </p>

            <H2>Stack Overflow</H2>
            <p>Many members of the community use Stack Overflow to ask questions. Read through the <a href="https://stackoverflow.com/questions/tagged/relayjs?sort=active" rel="nofollow">existing questions</a> tagged with <strong>#relayjs</strong> or <a href="https://stackoverflow.com/questions/ask?tags=relayjs" rel="nofollow">ask your own</a>!</p>

            <H2>Discord</H2>
            <p>Many developers and users idle on Discord in <strong><a href="https://discordapp.com/channels/102860784329052160/102861057189490688">#relay on Reactiflux</a></strong>. <a href="http://www.reactiflux.com/">Get your invite here!</a></p>

            <H2>Twitter</H2>
            <p><a href="https://twitter.com/search?q=%23relayjs"><strong>#relayjs</strong> hash tag on Twitter</a> is used to keep up with the latest Relay news.</p>

            <p><center><a className="twitter-timeline" data-dnt="true" href="https://twitter.com/hashtag/relayjs" data-widget-id="630968322834628608" data-chrome="nofooter noheader transparent">#relayjs Tweets</a></center></p>
          </div>
        </section>

      </Site>
    );
  },
});

module.exports = support;
