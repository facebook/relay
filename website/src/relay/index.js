/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const React = require('React');
const Site = require('Site');
const SiteData = require('SiteData');

const index = React.createClass({
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

          <hr className="home-divider" />

          <section className="buttons-unit">
            <a className="button" href="docs/getting-started.html">
              Get Started
            </a>
            <a
              className="button"
              href={'https://github.com/facebook/relay/releases/tag/v' + SiteData.version}>
              Download
            </a>
          </section>

          <hr className="home-divider" />

          <section className="home-section">
            <section id="examples">
              <div className="example">
                <h3>A simple list</h3>
                <p>
                  Relay lets each view declare its own data requirements in the
                  form of a <strong>GraphQL query fragment</strong>. Here, each
                  tea in this list of teas declares that it needs a{' '}
                  <code>name</code> and a <code>steepingTime</code> to be able
                  to render. Just like we compose React components to build an
                  app, we <strong>compose query fragments</strong> together to
                  build a single query at the root of the app.
                </p>
                <iframe
                  height={396}
                  src="prototyping/playground.html#noCache&source=class%20Tea%20extends%20React.Component%20%7B%0A%20%20render()%20%7B%0A%20%20%20%20var%20%7Bname%2C%20steepingTime%7D%20%3D%20this.props.tea%3B%0A%20%20%20%20return%20(%0A%20%20%20%20%20%20%3Cli%20key%3D%7Bname%7D%3E%0A%20%20%20%20%20%20%20%20%7Bname%7D%20(%3Cem%3E%7BsteepingTime%7D%20min%3C%2Fem%3E)%0A%20%20%20%20%20%20%3C%2Fli%3E%0A%20%20%20%20)%3B%0A%20%20%7D%0A%7D%0ATea%20%3D%20Relay.createContainer(Tea%2C%20%7B%0A%20%20fragments%3A%20%7B%0A%20%20%20%20tea%3A%20()%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20fragment%20on%20Tea%20%7B%0A%20%20%20%20%20%20%20%20name%2C%0A%20%20%20%20%20%20%20%20steepingTime%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%2C%0A%7D)%3B%0A%0Aclass%20TeaStore%20extends%20React.Component%20%7B%0A%20%20render()%20%7B%0A%20%20%20%20return%20%3Cul%3E%0A%20%20%20%20%20%20%7Bthis.props.store.teas.map(%0A%20%20%20%20%20%20%20%20tea%20%3D%3E%20%3CTea%20tea%3D%7Btea%7D%20%2F%3E%0A%20%20%20%20%20%20)%7D%0A%20%20%20%20%3C%2Ful%3E%3B%0A%20%20%7D%0A%7D%0ATeaStore%20%3D%20Relay.createContainer(TeaStore%2C%20%7B%0A%20%20fragments%3A%20%7B%0A%20%20%20%20store%3A%20()%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20fragment%20on%20Store%20%7B%0A%20%20%20%20%20%20%20%20teas%20%7B%20%24%7BTea.getFragment('tea')%7D%20%7D%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%2C%0A%7D)%3B%0A%0Aclass%20TeaHomeRoute%20extends%20Relay.Route%20%7B%0A%20%20static%20routeName%20%3D%20'Home'%3B%0A%20%20static%20queries%20%3D%20%7B%0A%20%20%20%20store%3A%20(Component)%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20query%20TeaStoreQuery%20%7B%0A%20%20%20%20%20%20%20%20store%20%7B%20%24%7BComponent.getFragment('store')%7D%20%7D%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%3B%0A%7D%0A%0AReactDOM.render(%0A%20%20%3CRelay.RootContainer%0A%20%20%20%20Component%3D%7BTeaStore%7D%0A%20%20%20%20route%3D%7Bnew%20TeaHomeRoute()%7D%0A%20%20%2F%3E%2C%0A%20%20mountNode%0A)%3B&schema=import%20%7B%0A%20%20GraphQLInt%2C%0A%20%20GraphQLList%2C%0A%20%20GraphQLObjectType%2C%0A%20%20GraphQLSchema%2C%0A%20%20GraphQLString%2C%0A%7D%20from%20'graphql'%3B%0A%0Aconst%20STORE%20%3D%20%7B%0A%20%20teas%3A%20%5B%0A%20%20%20%20%7Bname%3A%20'Earl%20Grey%20Blue%20Star'%2C%20steepingTime%3A%205%7D%2C%0A%20%20%20%20%7Bname%3A%20'Milk%20Oolong'%2C%20steepingTime%3A%203%7D%2C%0A%20%20%20%20%7Bname%3A%20'Gunpowder%20Golden%20Temple'%2C%20steepingTime%3A%203%7D%2C%0A%20%20%20%20%7Bname%3A%20'Assam%20Hatimara'%2C%20steepingTime%3A%205%7D%2C%0A%20%20%20%20%7Bname%3A%20'Bancha'%2C%20steepingTime%3A%202%7D%2C%0A%20%20%20%20%7Bname%3A%20'Ceylon%20New%20Vithanakande'%2C%20steepingTime%3A%205%7D%2C%0A%20%20%20%20%7Bname%3A%20'Golden%20Tip%20Yunnan'%2C%20steepingTime%3A%205%7D%2C%0A%20%20%20%20%7Bname%3A%20'Jasmine%20Phoenix%20Pearls'%2C%20steepingTime%3A%203%7D%2C%0A%20%20%20%20%7Bname%3A%20'Kenya%20Milima'%2C%20steepingTime%3A%205%7D%2C%0A%20%20%20%20%7Bname%3A%20'Pu%20Erh%20First%20Grade'%2C%20steepingTime%3A%204%7D%2C%0A%20%20%20%20%7Bname%3A%20'Sencha%20Makoto'%2C%20steepingTime%3A%202%7D%2C%0A%20%20%5D%2C%0A%7D%3B%0A%0Avar%20TeaType%20%3D%20new%20GraphQLObjectType(%7B%0A%20%20name%3A%20'Tea'%2C%0A%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20name%3A%20%7Btype%3A%20GraphQLString%7D%2C%0A%20%20%20%20steepingTime%3A%20%7Btype%3A%20GraphQLInt%7D%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A%0Avar%20StoreType%20%3D%20new%20GraphQLObjectType(%7B%0A%20%20name%3A%20'Store'%2C%0A%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20teas%3A%20%7Btype%3A%20new%20GraphQLList(TeaType)%7D%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A%0Aexport%20default%20new%20GraphQLSchema(%7B%0A%20%20query%3A%20new%20GraphQLObjectType(%7B%0A%20%20%20%20name%3A%20'Query'%2C%0A%20%20%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20%20%20store%3A%20%7B%0A%20%20%20%20%20%20%20%20type%3A%20StoreType%2C%0A%20%20%20%20%20%20%20%20resolve%3A%20()%20%3D%3E%20STORE%2C%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%7D)%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A"
                  width="100%"
                />
              </div>
              <div className="example">
                <h3>A simple parameterization</h3>
                <p>
                  Relay query fragments can be parameterized using{' '}
                  <strong>variables</strong> in GraphQL <strong>calls</strong>.
                  This enables mechanics like pagination, filtering, sorting,
                  and more.
                </p>
                <iframe
                  height={396}
                  src="prototyping/playground.html#noCache&source=class%20Score%20extends%20React.Component%20%7B%0A%20%20render()%20%7B%0A%20%20%20%20var%20%7Binitials%2C%20score%7D%20%3D%20this.props.score%3B%0A%20%20%20%20return%20(%0A%20%20%20%20%20%20%3Cli%20key%3D%7Binitials%7D%3E%0A%20%20%20%20%20%20%20%20%3Cstrong%3E%7Binitials%7D%3C%2Fstrong%3E%20%7Bscore%7D%0A%20%20%20%20%20%20%3C%2Fli%3E%0A%20%20%20%20)%3B%0A%20%20%7D%0A%7D%0AScore%20%3D%20Relay.createContainer(Score%2C%20%7B%0A%20%20fragments%3A%20%7B%0A%20%20%20%20score%3A%20()%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20fragment%20on%20Score%20%7B%0A%20%20%20%20%20%20%20%20initials%2C%0A%20%20%20%20%20%20%20%20score%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%2C%0A%7D)%3B%0A%0Aclass%20Game%20extends%20React.Component%20%7B%0A%20%20_handleCountChange%20%3D%20(e)%20%3D%3E%20%7B%0A%20%20%20%20this.props.relay.setVariables(%7B%0A%20%20%20%20%20%20numToShow%3A%20e.target.value%0A%20%20%20%20%20%20%20%20%3F%20parseInt(e.target.value%2C%2010)%0A%20%20%20%20%20%20%20%20%3A%200%2C%0A%20%20%20%20%7D)%3B%0A%20%20%7D%0A%20%20_handleSortChange%20%3D%20(e)%20%3D%3E%20%7B%0A%20%20%20%20this.props.relay.setVariables(%7B%0A%20%20%20%20%20%20sortDirection%3A%20e.target.value%2C%0A%20%20%20%20%7D)%3B%0A%20%20%7D%0A%20%20render()%20%7B%0A%20%20%20%20var%20%7Bscores%7D%20%3D%20this.props.game%3B%0A%20%20%20%20var%20%7B%0A%20%20%20%20%20%20numToShow%2C%0A%20%20%20%20%20%20sortDirection%2C%0A%20%20%20%20%7D%20%3D%20this.props.relay.variables%3B%0A%20%20%20%20return%20(%0A%20%20%20%20%20%20%3Cdiv%3E%0A%20%20%20%20%20%20%20%20%3Ch1%3EHigh%20Scores%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%3Cselect%0A%20%20%20%20%20%20%20%20%20%20defaultValue%3D%7BsortDirection%7D%0A%20%20%20%20%20%20%20%20%20%20onChange%3D%7Bthis._handleSortChange%7D%3E%0A%20%20%20%20%20%20%20%20%20%20%3Coption%20value%3D%22asc%22%3EBottom%3C%2Foption%3E%0A%20%20%20%20%20%20%20%20%20%20%3Coption%20value%3D%22desc%22%3ETop%3C%2Foption%3E%0A%20%20%20%20%20%20%20%20%3C%2Fselect%3E%7B'%20'%7D%0A%20%20%20%20%20%20%20%20%3Cinput%0A%20%20%20%20%20%20%20%20%20%20onChange%3D%7Bthis._handleCountChange%7D%0A%20%20%20%20%20%20%20%20%20%20min%3D%220%22%0A%20%20%20%20%20%20%20%20%20%20style%3D%7B%7Bwidth%3A%2044%7D%7D%0A%20%20%20%20%20%20%20%20%20%20type%3D%22number%22%0A%20%20%20%20%20%20%20%20%20%20value%3D%7BnumToShow%7D%0A%20%20%20%20%20%20%20%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cul%3E%0A%20%20%20%20%20%20%20%20%20%20%7Bscores.map(%0A%20%20%20%20%20%20%20%20%20%20%20%20score%20%3D%3E%20%3CScore%20score%3D%7Bscore%7D%20%2F%3E%0A%20%20%20%20%20%20%20%20%20%20)%7D%0A%20%20%20%20%20%20%20%20%3C%2Ful%3E%0A%20%20%20%20%20%20%3C%2Fdiv%3E%0A%20%20%20%20)%3B%0A%20%20%7D%0A%7D%0AGame%20%3D%20Relay.createContainer(Game%2C%20%7B%0A%20%20initialVariables%3A%20%7B%0A%20%20%20%20numToShow%3A%2010%2C%0A%20%20%20%20sortDirection%3A%20'desc'%2C%0A%20%20%7D%2C%0A%20%20fragments%3A%20%7B%0A%20%20%20%20game%3A%20()%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20fragment%20on%20Game%20%7B%0A%20%20%20%20%20%20%20%20scores(%0A%20%20%20%20%20%20%20%20%20%20numToShow%3A%20%24numToShow%2C%0A%20%20%20%20%20%20%20%20%20%20sortDirection%3A%20%24sortDirection%0A%20%20%20%20%20%20%20%20)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%24%7BScore.getFragment('score')%7D%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%2C%0A%7D)%3B%0A%0Aclass%20GameHomeRoute%20extends%20Relay.Route%20%7B%0A%20%20static%20routeName%20%3D%20'Home'%3B%0A%20%20static%20queries%20%3D%20%7B%0A%20%20%20%20game%3A%20(Component)%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20query%20GameQuery%20%7B%0A%20%20%20%20%20%20%20%20game%20%7B%20%24%7BComponent.getFragment('game')%7D%20%7D%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%3B%0A%7D%0A%0AReactDOM.render(%0A%20%20%3CRelay.RootContainer%0A%20%20%20%20Component%3D%7BGame%7D%0A%20%20%20%20route%3D%7Bnew%20GameHomeRoute()%7D%0A%20%20%2F%3E%2C%0A%20%20mountNode%0A)%3B&schema=import%20%7B%0A%20%20GraphQLInt%2C%0A%20%20GraphQLList%2C%0A%20%20GraphQLObjectType%2C%0A%20%20GraphQLSchema%2C%0A%20%20GraphQLString%2C%0A%7D%20from%20'graphql'%3B%0A%0Aconst%20GAME%20%3D%20%7B%0A%20%20scores%3A%20%5B%0A%20%20%20%20%7Binitials%3A%20'SDL'%2C%20score%3A%20134812%7D%2C%0A%20%20%20%20%7Binitials%3A%20'_TY'%2C%20score%3A%20897243%7D%2C%0A%20%20%20%20%7Binitials%3A%20'AAA'%2C%20score%3A%20348234%7D%2C%0A%20%20%20%20%7Binitials%3A%20'_LK'%2C%20score%3A%20903244%7D%2C%0A%20%20%20%20%7Binitials%3A%20'_JK'%2C%20score%3A%20890324%7D%2C%0A%20%20%20%20%7Binitials%3A%20'GLH'%2C%20score%3A%20248721%7D%2C%0A%20%20%20%20%7Binitials%3A%20'_JS'%2C%20score%3A%20257893%7D%2C%0A%20%20%20%20%7Binitials%3A%20'Y~Z'%2C%20score%3A%20752323%7D%2C%0A%20%20%20%20%7Binitials%3A%20'J%2FD'%2C%20score%3A%20982354%7D%2C%0A%20%20%20%20%7Binitials%3A%20'L!B'%2C%20score%3A%20252432%7D%2C%0A%20%20%20%20%7Binitials%3A%20'N*S'%2C%20score%3A%20982523%7D%2C%0A%20%20%20%20%7Binitials%3A%20'*DS'%2C%20score%3A%20278347%7D%2C%0A%20%20%20%20%7Binitials%3A%20'%2BAZ'%2C%20score%3A%20178954%7D%2C%0A%20%20%20%20%7Binitials%3A%20'FC%3B'%2C%20score%3A%20897252%7D%2C%0A%20%20%20%20%7Binitials%3A%20'%23BK'%2C%20score%3A%20547840%7D%2C%0A%20%20%5D%2C%0A%7D%3B%0A%0Avar%20ScoreType%20%3D%20new%20GraphQLObjectType(%7B%0A%20%20name%3A%20'Score'%2C%0A%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20initials%3A%20%7Btype%3A%20GraphQLString%7D%2C%0A%20%20%20%20score%3A%20%7Btype%3A%20GraphQLInt%7D%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A%0Avar%20GameType%20%3D%20new%20GraphQLObjectType(%7B%0A%20%20name%3A%20'Game'%2C%0A%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20scores%3A%20%7B%0A%20%20%20%20%20%20args%3A%20%7B%0A%20%20%20%20%20%20%20%20numToShow%3A%20%7Btype%3A%20GraphQLInt%7D%2C%0A%20%20%20%20%20%20%20%20sortDirection%3A%20%7Btype%3A%20GraphQLString%7D%2C%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20type%3A%20new%20GraphQLList(ScoreType)%2C%0A%20%20%20%20%20%20resolve%3A%20(game%2C%20%7BnumToShow%2C%20sortDirection%7D)%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20if%20(numToShow%20%3D%3D%20null)%20%7B%0A%20%20%20%20%20%20%20%20%20%20numToShow%20%3D%20game.scores.length%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20var%20sortMult%20%3D%20sortDirection%20%3D%3D%3D%20'asc'%20%3F%201%20%3A%20-1%3B%0A%20%20%20%20%20%20%20%20return%20game.scores%0A%20%20%20%20%20%20%20%20%20%20.sort((a%2C%20b)%20%3D%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20sortMult%20*%20(a.score%20-%20b.score)%0A%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20.slice(0%2C%20numToShow)%3B%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%7D%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A%0Aexport%20default%20new%20GraphQLSchema(%7B%0A%20%20query%3A%20new%20GraphQLObjectType(%7B%0A%20%20%20%20name%3A%20'Query'%2C%0A%20%20%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20%20%20game%3A%20%7B%0A%20%20%20%20%20%20%20%20type%3A%20GameType%2C%0A%20%20%20%20%20%20%20%20resolve%3A%20()%20%3D%3E%20GAME%2C%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%7D)%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A"
                  width="100%"
                />
              </div>
              <div className="example">
                <h3>A simple mutation</h3>
                <p>
                  Use Relay to change the world through the use of GraphQL
                  mutations. Given a set of <strong>query fragments</strong>,
                  a <strong>mutation</strong>, a query that represents <strong>
                  all parts of the world that might change</strong> as a result
                  of this mutation (the &lsquo;fat query&rsquo;), and a <strong>
                  set of behaviors to exhibit</strong> when the server responds
                  (the &lsquo;query configs&rsquo;), Relay will ensure that all
                  of the data necessary to perform the mutation has been
                  fetched, and that your client-side data stays in sync with the
                  server after the mutation.
                </p>
                <iframe
                  height={396}
                  src="prototyping/playground.html#noCache&source=class%20CreateCommentMutation%20extends%20Relay.Mutation%20%7B%0A%20%20static%20fragments%20%3D%20%7B%0A%20%20%20%20story%3A%20()%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20fragment%20on%20Story%20%7B%20id%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%3B%0A%20%20getMutation()%20%7B%0A%20%20%20%20return%20Relay.QL%60%0A%20%20%20%20%20%20mutation%7B%20createComment%20%7D%0A%20%20%20%20%60%3B%0A%20%20%7D%0A%20%20getFatQuery()%20%7B%0A%20%20%20%20return%20Relay.QL%60%0A%20%20%20%20%20%20fragment%20on%20CreateCommentPayload%20%7B%20%0A%20%20%20%20%20%20%20%20story%20%7B%20comments%20%7D%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%3B%0A%20%20%7D%0A%20%20getConfigs()%20%7B%0A%20%20%20%20return%20%5B%7B%0A%20%20%20%20%20%20type%3A%20'FIELDS_CHANGE'%2C%0A%20%20%20%20%20%20fieldIDs%3A%20%7B%20story%3A%20this.props.story.id%20%7D%2C%0A%20%20%20%20%7D%5D%3B%0A%20%20%7D%0A%20%20getVariables()%20%7B%0A%20%20%20%20return%20%7B%20text%3A%20this.props.text%20%7D%3B%0A%20%20%7D%0A%7D%0A%0Aclass%20Comment%20extends%20React.Component%20%7B%0A%20%20render()%20%7B%0A%20%20%20%20var%20%7Bid%2C%20text%7D%20%3D%20this.props.comment%3B%0A%20%20%20%20return%20%3Cli%20key%3D%7Bid%7D%3E%7Btext%7D%3C%2Fli%3E%3B%0A%20%20%7D%0A%7D%0AComment%20%3D%20Relay.createContainer(Comment%2C%20%7B%0A%20%20fragments%3A%20%7B%0A%20%20%20%20comment%3A%20()%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20fragment%20on%20Comment%20%7B%0A%20%20%20%20%20%20%20%20id%2C%0A%20%20%20%20%20%20%20%20text%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%2C%0A%7D)%3B%0A%0Aclass%20Story%20extends%20React.Component%20%7B%0A%20%20_handleSubmit%20%3D%20(e)%20%3D%3E%20%7B%0A%20%20%20%20e.preventDefault()%3B%0A%20%20%20%20Relay.Store.update(%0A%20%20%20%20%20%20new%20CreateCommentMutation(%7B%0A%20%20%20%20%20%20%20%20story%3A%20this.props.story%2C%0A%20%20%20%20%20%20%20%20text%3A%20this.refs.newCommentInput.value%2C%0A%20%20%20%20%20%20%7D)%0A%20%20%20%20)%3B%0A%20%20%20%20this.refs.newCommentInput.value%20%3D%20''%3B%0A%20%20%7D%0A%20%20render()%20%7B%0A%20%20%20%20var%20%7Bcomments%7D%20%3D%20this.props.story%3B%0A%20%20%20%20return%20(%0A%20%20%20%20%20%20%3Cform%20onSubmit%3D%7Bthis._handleSubmit%7D%3E%0A%20%20%20%20%20%20%20%20%3Ch1%3EBreaking%20News%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%3Cp%3EThe%20peanut%20is%20neither%20a%20pea%20nor%20a%20nut.%3C%2Fp%3E%0A%20%20%20%20%20%20%20%20%3Cstrong%3EDiscuss%3A%3C%2Fstrong%3E%0A%20%20%20%20%20%20%20%20%3Cul%3E%0A%20%20%20%20%20%20%20%20%20%20%7Bcomments.map(%0A%20%20%20%20%20%20%20%20%20%20%20%20comment%20%3D%3E%20%3CComment%20comment%3D%7Bcomment%7D%20%2F%3E%0A%20%20%20%20%20%20%20%20%20%20)%7D%0A%20%20%20%20%20%20%20%20%3C%2Ful%3E%0A%20%20%20%20%20%20%20%20%3Cinput%0A%20%20%20%20%20%20%20%20%20%20placeholder%3D%22Weigh%20in%26hellip%3B%22%0A%20%20%20%20%20%20%20%20%20%20ref%3D%22newCommentInput%22%0A%20%20%20%20%20%20%20%20%20%20type%3D%22text%22%0A%20%20%20%20%20%20%20%20%2F%3E%0A%20%20%20%20%20%20%3C%2Fform%3E%0A%20%20%20%20)%3B%0A%20%20%7D%0A%7D%0AStory%20%3D%20Relay.createContainer(Story%2C%20%7B%0A%20%20fragments%3A%20%7B%0A%20%20%20%20story%3A%20()%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20fragment%20on%20Story%20%7B%0A%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20%24%7BComment.getFragment('comment')%7D%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%24%7BCreateCommentMutation.getFragment('story')%7D%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%2C%0A%7D)%3B%0A%0Aclass%20StoryHomeRoute%20extends%20Relay.Route%20%7B%0A%20%20static%20routeName%20%3D%20'Home'%3B%0A%20%20static%20queries%20%3D%20%7B%0A%20%20%20%20story%3A%20(Component)%20%3D%3E%20Relay.QL%60%0A%20%20%20%20%20%20query%20StoryQuery%20%7B%0A%20%20%20%20%20%20%20%20story%20%7B%20%24%7BComponent.getFragment('story')%7D%20%7D%2C%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%60%2C%0A%20%20%7D%3B%0A%7D%0A%0AReactDOM.render(%0A%20%20%3CRelay.RootContainer%0A%20%20%20%20Component%3D%7BStory%7D%0A%20%20%20%20route%3D%7Bnew%20StoryHomeRoute()%7D%0A%20%20%2F%3E%2C%0A%20%20mountNode%0A)%3B&schema=import%20%7B%0A%20%20GraphQLID%2C%0A%20%20GraphQLList%2C%0A%20%20GraphQLNonNull%2C%0A%20%20GraphQLObjectType%2C%0A%20%20GraphQLSchema%2C%0A%20%20GraphQLString%2C%0A%7D%20from%20'graphql'%3B%0Aimport%20%7B%0A%20%20mutationWithClientMutationId%2C%0A%7D%20from%20'graphql-relay'%3B%0A%0Aconst%20STORY%20%3D%20%7B%0A%20%20comments%3A%20%5B%5D%2C%0A%20%20id%3A%20'42'%2C%0A%7D%3B%0A%0Avar%20CommentType%20%3D%20new%20GraphQLObjectType(%7B%0A%20%20name%3A%20'Comment'%2C%0A%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20id%3A%20%7Btype%3A%20GraphQLID%7D%2C%0A%20%20%20%20text%3A%20%7Btype%3A%20GraphQLString%7D%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A%0Avar%20StoryType%20%3D%20new%20GraphQLObjectType(%7B%0A%20%20name%3A%20'Story'%2C%0A%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20comments%3A%20%7B%20type%3A%20new%20GraphQLList(CommentType)%20%7D%2C%0A%20%20%20%20id%3A%20%7B%20type%3A%20GraphQLString%20%7D%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A%0Avar%20CreateCommentMutation%20%3D%20mutationWithClientMutationId(%7B%0A%20%20name%3A%20'CreateComment'%2C%0A%20%20inputFields%3A%20%7B%0A%20%20%20%20text%3A%20%7B%20type%3A%20new%20GraphQLNonNull(GraphQLString)%20%7D%2C%0A%20%20%7D%2C%0A%20%20outputFields%3A%20%7B%0A%20%20%20%20story%3A%20%7B%0A%20%20%20%20%20%20type%3A%20StoryType%2C%0A%20%20%20%20%20%20resolve%3A%20()%20%3D%3E%20STORY%2C%0A%20%20%20%20%7D%2C%0A%20%20%7D%2C%0A%20%20mutateAndGetPayload%3A%20(%7Btext%7D)%20%3D%3E%20%7B%0A%20%20%20%20var%20newComment%20%3D%20%7B%0A%20%20%20%20%20%20id%3A%20STORY.comments.length%2C%0A%20%20%20%20%20%20text%2C%0A%20%20%20%20%7D%3B%0A%20%20%20%20STORY.comments.push(newComment)%3B%0A%20%20%20%20return%20newComment%3B%0A%20%20%7D%2C%0A%7D)%3B%0A%0Aexport%20default%20new%20GraphQLSchema(%7B%0A%20%20query%3A%20new%20GraphQLObjectType(%7B%0A%20%20%20%20name%3A%20'Query'%2C%0A%20%20%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20%20%20story%3A%20%7B%0A%20%20%20%20%20%20%20%20type%3A%20StoryType%2C%0A%20%20%20%20%20%20%20%20resolve%3A%20()%20%3D%3E%20STORY%2C%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%7D)%2C%0A%20%20%7D)%2C%0A%20%20mutation%3A%20new%20GraphQLObjectType(%7B%0A%20%20%20%20name%3A%20'Mutation'%2C%0A%20%20%20%20fields%3A%20()%20%3D%3E%20(%7B%0A%20%20%20%20%20%20createComment%3A%20CreateCommentMutation%2C%0A%20%20%20%20%7D)%2C%0A%20%20%7D)%2C%0A%7D)%3B%0A"
                  width="100%"
                />
              </div>
            </section>
          </section>

          <hr className="home-divider" />

          <section className="buttons-unit">
            <a className="button" href="docs/getting-started.html">
              Get Started
            </a>
            <a
              className="button"
              href={'https://github.com/facebook/relay/releases/tag/v' + SiteData.version}>
              Download
            </a>
          </section>
        </section>
      </Site>
    );
  }
});

module.exports = index;
