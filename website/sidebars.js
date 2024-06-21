/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const {fbContent} = require('docusaurus-plugin-internaldocs-fb/internal');

// Some advanced information not covered in the new tutorial that
// we need to stick somewhere until the rest of the Guides and API
// Reference are rewritten.
const GuidesRescuedFromOldTutorial = [
  {
    'Reusing Cached Data for Rendering': [
      'guided-tour/reusing-cached-data/introduction',
      'guided-tour/reusing-cached-data/fetch-policies',
      'guided-tour/reusing-cached-data/presence-of-data',
      'guided-tour/reusing-cached-data/staleness-of-data',
      'guided-tour/reusing-cached-data/rendering-partially-cached-data',
      'guided-tour/reusing-cached-data/filling-in-missing-data',
    ],
  },
  ...fbContent({
    internal: ['guided-tour/list-data/fb/blocking-pagination'],
    external: [],
  }),
  'guided-tour/list-data/advanced-pagination',
  ...fbContent({
    internal: ['guided-tour/fb/advanced-data-fetching'],
    external: [
      // TODO(T85915654): Release entrypoints guide externally
    ],
  }),
  {
    'Managing Data Outside React': [
      // These were already commented out
      // 'guided-tour/managing-data-outside-react/prefetching-queries',
      // 'guided-tour/managing-data-outside-react/subscribing-to-queries',
      // 'guided-tour/managing-data-outside-react/reading-queries',
      // 'guided-tour/managing-data-outside-react/reading-fragments',
      'guided-tour/managing-data-outside-react/retaining-queries',
    ],
  },
  'guided-tour/updating-data/graphql-subscriptions',
  {
    'Updating Data': [
      'guided-tour/list-data/updating-connections',
      'guided-tour/updating-data/imperatively-modifying-store-data',
      'guided-tour/updating-data/imperatively-modifying-linked-fields',
      'guided-tour/updating-data/typesafe-updaters-faq',
      'guided-tour/updating-data/local-data-updates',
      'guided-tour/updating-data/client-only-data',
    ],
  },
];

const Guides = fbContent({
  internal: [
    'guides/graphql-server-specification',
    'guides/compiler',
    'guides/fb/updating-the-graphql-schema',
    'guides/fb/flow-typing',
    'guides/fb/writing-subscriptions',
    'guides/testing-relay-components',
    'guides/testing-relay-with-preloaded-queries',
    'guides/required-directive',
    'guides/relay-resolvers',
    'guides/client-schema-extensions',
    'guides/type-emission',
    'guided-tour/rendering/error-states',
    'guides/fb/client-mutation-id-and-actor-id',
    GuidesRescuedFromOldTutorial,
    {
      EntryPoints: [
        'guides/fb/entrypoints/entrypoints',
        'guides/fb/entrypoints/using-entrypoints',
        'guides/fb/entrypoints/using-entrypoints-at-facebook',
        'guides/fb/entrypoints/migrating-from-lazy-fetching',
        'guides/fb/entrypoints/entrypoints-faq',
      ],
      'Web-Only': [
        'guides/fb/incremental-data-delivery',
        'guides/fb/data-driven-dependencies',
        'guides/fb/image-prefetching',
        'guides/fb/comet-route-prefetching',
        'guides/fb/web-query-preloading',
        'guides/fb/production-graphql-endpoint-in-sandboxes',
        'guides/fb/react-flight',
      ],
      'React-Native-Only': ['guides/fb/native-fetch'],
    },
  ],
  external: [
    'guides/graphql-server-specification',
    'guides/compiler',
    'guides/type-emission',
    'guides/persisted-queries',
    'guides/network-layer',
    'guides/client-schema-extensions',
    'guides/testing-relay-components',
    'guides/testing-relay-with-preloaded-queries',
    'guides/required-directive',
    'guides/relay-resolvers',
    'guided-tour/rendering/error-states',
    GuidesRescuedFromOldTutorial,
    // TODO(T84797602) release incremental data delivery externally
    // 'guides/incremental-data-delivery',
    // TODO release these in OSS
    // 'guides/data-driven-dependencies',
    // 'guides/image-prefetching',
  ],
});

