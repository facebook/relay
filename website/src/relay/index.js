var React = require('React');
var Site = require('Site');
var SiteData = require('SiteData');

var index = React.createClass({
  render: function() {
    return (
      <Site>
        <div className="hero">
          <div className="wrap">
            <h1 className="text"><strong>Relay</strong></h1>
            <h2 className="minitext">
              A JavaScript framework for building data-driven React applications
            </h2>
          </div>
        </div>

        <section className="content wrap">
          <section className="marketing-row">
            <div className="marketing-col">
              <h3>Declarative</h3>
              <p>
                Never again communicate with your data store using an imperative
                API. Simply declare your data requirements using GraphQL and let
                Relay figure out how and when to fetch your data.
              </p>
            </div>
            <div className="marketing-col">
              <h3>Colocation</h3>
              <p>
                Queries live next to the views that rely on them, so you can
                easily reason about your app. Relay aggregates queries into
                efficient network requests to fetch only what you need.
              </p>
            </div>
            <div className="marketing-col">
              <h3>Mutations</h3>
              <p>
                Relay lets you mutate data on the client and server using
                GraphQL mutations, and offers automatic data consistency,
                optimistic updates, and error handling.
              </p>
            </div>
          </section>
        </section>

        <hr className="home-divider" />

        <section className="home-bottom-section">
          <div className="buttons-unit">
            <a className="button" href="docs/getting-started.html">
              Get Started
            </a>
            <a
              className="button"
              href={'https://github.com/facebook/relay/releases/tag/v' + SiteData.version}>
              Download the Technical Preview
            </a>
          </div>
        </section>
      </Site>
    );
  }
});

module.exports = index;
