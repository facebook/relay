/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const versions = require('./versions.json');

const {fbContent} = require('internaldocs-fb-helpers');

module.exports = {
  title: 'Relay',
  tagline: 'The production-ready GraphQL client for React.',
  url: 'https://relay.dev',
  baseUrl: '/',
  projectName: 'relay',
  scripts: ['/js/redirect.js'],
  favicon: 'img/favicon.png',
  customFields: {
    users: [
      {
        caption: '1stdibs',
        image: '/img/logos/1stdibs.png',
        infoLink: 'https://www.1stdibs.com/',
        pinned: true,
        description: 'Used on 1stdibs.com',
      },
      {
        caption: 'Artsy',
        image: '/img/logos/artsy.png',
        infoLink: 'http://artsy.github.io/open-source/',
        pinned: true,
        description: 'Used on artsy.net, and the React Native iOS app, Eigen.',
      },
      {
        caption: 'Entria',
        image: '/img/logos/entria.png',
        infoLink: 'https://github.com/entria',
        pinned: true,
        description: 'Powers feedback.house',
      },
      {
        caption: 'Facebook',
        image: '/img/logos/facebook.png',
        infoLink: 'https://code.facebook.com',
        pinned: true,
        description:
          'Used on facebook.com, and in the React Native mobile app.',
      },
      {
        caption: 'Oculus',
        image: '/img/logos/oculus.png',
        infoLink: 'https://www.oculus.com/',
        pinned: true,
        description:
          'Used on oculus.com, Oculus Home in VR, and the React Native Oculus companion app.',
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
        caption: 'Parabol',
        image: '/img/logos/parabol.png',
        infoLink: 'https://www.parabol.co/',
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
        pinned: true,
        description: 'Used at autoguru.com.au, and affiliates',
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
      {
        caption: 'domonda',
        image: '/img/logos/domonda.png',
        infoLink: 'https://domonda.com/',
        pinned: false,
      },
      {
        caption: 'SwissDev JavaScript Jobs',
        image: '/img/logos/swissdev-javascript-jobs.png',
        infoLink: 'https://swissdevjobs.ch/jobs/JavaScript/All',
        pinned: false,
      },
    ],
  },
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onDuplicateRoutes: 'throw',
  presets: [
    [
      require.resolve('docusaurus-plugin-internaldocs-fb/docusaurus-preset'),
      {
        docs: {
          showLastUpdateAuthor: fbContent({
            internal: false,
            external: true,
          }),
          showLastUpdateTime: fbContent({
            internal: false,
            external: true,
          }),
          editUrl:
            'https://github.com/facebook/relay/edit/master/website-v2/docs/',
          path: './docs',
          sidebarPath: require.resolve('./sidebars.js'),
          lastVersion: fbContent({
            internal: 'current',
            external: versions[0],
          }),
        },
        blog: {},
        theme: {
          customCss: [
            '../src/css/docusaurus-1.css',
            '../src/css/prism.css',
            '../src/css/customTheme.css',
            '../src/css/custom.css',
          ],
        },
      },
    ],
  ],
  plugins: [],
  themeConfig: {
    navbar: {
      title: 'Relay',
      style: 'primary',
      hideOnScroll: false,
      items: [
        {
          to: 'docs/',
          label: 'Docs',
          position: 'left',
        },
        {
          to: 'blog/',
          label: 'Blog',
          position: 'left',
        },
        {
          to: '/help',
          label: 'Help',
          position: 'left',
        },
        {
          href: 'https://github.com/facebook/relay',
          label: 'GitHub',
          position: 'left',
        },
        {
          label: 'Version',
          to: 'docs',
          position: 'right',
          items: [
            ...fbContent({
              internal: [
                {
                  label: 'Current',
                  to: 'docs/',
                  activeBaseRegex: `docs/(?!${versions.join('|')})`,
                },
              ],
              external: [],
            }),
            {
              label: 'v10.1.3',
              to: fbContent({
                internal: 'docs/v10.1.3/',
                external: 'docs/',
              }),
              activeBaseRegex: fbContent({
                internal: undefined,
                external: `docs/(?!${versions.concat('next').join('|')})`,
              }),
            },
            {
              label: 'v10.1.2',
              to: 'docs/v10.1.2/',
            },
            {
              label: 'v10.1.1',
              to: 'docs/v10.1.1/',
            },
            {
              label: 'v10.1.0',
              to: 'docs/v10.1.0/',
            },
            {
              label: 'v10.0.1',
              to: 'docs/v10.0.1/',
            },
            {
              label: 'v10.0.0',
              to: 'docs/v10.0.0/',
            },
            {
              label: 'v9.1.0',
              to: 'docs/v9.1.0/',
            },
            {
              label: 'v9.0.0',
              to: 'docs/v9.0.0/',
            },
            {
              label: 'v8.0.0',
              to: 'docs/v8.0.0/',
            },
            {
              label: 'v7.1.0',
              to: 'docs/v7.1.0/',
            },
            {
              label: 'v7.0.0',
              to: 'docs/v7.0.0/',
            },
            {
              label: 'v6.0.0',
              to: 'docs/v6.0.0/',
            },
            {
              label: 'v5.0.0',
              to: 'docs/v5.0.0/',
            },
            {
              label: 'v4.0.0',
              to: 'docs/v4.0.0/',
            },
            {
              label: 'v3.0.0',
              to: 'docs/v3.0.0/',
            },
            {
              label: 'v2.0.0',
              to: 'docs/v2.0.0/',
            },
            {
              label: 'v1.7.0',
              to: 'docs/v1.7.0/',
            },
            {
              label: 'v1.6.2',
              to: 'docs/v1.6.2/',
            },
            {
              label: 'v1.6.1',
              to: 'docs/v1.6.1/',
            },
            {
              label: 'v1.6.0',
              to: 'docs/v1.6.0/',
            },
            {
              label: 'v1.5.0',
              to: 'docs/v1.5.0/',
            },
            {
              label: 'v1.4.1',
              to: 'docs/v1.4.1/',
            },
            {
              label: 'experimental',
              to: 'docs/experimental/',
            },
            {
              label: 'classic',
              to: 'docs/classic/',
            },
            ...fbContent({
              internal: [],
              external: [
                {
                  label: 'Unreleased',
                  to: 'docs/next/',
                },
              ],
            }),
          ],
        },
      ],
    },
    image: 'img/relay.png',
    footer: {
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              href: '/docs',
              target: '_self',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'User Showcase',
              href: '/users',
              target: '_self',
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Privacy',
              href: 'https://opensource.facebook.com/legal/privacy/',
            },
            {
              label: 'Terms',
              href: 'https://opensource.facebook.com/legal/terms/',
            },
            {
              label: 'Data Policy',
              href: 'https://opensource.facebook.com/legal/data-policy/',
            },
            {
              label: 'Cookie Policy',
              href: 'https://opensource.facebook.com/legal/cookie-policy/',
            },
          ],
        },
      ],
      logo: {
        src: 'img/relay.svg',
      },
    },
    algolia: {
      apiKey: '3d7d5825d50ea36bca0e6ad06c926f06',
      indexName: 'relay',
      algoliaOptions: {
        facetFilters: ['version:VERSION'],
      },
    },
    gtag: {
      trackingID: 'UA-44373548-50',
    },
  },
};