// N.B. these IDs are path relative to the docs root + id.
// They do not always correspond to the slug, e.g. with /fb/ in the id.
module.exports = {
  docs: [
    'home',
    {
      Tutorial: [
        'tutorial/intro',
        'tutorial/graphql',
        'tutorial/queries-1',
        'tutorial/fragments-1',
        'tutorial/arrays-lists',
        'tutorial/queries-2',
        {
          type: 'doc',
          id: 'tutorial/interfaces-polymorphism',
          label: 'Interfaces & Polymorphism',
        },
        'tutorial/refetchable-fragments',
        'tutorial/connections-pagination',
        'tutorial/mutations-updates',
        'tutorial/organizing-mutations-queries-and-subscriptions',
      ],
      Installation: [
        'getting-started/prerequisites',
        'getting-started/installation-and-setup',
        'editor-support',
      ],
      Guides,
      'API Reference': [
        {
          'Relay Hooks': [
            'api-reference/hooks/relay-environment-provider',
            'api-reference/hooks/use-relay-environment',
            'api-reference/hooks/use-preloaded-query',
            'api-reference/hooks/use-query-loader',
            'api-reference/hooks/load-query',
            'api-reference/hooks/use-lazy-load-query',
            'api-reference/hooks/use-client-query',
            'api-reference/hooks/use-fragment',
            'api-reference/hooks/use-refetchable-fragment',
            'api-reference/hooks/use-pagination-fragment',
            ...fbContent({
              internal: [
                'api-reference/hooks/fb/use-blocking-pagination-fragment',
              ],
              external: [],
            }),
            'api-reference/hooks/use-mutation',
            'api-reference/hooks/use-subscription',
          ],
          'Entrypoint APIs': [
            'api-reference/entrypoint-apis/use-entrypoint-loader',
            'api-reference/entrypoint-apis/load-entrypoint',
            'api-reference/entrypoint-apis/entrypoint-container',
          ],
          'Relay Runtime': [
            'api-reference/relay-runtime/fetch-query',
            'api-reference/relay-runtime/store',
            'api-reference/relay-runtime/commit-mutation',
            'api-reference/relay-runtime/request-subscription',
          ],
        },
        'api-reference/graphql/graphql-directives',
        'api-reference/legacy-apis/legacy-apis',
      ],
      'Migration and Compatibility': [
        'migration-and-compatibility/upgrading-to-relay-hooks',
        'migration-and-compatibility/suspense-compatibility',
        'migration-and-compatibility/relay-hooks-and-legacy-container-apis',
      ],
    },
    {
      Debugging: [
        ...fbContent({
          internal: [
            'debugging/fb/debugging-and-troubleshooting',
            'debugging/relay-devtools',
            'debugging/fb/network-logger',
            'debugging/inconsistent-typename-error',
            'debugging/declarative-mutation-directives',
            'debugging/fb/debugging-suspense',
            'debugging/fb/debugging-phps',
            'debugging/fb/vscode-extension',
            'debugging/why-null',
            'debugging/fb/debugging-faq',
          ],
          external: [
            'debugging/relay-devtools',
            'debugging/inconsistent-typename-error',
            'debugging/declarative-mutation-directives',
            'debugging/why-null',
          ],
        }),
      ],
      'Principles and Architecture': [
        'principles-and-architecture/thinking-in-graphql',
        'principles-and-architecture/thinking-in-relay',
        'principles-and-architecture/architecture-overview',
        'principles-and-architecture/compiler-architecture',
        'principles-and-architecture/runtime-architecture',
        'principles-and-architecture/videos',
      ],
      'Error reference': ['error-reference/unknown-field'],
    },
    'community/learning-resources',
    'glossary/glossary',
  ],
};
