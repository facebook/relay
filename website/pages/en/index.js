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
          <div className='logo'>
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
        <div className="mainContainer">
          <Container className="introSection" background="light">
            <GridBlock
              contents={[
                {
                  content:
                    "<p>Relay provides a structured way to build data-driven React applications safely.</p> <p>Relay does this by letting each React component declare the parts of a GraphQL schema it needs, and then Relay handles merging these fragments into single query and passing the response data to those components.</p><p>This allows you to have a declarative API for your app's data</p>",
                },
              ]}
            />
          </Container>

          <Container className="exampleSection">
            <div className="wrapperInner">
              <div className="radiusRight">
                <h2>Query Renderer</h2>
                <p>
                  When creating a new screen, you start with a <a href="/docs/en/query-renderer"><code>QueryRenderer</code></a>. 
                </p>
                <p>
                  A <code>QueryRenderer</code> is a React Component which is the root of a Relay component tree. It handles fetching your query, and uses the <code>render</code> prop to render the resulting data.
                </p>
                <p>
                  As React components, <code>QueryRenderers</code> can be rendered anywhere that a React component can be rendered, i.e. not just at the top level but *within* other components or containers. For example, you could use a <code>QueryRenderer</code> to lazily fetch additional data for a popover.
                </p>
              </div>

              <div className="radiusLeft">
              
                <pre>
                  <code>
                  {`
import React from "react"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"
import environment from "./lib/createRelayEnvironment"
import ArtistHeader from “./ArtistHeader” // Below

// You can usually have use one query renderer per page
// and it represents the root of a query
export const ArtistRenderer = ({ artistID }) => {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql\`
        query QueryRenderersArtistQuery($artistID: String!) {
          # The root field for the query
          artist(id: $artistID) {
            # A reference to your fragment components
            ...Artist_Header_artist
          }
        }
      \`}
      variables={{ artistID }}
      render={({error, props}) => {
          if (error) {
            return <div>{error.message}</div>;
          } else if (props) {
            return <Artist artist={props.artist} />
          }
          return <div>Loading</div>;
        }}
    />
  )
}
                  `}
                  </code>
                </pre>
              </div>

              <div>
                <h2>Fragment Container</h2>
                <p>
                  Step two is to render a tree of React components which includes <code>FragmentContainers</code>, <code>PaginationContainers</code> and <code>RefetchContainers</code>.
                </p>
                <p>
                  The most common are <code>FragmentContainers</code> which  does not directly fetch data, but instead declares a *specification* of the data needed for rendering a component. 
                </p>
                <p>
                  Relay will then guarantee that this data is available *before* rendering occurs.
                </p>
              </div>
              <div>
                <pre>
                  <code>
                  
                  {`
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { Link, Image, Name, Bio, View,} from "./views"

class ArtistHeader extends React.Component {
  render() {
    const { name, href, image, bio } = this.props.artist
    const imageUrl = image && image.url

    return (
      <Link href={href}>
        <Image imageUrl={imageUrl} />
        <View>
          <Name>{name}</Name>
          <Bio>{bio}</Bio>
        </View>
      </Link>
    )
  }
}

export default createFragmentContainer(
  Artist,
  graphql\`
    # When an Artist is requested, explicitly
    # expose these fields to only the above Component
    fragment ArtistItem_artist on Artist {
      href
      bio
      name
      image {
        url
      }
    }
  \`
)
                  `}
                  </code>
                </pre>
              </div>
            </div>
          </Container>

          <Container className='textSection graphqlSection' background="light">
            <h2>GraphQL Best Practices Baked In</h2>
            <h3>
              To get the most from Relay’s features, you’ll want your GraphQL server to conform to the Pagination and Global identiifier best practices.
            </h3>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: 'Fragments',
                  content: `<p>A GraphQL fragment is a way to name a sub-query inside a part of your GraphQL query.</p><p>Relay uses Fragments to  component to just the data it uses.</p><p>See the <a href=${siteConfig.baseUrl + 'docs/' + this.props.language + "/fragment-container"}>Fragment docs</a></p>`
                },
                {
                  title: 'Connections',
                  content: `<p>A GraphQL Connection is an opinionated list that can easily be paginated in any direction, and contains structure for rich relationship data.</p><p>Relay provides tools to make pagination best practices declarative. </p><p>See the <a href=${siteConfig.baseUrl + 'docs/' + this.props.language + "/graphql-server-specification.html#connections"}>Connections</a> docs</p>`
                }, 
                {
                  title: 'Node ID',
                  content: `<p>A Node ID is a globally unique id across your entire schema for every type, built using a GraphQL interface.</p><p>Relay uses thiis pattern to provide reliable cachinig, and make incrrementally updating data simple.</p><p><a href=${siteConfig.baseUrl + 'docs/' + this.props.language + "/graphql-server-specification.html#object-identification"}>See the Node ID docs</a></p>`
                }
              ]}
            />
          </Container>

          <Container className='textSection declarativeSection' background="light">
            <h2>Declarative Mutations</h2>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: 'Describe data changing',
                  content: '<p>The Relay mutation API lets you declaratively define the data which would mutate from a server change by user, and Relay will propate the changes.</p>'
                },
                {
                  title: 'Non-localised changes',
                  content: '<p>Due to the Node ID pattern, Relay can know all of the changed components for any mutation, automating prop updates</p>'
                }, 
                {
                  title: 'Optimised for UI',
                  content: '<p>The mutation API makes it trivial to do optimistic rendering, error handling and reverting when things don’t go as planned</p>'
                }
              ]}
            />
          </Container>

          <Container className='textSection aheadSection'>
            <h2>Ahead-of-time Safety</h2>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: 'Peace of Mind',
                  content: '<p>While you work on a Relay project, the Relay compiler will guide you to ensure project-wide consistency.</p>'
                },
                {
                  title: 'Runtime Optimised',
                  content: '<p>Relay pre-computes runtime lookups on the developer’s computer, not your users.</p>'
                }, 
                {
                  title: 'Isolated Interfaces',
                  content: '<p>Each React component using Relay gets unique Flow or TypeScript interfaces generated.</p>'
                }
              ]}
            />
          </Container>

          <Container className='textSection relaySection'>
            <h2>Can Relay Work For Me?</h2>
            <GridBlock
              layout="twoColumn"
              contents={[
                {
                  title: 'Adopt Incrementally',
                  content: '<p>If you already can render React components, you’re most of the way there. Relay requires a Babel plugin, and to also run the Relay Compiler.</p><p>You can use Relay out of the box with Create React App and Next.js.</p>'
                },
                {
                  title: 'Make Complexity Explicit',
                  content: '<p>Relay requires a bit more up-front setup and tools, in favour of supporting an architecture of isolated components which <a href="#">can scale</a> with your team and app complexity.</p>'
                }, 
                {
                  title: 'User Interface Platform',
                  content: '<p>Relay strives to offer a set of opinionated primtive React components, on which you can build any type of data-driven application.</p><p>Learn these principals once, then your projects spend more time working on business logic instead of pipelining data.</p>'
                },
                {
                  title: 'Not Just for Big Apps',
                  content: '<p>If you’re the sort of team that believes in using Flow or TypeScript to move error detection to dev-time, then Relay is likely a good fit for you.</p><p>It’s probable you’d otherwise re-create a lot of Relay’s caching, and UI best practices  independently.</p>'
                }
              ]}
            />
          </Container>

          <Container className='textSection builtSection' background="light">
            <h2>Built for Production</h2>
            <GridBlock
              layout="twoColumn"
              contents={[
                {
                  title: 'Used at Facebook Scale',
                  content: '<p>Relay is critical infrastructure in Facebook,  there are tens of thousands of components using it. Relay was built in tandem with GraphQL and has full-time staff working to improve it.</p>'
                },
                {
                  title: 'Open Source',
                  content: '<p>The Relay team have a lot to do. So, we rely on the community to help each other and if you encounter problems, you may need to get your hands dirty and help make improvements.</p>'
                }, 
              ]}
            />
          </Container>
          
          <Container className='textSection'>
            <h2>Proudly Used Elsewhere</h2>
            <h3>
            Relay was originally created for the React Native sections of the Facebook app, and it has been used adapted and improved by other teams internally and externally.
            </h3>
            <div className="logos">{showcase}</div>
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
