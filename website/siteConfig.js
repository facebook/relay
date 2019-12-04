/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const users = [
  {
    caption: 'Facebook',
    image: '/img/logos/facebook.png',
    infoLink: 'https://code.facebook.com',
    pinned: true,
  },
  {
    caption: 'Oculus',
    image: '/img/logos/oculus.png',
    infoLink: 'https://www.oculus.com/',
    pinned: true,
  },
  {
    caption: 'Artsy',
    image: '/img/logos/artsy.png',
    infoLink: 'http://artsy.github.io/open-source/',
    pinned: true,
  },
  {
    caption: 'Lattice',
    image: '/img/logos/lattice_logo_full_color.png',
    infoLink: 'https://lattice.com/',
    pinned: false,
  },
  {
    caption: 'Cirrus CI',
    image: '/img/logos/cirrus.png',
    infoLink: 'https://cirrus-ci.com/',
    pinned: false,
  },
  {
    caption: 'Friday',
    image: '/img/logos/friday.png',
    infoLink: 'https://friday.work/',
    pinned: false,
  },
  {
    caption: 'Flexport',
    image: '/img/logos/flexport.png',
    infoLink: 'https://flexport.com',
    pinned: false,
  },
  {
    caption: '1stdibs',
    image: '/img/logos/1stdibs.png',
    infoLink: 'https://www.1stdibs.com/',
    pinned: false,
  },
  {
    caption: 'Parabol',
    image: '/img/logos/parabol.png',
    infoLink: 'https://www.parabol.co/',
    pinned: false,
  },
  {
    caption: 'Entria',
    image: '/img/logos/entria.png',
    infoLink: 'https://github.com/entria',
    pinned: false,
  },
  {
    caption: 'itDAGENE',
    image: '/img/logos/itdagene.png',
    infoLink: 'https://github.com/itdagene-ntnu/itdagene-webapp',
    pinned: false,
  },
  {
    caption: 'Kiwi.com',
    image: '/img/logos/kiwicom.png',
    infoLink: 'https://www.kiwi.com/',
    pinned: false,
  },
  {
    caption: 'Jusbrasil',
    image: '/img/logos/jusbrasil.png',
    infoLink: 'https://github.com/jusbrasil',
    pinned: false,
  },
  {
    caption: 'Up',
    image: '/img/logos/up.png',
    infoLink: 'https://up.com.au/',
    pinned: false,
  },
  {
    caption: 'AutoGuru',
    image: '/img/logos/autoguru.png',
    infoLink: 'https://www.autoguru.com.au/',
    pinned: false,
  },
  {
    caption: 'Foton',
    image: '/img/logos/foton.png',
    infoLink: 'https://fotontech.io',
    pinned: false,
  },
  {
    caption: 'M1 Finance',
    image: '/img/logos/m1finance.png',
    infoLink: 'https://www.m1finance.com/',
    pinned: false,
  },
  {
    caption: 'Bumped',
    image: '/img/logos/bumped.png',
    infoLink: 'https://bumped.com/',
    pinned: false,
  },
  {
    caption: 'Clubhouse',
    image: '/img/logos/clubhouse.png',
    infoLink: 'https://clubhouse.io/',
    pinned: false,
  },
  {
    caption: 'Habilelabs',
    image: '/img/logos/habilelabs.png',
    infoLink: 'http://www.habilelabs.io/',
    pinned: false,
  },
  {
    caption: 'Quanto',
    image: '/img/logos/quanto.png',
    infoLink: 'https://www.contaquanto.com.br/',
    pinned: false,
  },
  {
    caption: 'Butterfly Network',
    image: '/img/logos/butterfly.png',
    infoLink: 'https://www.butterflynetwork.com/',
    pinned: false,
  },
  {
    caption: 'Mindworking',
    image: '/img/logos/mindworking.png',
    infoLink: 'https://mindworking.eu/',
    pinned: false,
  },
];

const siteConfig = {
  title: 'Relay',
  tagline: 'A JavaScript framework for building data-driven React applications',
  url: 'https://relay.dev',
  baseUrl: '/',
  projectName: 'relay',
  users,
  editUrl: 'https://github.com/facebook/relay/edit/master/docs/',
  headerLinks: [
    {doc: 'introduction-to-relay', label: 'Docs'},
    {page: 'help', label: 'Support'},
    {
      href: 'https://github.com/facebook/relay',
      label: 'GitHub',
    },
    {languages: false},
  ],
  headerIcon: 'img/relay-white.svg',
  footerIcon: 'img/relay.svg',
  favicon: 'img/favicon.png',
  twitterImage: 'img/relay.png',
  colors: {
    primaryColor: '#f26b00',
    secondaryColor: '#f26b00',
    prismColor: 'rgba(242, 107, 0, 0.03)',
  },
  // See https://docusaurus.io/docs/search for more information about Aloglia
  // search
  algolia: {
    apiKey: '3d7d5825d50ea36bca0e6ad06c926f06',
    indexName: 'relay',
    algoliaOptions: {
      facetFilters: ['version:VERSION'],
    },
  },
  cleanUrl: true,
  scrollToTop: true,
  scrollToTopOptions: {
    zIndex: 100,
  },
  enableUpdateTime: true,
  enableUpdateBy: true,
  docsSideNavCollapsible: true,
  scripts: ['/js/redirect.js'],
  onPageNav: 'separate',
};

module.exports = siteConfig;
