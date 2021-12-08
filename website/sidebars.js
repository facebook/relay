/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const {fbContent} = require('internaldocs-fb-helpers');

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
    'guides/client-schema-extensions',
    'guides/type-emission',
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
    {
      'Getting Started': [
        'getting-started/introduction',
        ...fbContent({
          internal: [],
          external: [
            'getting-started/prerequisites',
            'getting-started/installation-and-setup',
            'getting-started/step-by-step-guide',
          ],
        }),
      ],
      'A Guided Tour': [
        'guided-tour/introduction',
        'guided-tour/workflow',
        {
          'Rendering Data Basics': [
            'guided-tour/rendering/queries',
            'guided-tour/rendering/fragments',
            'guided-tour/rendering/variables',
            'guided-tour/rendering/loading-states',
            'guided-tour/rendering/error-states',
            'guided-tour/rendering/environment',
          ],
          'Reusing Cached Data for Rendering': [
            'guided-tour/reusing-cached-data/introduction',
            'guided-tour/reusing-cached-data/fetch-policies',
            'guided-tour/reusing-cached-data/availability-of-data',
            'guided-tour/reusing-cached-data/presence-of-data',
            'guided-tour/reusing-cached-data/staleness-of-data',
            'guided-tour/reusing-cached-data/rendering-partially-cached-data',
            'guided-tour/reusing-cached-data/filling-in-missing-data',
          ],
          'Refreshing and Refetching': [
            'guided-tour/refetching/introduction',
            'guided-tour/refetching/refreshing-queries',
            'guided-tour/refetching/refetching-queries-with-different-data',
            'guided-tour/refetching/refreshing-fragments',
            'guided-tour/refetching/refetching-fragments-with-different-data',
          ],
          'Rendering List Data and Pagination': [
            'guided-tour/list-data/connections',
            'guided-tour/list-data/rendering-connections',
            'guided-tour/list-data/pagination',
            'guided-tour/list-data/streaming-pagination',
            ...fbContent({
              internal: ['guided-tour/list-data/fb/blocking-pagination'],
              external: [],
            }),
            'guided-tour/list-data/refetching-connections',
            'guided-tour/list-data/updating-connections',
            'guided-tour/list-data/advanced-pagination',
          ],
        },
        {
          'Updating Data': [
            'guided-tour/updating-data/introduction',
            'guided-tour/updating-data/graphql-mutations',
            'guided-tour/updating-data/graphql-subscriptions',
            'guided-tour/updating-data/local-data-updates',
            'guided-tour/updating-data/client-only-data',
          ],
        },
        ...fbContent({
          internal: ['guided-tour/fb/advanced-data-fetching'],
          external: [
            // TODO(T85915654): Release entrypoints guide externally
          ],
        }),
        {
          'Managing Data Outside React': [
            // 'guided-tour/managing-data-outside-react/prefetching-queries',
            // 'guided-tour/managing-data-outside-react/subscribing-to-queries',
            // 'guided-tour/managing-data-outside-react/reading-queries',
            // 'guided-tour/managing-data-outside-react/reading-fragments',
            'guided-tour/managing-data-outside-react/retaining-queries',
          ],
        },
      ],
      'API Reference': [
        {
          'Relay Hooks': [
            'api-reference/hooks/relay-environment-provider',
            'api-reference/hooks/use-relay-environment',
            'api-reference/hooks/use-preloaded-query',
            'api-reference/hooks/use-query-loader',
            'api-reference/hooks/load-query',
            'api-reference/hooks/use-lazy-load-query',
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
      Guides,
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
            'debugging/fb/debugging-faq',
          ],
          external: [
            'debugging/relay-devtools',
            'debugging/inconsistent-typename-error',
            'debugging/declarative-mutation-directives',
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
    },
    'community/learning-resources',
    'glossary/glossary',
  ],
};
