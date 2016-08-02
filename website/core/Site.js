/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Site
 */

'use strict';

const React = require('React');
const HeaderLinks = require('HeaderLinks');

const Site = React.createClass({
  render: function() {
    const title = this.props.title ? this.props.title : 'Relay | A JavaScript framework for building data-driven React applications';
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          <title>{title}</title>
          <meta name="viewport" content="width=device-width" />
          <meta property="og:title" content={title} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="http://facebook.github.io/relay/index.html" />
          <meta property="og:description" content="A JavaScript framework for building data-driven React applications" />

          <link rel="shortcut icon" href="/relay/img/favicon.png" />
          <link rel="stylesheet" href="/relay/css/relay.css" />

          <script type="text/javascript" src="//use.typekit.net/vqa1hcx.js"></script>
          <script type="text/javascript">{'try{Typekit.load();}catch(e){}'}</script>
        </head>
        <body>

          <div className="container">
            <div className="nav-main">
              <div className="wrap">
                <a className="nav-home" href="/relay/">
                  <img className="nav-logo" src="/relay/img/logo.svg" width="50" height="50" />
                  Relay
                </a>
                <HeaderLinks section={this.props.section} />
              </div>
            </div>

            {this.props.children}

            <footer className="wrap">
              <div className="right">©2016 Facebook Inc.</div>
            </footer>
          </div>

          <div id="fb-root" />

          <script dangerouslySetInnerHTML={{__html: `
            !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
              ga('create', 'UA-71174216-1', 'auto');
              ga('send', 'pageview');
          `}} />
        </body>
      </html>
    );
  }
});

module.exports = Site;
