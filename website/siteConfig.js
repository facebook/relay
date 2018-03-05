/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const users = [
  {
    caption: 'Facebook',
    image: '/relay/img/logos/facebook.png',
    infoLink: 'https://code.facebook.com',
    pinned: true,
  },
  {
    caption: 'Oculus',
    image: '/relay/img/logos/oculus.png',
    infoLink: 'https://www.oculus.com/',
    pinned: true,
  },
  {
    caption: 'Artsy',
    image: '/relay/img/logos/artsy.png',
    infoLink: 'http://artsy.github.io/open-source/',
    pinned: true,
  },
  {
    caption: 'Cirrus CI',
    image: '/relay/img/logos/cirrus.png',
    infoLink: 'https://cirrus-ci.com/',
    pinned: false,
  },
  {
    caption: 'Friday',
    image: '/relay/img/logos/friday.png',
    infoLink: 'https://friday.work/',
    pinned: false,
  },
];

const siteConfig = {
  title: 'Relay',
  tagline: 'A JavaScript framework for building data-driven React applications',
  url: 'https://facebook.github.io',
  baseUrl: '/relay/',
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
  },
};

module.exports = siteConfig;
