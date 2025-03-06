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

const transformerWithOptions = require('./transformerWithOptions');

describe('multi-project configuration', () => {
  // Tests basic project configuration resolution based on file path
  it('uses correct project settings based on path', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            'src/project1': 'project1',
          },
        },
        'development',
        '/root/src/project1/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that different files use different project configurations
  it('uses different settings for different projects', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
            project2: {
              jsModuleFormat: 'commonjs',
            },
          },
          sources: {
            'src/project1': 'project1',
            'src/project2': 'project2',
          },
        },
        'development',
        '/root/src/project2/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that output directory in project config is mapped to artifactDirectory
  it('maps output directory to artifactDirectory', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'commonjs',
              output: '/generated/project1',
            },
          },
          sources: {
            'src/project1': 'project1',
          },
        },
        'development',
        '/root/src/project1/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that more specific paths take precedence over less specific paths
  it('uses the most specific path match', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
            project1Feature: {
              jsModuleFormat: 'commonjs',
            },
          },
          sources: {
            'src/project1': 'project1',
            'src/project1/feature': 'project1Feature',
          },
        },
        'development',
        '/root/src/project1/feature/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests fallback to global settings when no source path matches
  it('falls back to global settings when no path matches', () => {
    expect(
      transformerWithOptions(
        {
          jsModuleFormat: 'commonjs', // Global setting
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            'src/project1': 'project1',
          },
        },
        'development',
        '/root/src/other/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests warning behavior when a file matches multiple projects with conflicting settings
  it('prioritizes the first project for multiple matches', () => {
    // Mock console.warn to capture warning messages
    const originalWarn = console.warn;
    let warningMessage = '';
    console.warn = (...args) => {
      warningMessage = args.join(' ');
    };

    try {
      // Use a path that matches the source path in the configuration
      const filePath = '/workspaces/relay/src/shared/Component.js';

      // Configuration with deliberately conflicting settings between projects
      const config = {
        projects: {
          project1: {
            jsModuleFormat: 'haste',
            eagerEsModules: true,
            codegenCommand: 'relay-compiler-1',
            isDevVariableName: 'DEV1',
          },
          project2: {
            jsModuleFormat: 'commonjs',
            eagerEsModules: false,
            codegenCommand: 'relay-compiler-2',
            isDevVariableName: 'DEV2',
          },
        },
        sources: {
          'src/shared': ['project1', 'project2'],
        },
      };

      // Transform the code snippet
      transformerWithOptions(
        config,
        'development',
        filePath,
      )('graphql`fragment TestFrag on Node { id }`');

      // Verify warning content
      expect(warningMessage).toContain('conflicting settings');
      expect(warningMessage).toContain('project1:');
      expect(warningMessage).toContain('project2:');
    } finally {
      // Restore original warning function
      console.warn = originalWarn;
    }
  });

  // Tests handling of empty arrays in the sources configuration
  it('handles empty array in sources', () => {
    expect(
      transformerWithOptions(
        {
          jsModuleFormat: 'commonjs', // Global setting
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            'src/project1': 'project1',
            'src/empty': [], // Empty array of projects
          },
        },
        'development',
        '/root/src/empty/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that null values in project arrays are ignored
  it('ignores null values in sources array', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
            project2: {
              jsModuleFormat: 'commonjs',
            },
          },
          sources: {
            'src/mixed': [null, 'project2', null], // Array with null values
          },
        },
        'development',
        '/root/src/mixed/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that exact file path matches take precedence over directory matches
  it('matches exact file paths', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
            project2: {
              jsModuleFormat: 'commonjs',
            },
          },
          sources: {
            'src/project1': 'project1',
            'src/project1/Component.js': 'project2', // Exact file match
          },
        },
        'development',
        '/root/src/project1/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests fallback behavior when a source path maps to null
  it('handles null project in sources', () => {
    expect(
      transformerWithOptions(
        {
          jsModuleFormat: 'commonjs',
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            'src/project1': 'project1',
            'src/empty': null, // Null project
          },
        },
        'development',
        '/root/src/empty/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests fallback behavior when a source path maps to a nonexistent project
  it('handles nonexistent project in sources', () => {
    expect(
      transformerWithOptions(
        {
          jsModuleFormat: 'commonjs',
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            'src/project1': 'project1',
            'src/nonexistent': 'nonexistent', // Project not defined in projects
          },
        },
        'development',
        '/root/src/nonexistent/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that path separators (/ vs \) are handled consistently
  it('handles cross-platform paths consistently', () => {
    const config = {
      projects: {
        project1: {
          jsModuleFormat: 'haste',
        },
      },
      sources: {
        'src/project1': 'project1',
      },
    };

    // Test with forward slashes
    const forwardResult = transformerWithOptions(
      config,
      'development',
      '/root/src/project1/Component.js',
    )('graphql`fragment TestFrag on Node { id }`');

    // Test with backslashes (Windows-style paths)
    const backslashResult = transformerWithOptions(
      config,
      'development',
      '/root/src/project1/Component.js'.replace(/\//g, '\\'),
    )('graphql`fragment TestFrag on Node { id }`');

    // Snapshot the forward slash result
    expect(forwardResult).toMatchSnapshot('forward slashes');

    // Verify path handling is consistent regardless of separator style
    expect(forwardResult.includes('TestFrag.graphql')).toBe(
      backslashResult.includes('TestFrag.graphql'),
    );
  });

  // Tests that project settings override global settings when both are present
  it('combines global and project-specific settings', () => {
    expect(
      transformerWithOptions(
        {
          // Global settings
          codegenCommand: 'global-relay-compiler',
          isDevVariableName: 'GLOBAL_DEV',
          projects: {
            project1: {
              // Project-specific settings
              jsModuleFormat: 'haste',
              codegenCommand: 'project1-relay-compiler',
            },
          },
          sources: {
            'src/project1': 'project1',
          },
        },
        'development',
        '/root/src/project1/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that eagerEsModules setting works in multi-project config
  it('supports eager ES modules', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'commonjs',
              eagerEsModules: true,
            },
          },
          sources: {
            'src/project1': 'project1',
          },
        },
        'development',
        '/root/src/project1/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that files directly in a source path (not in subdirectory) match correctly
  it('handles files directly in source path', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            'src/project1': 'project1',
          },
        },
        'development',
        '/root/src/project1/index.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that trailing slashes in source paths are handled correctly
  it('handles trailing slashes in source paths', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            'src/project1/': 'project1', // With trailing slash
          },
        },
        'development',
        '/root/src/project1/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that when multiple paths match, the deepest/most specific one is used
  it('prioritizes deeper path matches', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
            project2: {
              jsModuleFormat: 'commonjs',
            },
            projectWebFeature: {
              jsModuleFormat: 'haste',
              eagerEsModules: true,
            },
          },
          sources: {
            src: 'project1', // depth 1
            'src/web': 'project2', // depth 2
            'src/web/features': 'projectWebFeature', // depth 3
          },
        },
        'development',
        '/root/src/web/features/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests behavior when sources object is empty
  it('uses global config with empty sources', () => {
    expect(
      transformerWithOptions(
        {
          jsModuleFormat: 'commonjs', // Global setting
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {}, // Empty sources object
        },
        'development',
        '/root/src/any/path/Component.js',
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests that root path '/' in sources configuration works correctly
  it('handles root paths in sources', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            root: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            '/': 'root', // Root path
          },
        },
        'development',
        '/Component.js', // At root
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });

  // Tests graceful handling of undefined file paths
  it('handles undefined paths', () => {
    expect(
      transformerWithOptions(
        {
          projects: {
            project1: {
              jsModuleFormat: 'haste',
            },
          },
          sources: {
            'src/project1': 'project1',
          },
        },
        'development',
        undefined,
      )('graphql`fragment TestFrag on Node { id }`'),
    ).toMatchSnapshot();
  });
});
