/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

class HomeSplash extends React.Component {
  render() {
    return (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="logo">
            <img src={siteConfig.baseUrl + 'img/relay-white.svg'} />
          </div>
          <div className="wrapper homeWrapper">
            <h2 className="projectTitle">
              {siteConfig.title}
              <small>{siteConfig.tagline}</small>
              <small>{siteConfig.subtagline}</small>
            </h2>
          </div>
        </div>
      </div>
    );
  }
}

class Index extends React.Component {
  render() {
    let language = this.props.language || 'en';
    const showcase = siteConfig.users
      .filter(user => {
        return user.pinned;
      })
      .map((user, i) => {
        return (
          <a href={user.infoLink} key={i}>
            <img src={user.image} title={user.caption} />
            <div>
              <h6>{user.caption}</h6>
              <p>{user.description}</p>
            </div>
          </a>
        );
      });

    return (
      <div>
        <HomeSplash language={language} />
        <div className="homePage mainContainer">
          <Container className="textSection" background="light">
            <h2>Built for scale</h2>
            <h3>
              Relay was designed to be performant from the ground up, and to
              support scaling your application to{' '}
              <b>
                <em>thousands</em>
              </b>{' '}
              of components, while keeping management of data fetching sane, and
              fast iteration speeds as your application grows and changes.
            </h3>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: 'Quick iteration',
                  content:
                    '<p>Relay is built upon <em>locally</em> declaring data dependencies for components. This means each component declares <em>what</em> data that it needs, without worrying about <em>how</em> to fetch it; Relay guarantees that the data each component needs is fetched and available.</p><p>This allows components and their data dependencies to be modified <b><em>quickly</em></b> and in <b><em>isolation</em></b>, without needing to update other parts of the system or, worrying about breaking other components</p>',
                },
                {
                  title: 'Minimal round trips',
                  content:
                    '<p>Relay automatically aggregates the data requirements for your entire application, so that they can be fetched in a single GraphQL request.</p><p>Relay will handle all of the heavy lifting to ensure the data declared by your components is fetched in the most efficient way, for example by deduplicating identical fields, fetching as early as possible, among other optimizations.</p>',
                },
                {
                  title: 'Automatic data consistency',
                  content:
                    '<p>Relay automatically keeps all of your components up to date whenever data that affects them changes, and efficiently update them only when strictly necessary.</p><p>Relay also support executing GraphQL Mutations, optionally with optimistic updates, and updates to local data, while ensuring that visible data on the screen is always kept up to date.</p>',
                },
              ]}
            />
          </Container>
          <Container className="exampleSection">
            <div className="wrapperInner">
              <div className="radiusRight">
                <h2>Query Renderer</h2>
                <p>
                  When creating a new screen, you start with a{' '}
                  <a href="/docs/en/query-renderer">
                    <code>QueryRenderer</code>
                  </a>
                  .
                </p>
                <p>
                  A <code>QueryRenderer</code> is a React Component which is the
                  root of a Relay component tree. It handles fetching your
                  query, and uses the <code>render</code> prop to render the
                  resulting data.
                </p>
                <p>
                  As React components, <code>QueryRenderers</code> can be
                  rendered anywhere that a React component can be rendered, i.e.
                  not just at the top level but *within* other components or
                  containers. For example, you could use a{' '}
                  <code>QueryRenderer</code> to lazily fetch additional data for
                  a popover.
                </p>
              </div>

              <div className="radiusLeft">
                <pre>
                  <code>
                    {`
import React from "react"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"
import environment from "./lib/createRelayEnvironment"
import ArtistHeader from "./ArtistHeader" // Below

// You can usually use one query renderer per page
// and it represents the root of a query
export default function ArtistRenderer({artistID}) {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql\`
        query QueryRenderersArtistQuery($artistID: String!) {
          # The root field for the query
          artist(id: $artistID) {
            # A reference to your fragment container
            ...ArtistHeader_artist
          }
        }
      \`}
      variables={{artistID}}
      render={({error, props}) => {
        if (error) {
          return <div>{error.message}</div>;
        } else if (props) {
          return <Artist artist={props.artist} />;
        }
        return <div>Loading</div>;
      }}
    />
  );
}
                  `}
                  </code>
                </pre>
              </div>

              <div>
                <h2>Fragment Container</h2>
                <p>
                  Step two is to render a tree of React components powered by
                  Relay, which may include <code>FragmentContainers</code>,{' '}
                  <code>PaginationContainers</code>, or{' '}
                  <code>RefetchContainers</code>.
                </p>
                <p>
                  The most common are <code>FragmentContainers</code>, which you
                  can use to declare a <em>specification</em> of the data that a
                  Component will need in order to render. Note that a{' '}
                  <code>FragmentContainer</code> won't directly fetch the data;
                  instead, the data will be fetched by a QueryRenderer ancestor
                  at the root, which will aggregate all of the data needed for a
                  tree of Relay components, and fetch it in a *single round
                  trip*.
                </p>
                <p>
                  Relay will then guarantee that the data declared by a
                  <code>FragmentContainer</code> is available *before* rendering
                  the component.
                </p>
              </div>
              <div>
                <pre>
                  <code>
                    {`
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { Link, Image, Name, Bio, View,} from "./views"

function ArtistHeader(props) {
  const {name, href, image, bio} = props.artist;
  const imageUrl = image && image.url;

  return (
    <Link href={href}>
      <Image imageUrl={imageUrl} />
      <View>
        <Name>{name}</Name>
        <Bio>{bio}</Bio>
      </View>
    </Link>
  );
}

export default createFragmentContainer(ArtistHeader, {
  artist: graphql\`
    # This fragment is declaring that this component
    # needs an Artist, and these specific fields on
    # the Artist in order to render. Relay will
    # guarantee that this data is fetched and available
    # for this component.
    fragment ArtistHeader_artist on Artist {
      href
      bio
      name
      image {
        url
      }
    }
  \`,
});
                  `}
                  </code>
                </pre>
              </div>
            </div>
          </Container>

          <Container className="textSection graphqlSection" background="light">
            <h2>GraphQL best practices baked in</h2>
            <h3>
              Relay applies and relies on GraphQL best practices. To get the
              most from Relay’s features, you’ll want your GraphQL server to
              conform to these standard practices.
            </h3>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: 'Fragments',
                  content: `<p>A GraphQL <a href="https://graphql.org/learn/queries/#fragments" target="_blank">Fragment</a> is a reusable selection of fields for a given GraphQL type. It can be composed by including it in other Fragments, or including it as part of GraphQL Queries.</p><p>Relay uses Fragments to declare data requirements for components, and compose data requirements together.</p><p>See the <a href=${siteConfig.baseUrl +
                    'docs/' +
                    this.props.language +
                    '/fragment-container'}>Fragment Container docs</a></p>`,
                },
                {
                  title: 'Connections',
                  content: `<p>GraphQL <a href="https://graphql.org/learn/pagination/#complete-connection-model" target="_blank">Connections</a> are a model for representing lists of data in GraphQL, so that they can easily be paginated in any direction, as well as to be able to encode rich relationship data.</p><p>GraphQL Connections are considered a best practice for <a href="https://graphql.org/learn/pagination/">Pagination in GraphQL</a>, and Relay provides first class support for these, as long as your GraphQL server supports them.</p><p>See the <a href=${siteConfig.baseUrl +
                    'docs/' +
                    this.props.language +
                    '/graphql-server-specification.html#connections'}>Connections</a> docs</p>`,
                },
                {
                  title: 'Global Object Identification',
                  content: `<p>Relay relies on <a href="https://graphql.org/learn/global-object-identification/" target="_blank">Global Object Identification</a> to provide reliable caching and refetching, and to make it possible to automatically merge updates for objects.</p><p>Global Object Identification consists on providing globally unique ids across your entire schema for every type, built using the Node GraphQL interface.</p><p><a href=${siteConfig.baseUrl +
                    'docs/' +
                    this.props.language +
                    '/graphql-server-specification.html#object-identification'}>See the Object Identification docs</a></p>`,
                },
              ]}
            />
          </Container>

          <Container
            className="textSection declarativeSection"
            background="light">
            <h2>Flexible Mutations</h2>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: 'Describe data changing',
                  content:
                    '<p>Using GraphQL mutations, you can declaratively define and request the data that will be affected by executing a mutation in a <em>single round trip</em>, and Relay will automatically merge and propagate those changes.</p>',
                },
                {
                  title: 'Automatic updates',
                  content:
                    '<p>Using Global Object Identification, Relay is capable of automatically merging mutation updates for any affected objects, and updating only the affected components.</p><p>For more complex cases where updates cannot automatically be merged, Relay provides apis to manually update the local Relay data in response to a mutation.</p>',
                },
                {
                  title: 'Designed for great UX',
                  content:
                    "<p>Relay's mutation API supports making optimistic updates to show immediate feedback to users, as well as error handling and automatically reverting changes when mutations fail.</p>",
                },
              ]}
            />
          </Container>

          <Container className="textSection aheadSection">
            <h2>Ahead-of-time Safety</h2>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: 'Peace of mind',
                  content:
                    '<p>While you work on a Relay project, the Relay compiler will guide you to ensure project-wide consistency and correctness against your GraphQL schema.</p>',
                },
                {
                  title: 'Optimized runtime',
                  content:
                    '<p>Relay pre-computes a lot of work (like processing and optimizing queries) ahead of time, during build time, in order to make the runtime on the browser or device as efficient as possible.</p>',
                },
                {
                  title: 'Type safety',
                  content:
                    '<p>Relay generates Flow or Typescript types for each of your React components that use Relay, which represent the data that each component receives, so you can make changes more quickly and safely while knowing that correctness is guaranteed.</p>',
                },
              ]}
            />
          </Container>

          <Container className="textSection relaySection">
            <h2>Can Relay Work For Me?</h2>
            <GridBlock
              layout="twoColumn"
              contents={[
                {
                  title: 'Adopt Incrementally',
                  content:
                    '<p>If you already can render React components, you’re most of the way there. Relay requires a Babel plugin, and to also run the Relay Compiler.</p><p>You can use Relay out of the box with Create React App and Next.js.</p>',
                },
                {
                  title: 'Make Complexity Explicit',
                  content:
                    '<p>Relay requires a bit more up-front setup and tools, in favour of supporting an architecture of isolated components which <a href="#">can scale</a> with your team and app complexity.</p><p>Learn these principles once, then spend more time working on business logic instead of pipelining data.</p>',
                },
                {
                  title: 'Used at Facebook Scale',
                  content:
                    '<p>Relay is critical infrastructure in Facebook,  there are tens of thousands of components using it. Relay was built in tandem with GraphQL and has full-time staff working to improve it.</p>',
                },
                {
                  title: 'Not Just for Big Apps',
                  content:
                    '<p>If you’re the sort of team that believes in using Flow or TypeScript to move error detection to dev-time, then Relay is likely a good fit for you.</p><p>It’s probable you’d otherwise re-create a lot of Relay’s caching, and UI best practices independently.</p>',
                },
              ]}
            />
          </Container>

          <Container className="textSection" background="light">
            <h2>Proudly Used Elsewhere</h2>
            <h3>
              Relay was originally created for the React Native sections of the
              Facebook app, and it has been used adapted and improved by other
              teams internally and externally.
            </h3>
            <div>
              <div className="logosHomepage">{showcase}</div>
            </div>
            <div className="more-users">
              <a
                className="button"
                href={siteConfig.baseUrl + this.props.language + '/users'}>
                More Relay Users
              </a>
            </div>
          </Container>
        </div>
      </div>
    );
  }
}

module.exports = Index;
