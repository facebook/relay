/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

// N.B. these IDs are path relative to the docs root + id.
// They do not always correspond to the slug, e.g. with /fb/ in the id.
module.exports = {
  docs: [
    {
      Introduction: [
        'introduction/introduction',
        'introduction/prerequisites',
        'introduction/installation-and-setup',
        'introduction/step-by-step-guide',
      ],
      'Usage Guide': [
        'usage/introduction',
        {
          'Setup and Workflow': [
            'usage/setup/compiler',
            'usage/setup/fb/build-script',
          ],
          'Rendering Data Basics': [
            'usage/rendering/fragments',
            'usage/rendering/queries',
            'usage/rendering/variables',
            'usage/rendering/loading-states',
            'usage/rendering/error-states',
            'usage/rendering/environment',
          ],
          'Reusing Cached Data for Rendering': [
            'usage/reusing-cached-data/introduction',
            'usage/reusing-cached-data/fetch-policies',
            'usage/reusing-cached-data/availability-of-data',
            'usage/reusing-cached-data/presence-of-data',
            'usage/reusing-cached-data/staleness-of-data',
            'usage/reusing-cached-data/rendering-partially-cached-data',
            'usage/reusing-cached-data/filling-in-missing-data',
          ],
          'Rendering List Data and Pagination': [
            'usage/list-data/connections',
            'usage/list-data/rendering-connections',
            'usage/list-data/pagination',
            'usage/list-data/streaming-pagination',
            'usage/list-data/blocking-pagination',
            'usage/list-data/refetching-connections',
            'usage/list-data/adding-and-removing-items',
            'usage/list-data/advanced-pagination',
          ],
          'Advanced Data Fetching': [
            'usage/advanced-data-fetching/preloading-data',
            'usage/advanced-data-fetching/incremental-data-delivery',
            'usage/advanced-data-fetching/data-driven-dependencies',
            'usage/advanced-data-fetching/image-prefetching',
          ],
          'Updating Data': [
            'usage/updating-data/introduction',
            'usage/updating-data/graphql-mutations',
            'usage/updating-data/graphql-subscriptions',
            'usage/updating-data/local-data-updates',
            'usage/updating-data/client-only-data',
          ],
          'Accessing Data Without React': [
            'usage/accessing-data-without-react/fetching-queries',
            'usage/accessing-data-without-react/prefetching-queries',
            'usage/accessing-data-without-react/subscribing-to-queries',
            'usage/accessing-data-without-react/reading-queries',
            'usage/accessing-data-without-react/reading-fragments',
            'usage/accessing-data-without-react/retaining-queries',
          ],
        },
      ],
      'API Reference': [
        {
          'Relay Hooks': [
            'api-reference/hooks/introduction',
            'api-reference/hooks/relay-environment-provider',
            'api-reference/hooks/use-relay-environment',
            'api-reference/hooks/use-preloaded-query',
            'api-reference/hooks/use-query-loader',
            'api-reference/hooks/use-lazy-load-query',
            'api-reference/hooks/use-fragment',
            'api-reference/hooks/use-refetchable-fragment',
            'api-reference/hooks/use-pagination-fragment',
            'api-reference/hooks/use-blocking-pagination-fragment',
            'api-reference/hooks/use-mutation',
            'api-reference/hooks/use-subscription',
          ],
          'Entrypoint APIs': [
            'api-reference/entrypoint-apis/introduction',
            'api-reference/entrypoint-apis/use-entrypoint-loader',
            'api-reference/entrypoint-apis/load-entrypoint',
            'api-reference/entrypoint-apis/entrypoint-container',
          ],
          'Query Fetching': [
            'api-reference/query-fetching/load-query',
            'api-reference/query-fetching/fetch-query',
          ],
        },
        'api-reference/legacy-apis/legacy-apis',
      ],
      Guides: [
        'guides/graphql-server-specification',
        'guides/persisted-queries',
        'guides/graphql-and-directives',
        'guides/network-layer',
        'guides/flow-typing',
        'guides/entrypoints',
        'guides/client-schema-extensions',
        'guides/writing-subscriptions',
        'guides/testing-relay-components',
        'guides/testing-relay-with-preloaded-components',
        'guides/required-directive',
        {
          'Web-Only': [
            'guides/incremental-data-delivery',
            'guides/data-driven-dependencies',
            'guides/image-prefetching',
            'guides/fb/comet-route-prefetching',
            'guides/fb/web-query-preloading',
            'guides/fb/render-from-hack',
            'guides/fb/production-graphql-endpoint-in-sandboxes',
            'guides/fb/react-flight',
            'guides/fb/native-fetch',
          ],
          'React-Native-Only': ['guides/fb/native-fetch'],
        },
      ],
    },
    'glossary/glossary',
    {
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
  ],
};
