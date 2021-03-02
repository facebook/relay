/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/* eslint-disable lint/no-value-import */
import Code from '../core/Code.js';
import Container from '../core/Container';
import GridBlock from '../core/GridBlock';
import useBaseUrl, {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import * as React from 'react';
/* eslint-enable lint/no-value-import */

function LoadQueryLink() {
  return (
    <a href={useBaseUrl('/docs/api-reference/load-query/')}>
      <code>loadQuery</code>
    </a>
  );
}

function UsePreloadedQueryLink() {
  return (
    <a href={useBaseUrl('/docs/api-reference/use-preloaded-query/')}>
      <code>usePreloadedQuery</code>
    </a>
  );
}

function QueriesLink() {
  return (
    <a href={useBaseUrl('/docs/guided-tour/rendering/queries/')}>Queries</a>
  );
}

function UseFragmentLink() {
  return (
    <a href={useBaseUrl('/docs/guided-tour/use-fragment/')}>
      <code>useFragment</code>
    </a>
  );
}

const HomeSplash = () => {
  const {siteConfig} = useDocusaurusContext();
  return (
    <div>
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="logo">
            <img src={useBaseUrl('img/relay-white.svg')} />
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
    </div>
  );
};

const Index = () => {
  const {siteConfig} = useDocusaurusContext();
  const {withBaseUrl} = useBaseUrlUtils();
  const showcase = siteConfig.customFields.users
    .filter(user => {
      return user.pinned;
    })
    .map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={withBaseUrl(user.image)} title={user.caption} />
          <div>
            <h6>{user.caption}</h6>
            <p>{user.description}</p>
          </div>
        </a>
      );
    });

  return (
    <div>
      <HomeSplash />
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
                content: (
                  <span>
                    <p>
                      Relay is built upon <em>locally</em> declaring data
                      dependencies for components. This means each component
                      declares <em>what</em> data that it needs, without
                      worrying about <em>how</em> to fetch it; Relay guarantees
                      that the data each component needs is fetched and
                      available.
                    </p>
                    <p>
                      This allows components and their data dependencies to be
                      modified{' '}
                      <b>
                        <em>quickly</em>
                      </b>{' '}
                      and in{' '}
                      <b>
                        <em>isolation</em>
                      </b>
                      , without needing to update other parts of the system or,
                      worrying about breaking other components
                    </p>
                  </span>
                ),
              },
              {
                title: 'Minimal round trips',
                content: (
                  <span>
                    <p>
                      Relay automatically aggregates the data requirements for
                      your entire application, so that they can be fetched in a
                      single GraphQL request.
                    </p>
                    <p>
                      Relay will handle all of the heavy lifting to ensure the
                      data declared by your components is fetched in the most
                      efficient way, for example by deduplicating identical
                      fields, fetching as early as possible, among other
                      optimizations.
                    </p>
                  </span>
                ),
              },
              {
                title: 'Automatic data consistency',
                content: (
                  <span>
                    <p>
                      Relay automatically keeps all of your components up to
                      date whenever data that affects them changes, and
                      efficiently update them only when strictly necessary.
                    </p>
                    <p>
                      Relay also supports executing GraphQL Mutations,
                      optionally with optimistic updates, and updates to local
                      data, while ensuring that visible data on the screen is
                      always kept up to date.
                    </p>
                  </span>
                ),
              },
            ]}
          />
        </Container>
        <Container className="exampleSection">
          <div className="wrapperInner">
            <div className="radiusRight">
              <h2>Fetching query data</h2>
              <p>
                The simplest way to fetch query data is to directly call{' '}
                <LoadQueryLink />.
              </p>
              <p>
                Later, you can read the data from the store in a functional
                React component by calling the <UsePreloadedQueryLink /> hook.
              </p>
              <p>
                Relay encourages you to call <LoadQueryLink /> in response to an
                event, such as when a user presses on a link to navigate to a
                particular page or presses a button. See the guided tour section
                on <QueriesLink /> for more.
              </p>
            </div>

            <div className="radiusLeft">
              <pre>
                <Code>
                  {`
// Artist.react.js
import React from "react";
import {
  EnvironmentProvider,
  loadQuery,
  graphql,
  usePreloadedQuery,
} from "react-relay";
import environment from "./environment";
import ArtistCard from "./ArtistCard";
import {LoadingIndicator, Name} from "./views";

const artistsQuery = graphql\`
  query ArtistQuery($artistID: String!) {
    artist(id: $artistID) {
      name
      ...ArtistDescription_artist
    }
  }
\`;
const artistsQueryReference = loadQuery(
  environment,
  artistsQuery,
  {artistId: "1"}
);

export default function ArtistPage() {
  return (
    <EnvironmentProvider environment={environment}>
      <React.Suspense fallback={<LoadingIndicator />}>
        <ArtistView />
      </React.Suspense>
    </EnvironmentProvider>
  )
}

function ArtistView() {
  const data = usePreloadedQuery(artistsQuery, artistsQueryReference);
  return <>
    <Name>{data?.artist?.name}</Name>
    {data?.artist && <ArtistCard artist={data?.artist} />}
  </>
}
`}
                </Code>
              </pre>
            </div>

            <div>
              <h2>Fragments</h2>
              <p>
                Step two is to render a tree of React components powered by
                Relay. Components use fragments to declare their data
                dependencies, and read data from the Relay store by calling{' '}
                <UseFragmentLink />.
              </p>
              <p>
                A fragment is a snippet of GraphQL that is tied to a GraphQL
                type (like <code>Artist</code>) and which specifies <i>what</i>{' '}
                data to read from an item of that type.
              </p>
              <p>
                <UseFragmentLink /> takes two parameters: a fragment literal and
                a fragment reference. A fragment reference specifies{' '}
                <i>which</i> entity to read that data from.
              </p>
              <p>
                Fragments cannot be fetched by themselves; instead, they must
                ultimately be included in a parent query. The Relay compiler
                will then ensure that the data dependencies declared in such
                fragments are fetched as part of that parent query.
              </p>
            </div>
            <div>
              <pre>
                <Code>
                  {`
// ArtistCard.react.js
import React from "react";
import {
  graphql,
  useFragment,
} from "react-relay";
import {Bio, Card, Link, Image, Name} from "./views";

export default function ArtistHeader(props) {
  const {href, image, bio} = useFragment(
    graphql\`
      fragment ArtistHeader_artist on Artist {
        href
        bio
        image {
          url
        }
      }
    \`,
    props.artist
  );
  const imageUrl = image && image.url;

  return (
    <Card>
      <Link href={href}>
        <Image imageUrl={imageUrl} />
        <Bio>{bio}</Bio>
      </Link>
    </Card>
  );
}
                    `}
                </Code>
              </pre>
            </div>
          </div>
        </Container>

        <Container className="textSection graphqlSection" background="light">
          <h2>GraphQL best practices baked in</h2>
          <h3>
            Relay applies and relies on GraphQL best practices. To get the most
            from Relay's features, you'll want your GraphQL server to conform to
            these standard practices.
          </h3>
          <GridBlock
            layout="threeColumn"
            contents={[
              {
                title: 'Fragments',
                content: (
                  <div>
                    <p>
                      A GraphQL{' '}
                      <a
                        href="https://graphql.org/learn/queries/#fragments"
                        target="_blank">
                        Fragment
                      </a>{' '}
                      is a reusable selection of fields for a given GraphQL
                      type. It can be composed by including it in other
                      Fragments, or including it as part of GraphQL Queries.
                    </p>
                    <p>
                      Relay uses Fragments to declare data requirements for
                      components, and compose data requirements together.
                    </p>
                    <p>
                      See the{' '}
                      <a href={useBaseUrl('/docs/guided-tour/')}>guided tour</a>
                    </p>
                  </div>
                ),
              },
              {
                title: 'Connections',
                content: (
                  <div>
                    <p>
                      GraphQL{' '}
                      <a
                        href="https://graphql.org/learn/pagination/#complete-connection-model"
                        target="_blank">
                        Connections
                      </a>{' '}
                      are a model for representing lists of data in GraphQL, so
                      that they can easily be paginated in any direction, as
                      well as to be able to encode rich relationship data.
                    </p>
                    <p>
                      GraphQL Connections are considered a best practice for{' '}
                      <a href="https://graphql.org/learn/pagination/">
                        Pagination in GraphQL
                      </a>
                      , and Relay provides first class support for these, as
                      long as your GraphQL server supports them.
                    </p>
                    <p>
                      See the{' '}
                      <a
                        href={useBaseUrl(
                          'docs/graphql-server-specification#connections',
                        )}>
                        Connections
                      </a>{' '}
                      docs
                    </p>
                  </div>
                ),
              },
              {
                title: 'Global Object Identification',
                content: (
                  <div>
                    <p>
                      Relay relies on{' '}
                      <a
                        href="https://graphql.org/learn/global-object-identification/"
                        target="_blank">
                        Global Object Identification
                      </a>{' '}
                      to provide reliable caching and refetching, and to make it
                      possible to automatically merge updates for objects.
                    </p>
                    <p>
                      Global Object Identification consists on providing
                      globally unique ids across your entire schema for every
                      type, built using the Node GraphQL interface.
                    </p>
                    <p>
                      <a
                        href={useBaseUrl(
                          'docs/graphql-server-specification#object-identification',
                        )}>
                        See the Object Identification docs
                      </a>
                    </p>
                  </div>
                ),
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
                content: (
                  <div>
                    <p>
                      Using GraphQL mutations, you can declaratively define and
                      request the data that will be affected by executing a
                      mutation in a <em>single round trip</em>, and Relay will
                      automatically merge and propagate those changes.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Automatic updates',
                content: (
                  <div>
                    <p>
                      Using Global Object Identification, Relay is capable of
                      automatically merging mutation updates for any affected
                      objects, and updating only the affected components.
                    </p>
                    <p>
                      For more complex cases where updates cannot automatically
                      be merged, Relay provides apis to manually update the
                      local Relay data in response to a mutation.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Designed for great UX',
                content: (
                  <div>
                    <p>
                      Relay's mutation API supports making optimistic updates to
                      show immediate feedback to users, as well as error
                      handling and automatically reverting changes when
                      mutations fail.
                    </p>
                  </div>
                ),
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
                content: (
                  <div>
                    <p>
                      While you work on a Relay project, the Relay compiler will
                      guide you to ensure project-wide consistency and
                      correctness against your GraphQL schema.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Optimized runtime',
                content: (
                  <div>
                    <p>
                      Relay pre-computes a lot of work (like processing and
                      optimizing queries) ahead of time, during build time, in
                      order to make the runtime on the browser or device as
                      efficient as possible.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Type safety',
                content: (
                  <div>
                    <p>
                      Relay generates Flow or TypeScript types for each of your
                      React components that use Relay, which represent the data
                      that each component receives, so you can make changes more
                      quickly and safely while knowing that correctness is
                      guaranteed.
                    </p>
                  </div>
                ),
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
                content: (
                  <div>
                    <p>
                      If you already can render React components, you're most of
                      the way there. Relay requires a Babel plugin, and to also
                      run the Relay Compiler.
                    </p>
                    <p>
                      You can use Relay out of the box with Create React App and
                      Next.js.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Make Complexity Explicit',
                content: (
                  <div>
                    <p>
                      Relay requires a bit more up-front setup and tools, in
                      favour of supporting an architecture of isolated
                      components which can scale with your team and app
                      complexity.
                    </p>
                    <p>
                      Learn these principles once, then spend more time working
                      on business logic instead of pipelining data.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Used at Facebook Scale',
                content: (
                  <div>
                    <p>
                      Relay is critical infrastructure in Facebook, there are
                      tens of thousands of components using it. Relay was built
                      in tandem with GraphQL and has full-time staff working to
                      improve it.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Not Just for Big Apps',
                content: (
                  <div>
                    <p>
                      If you're the sort of team that believes in using Flow or
                      TypeScript to move error detection to dev-time, then Relay
                      is likely a good fit for you.
                    </p>
                    <p>
                      It's probable you'd otherwise re-create a lot of Relay's
                      caching, and UI best practices independently.
                    </p>
                  </div>
                ),
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
            <a className="button" href={useBaseUrl('users')}>
              More Relay Users
            </a>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default props => (
  <Layout>
    <Index {...props} />
  </Layout>
);
