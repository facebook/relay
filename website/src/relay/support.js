/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var React = require('React');
var Site = require('Site');
var center = require('center');
var H2 = require('H2');

var support = React.createClass({
  render: function() {
    return (
      <Site section="support" title="Support">

        <section className="content wrap documentationContent nosidebar">
          <div className="inner-content">
            <h1>Need help?</h1>
            <div className="subHeader"></div>
            <p>
              <strong>Relay</strong> is worked on full-time by Facebook&#39;s product infrastructure engineering teams. They&#39;re often around and available for questions.
            </p>

            <H2>Slack</H2>
            <p>Many developers and users idle on Slack in <strong><a href="https://reactiflux.slack.com/messages/relay/">#relay on Reactiflux</a></strong>. <a href="http://www.reactiflux.com/">Get your invite here!</a></p>

            <H2>Twitter</H2>
            <p><a href="https://twitter.com/search?q=%23relayjs"><strong>#relayjs</strong> hash tag on Twitter</a> is used to keep up with the latest Relay news.</p>

            <p><center><a className="twitter-timeline" data-dnt="true" href="https://twitter.com/hashtag/relayjs" data-widget-id="630968322834628608" data-chrome="nofooter noheader transparent">#relayjs Tweets</a></center></p>
          </div>
        </section>

      </Site>
    );
  }
});

module.exports = support;
