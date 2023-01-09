/**
 * Relay.js configuration
 */
export type CompilerConfig =
  | SingleProjectConfiguration
  | MultiProjectConfiguration;

type SingleProjectConfiguration = {
  /**
   * Root directory of application code
   */
  src: string;
  schema: Schema;
  language: TypegenLanguage;
  /**
   * A directory to output all artifacts to
   */
  artifactDirectory?: string;
  excludes?: Excludes;
  schemaExtensions?: SchemaExtensions;
  schemaConfig?: SchemaConfig;
  noFutureProofEnums?: NoFutureProofEnums;
  customScalars?: CustomScalarTypes;
  eagerEsModules?: EagerEsModules;
  persistConfig?: PersistConfig;
  codegenCommand?: CodegenCommand;
  isDevVariableName?: DevVariableName;
  jsModuleFormat?: JsModuleFormat;
  moduleImportConfig?: ModuleImportConfig;
  featureFlags?: FeatureFlags;
};

type MultiProjectConfiguration = {
  /**
   * Optional name of this configuration
   */
  name?: string;
  /**
   * Root directory relative to the config file. Defaults to the directory where the config is located.
   */
  root?: string;
  /**
   * A header to be prepended to each generated artifact
   */
  header?: string[];
  /**
   * A mapping from directory paths (relative to the root) to a project. If a path is a subdirectory of another path, the more specific path wins.
   */
  sources: {
    /**
     * The name of a project
     */
    [k: string]: string;
  };
  codegenCommand?: CodegenCommand;
  excludes?: Excludes;
  /**
   * Configuration of projects to compile
   */
  projects: {
    [k: string]: MultiProjectItem;
  };
  featureFlags?: FeatureFlags;
  savedStateConfig?: {
    mergebase?: string;
    "mergebase-with"?: string;
    "saved-state"?: {
      storage?: string;
      "commit-id"?: string;
      config?: any;
    };
  };
  isDevVariableName?: DevVariableName;
};

type MultiProjectItem = TypegenConfig & {
  /**
   * The name of the base project. If a base project is set, the documents of that project can be referenced, but won't produce output artifacts. Extensions from the base project will be added as well and the schema of the base project should be a subset of the schema of this project.
   */
  base?: string;
  /**
   * A directory to output all artifacts to
   */
  output?: string;
  /**
   * Some projects may need to generate extra artifacts. For those, we may need to provide an additional directory to put them. By default they will use `output`.
   */
  extraArtifactsOutput?: string;
  /**
   * If `output` is provided and `shard_output` is `true`, shard the files by putting them under `{output_dir}/{source_relative_path}`
   */
  shardOutput?: boolean;
  /**
   * Regex to match and strip parts of the `source_relative_path`
   */
  shardStripRegex?: string;
  schemaExtensions?: SchemaExtensions;
  persist?: PersistConfig;
  /**
   * Restrict @relay_test_operation to directories matching this regex
   */
  testPathRegex?: string;
  /**
   * Generates a `// @relayVariables name1 name2` header in generated operation files
   */
  variableNamesComment?: boolean;
  featureFlags?: FeatureFlags;
  rollout?: number;
  jsModuleFormat?: JsModuleFormat;
  schemaConfig?: SchemaConfig;
  moduleImportConfig?: ModuleImportConfig;
  diagnosticReportConfig?: DiagnosticReportConfig;
} & (
    | {
        schema: Schema;
      }
    | {
        /**
         * A directory containing a schema broken up in multiple `*.graphql` files.
         */
        schemaDir: string;
      }
  );

/**
 * Path to a GraphQL schema file
 */
type Schema = string;

/**
 * The language used for input files and generated artifacts
 */
type TypegenLanguage = "javascript" | "typescript" | "flow";

/**
 * List of directory glob patterns to ignore
 */
type Excludes = string[];

/**
 * List of directories with `*.graphql` files containing schema extensions
 */
type SchemaExtensions = string[];

/**
 * This option controls whether or not a catch-all entry is added to enum type definitions values that may be added in the future. Enabling this means you will have to update your application whenever the GraphQL server schema adds new enum values to prevent it from breaking
 */
type NoFutureProofEnums = boolean;

/**
 * Emit ES module artifacts
 */
type EagerEsModules = boolean;

type PersistConfig = RemotePersistConfig | LocalPersistConfig;

type LocalPersistConfig = {
  /**
   * Path to the JSON file that will contain operations map
   */
  file: string;
};

type RemotePersistConfig = {
  /**
   * URL to send a POST request to to persist.
   */
  url: string;
  /**
   * The document will be in a POST parameter text. This map can contain additional parameters to send
   */
  params?: {
    [k: string]: string;
  };
  /**
   * The maximum number concurrent requests that will be made to `url`
   */
  concurrency?: number;
};

/**
 * Name of the command that runs the relay-compiler
 */
type CodegenCommand = string;

/**
 * Name of the global variable for dev mode
 */
type DevVariableName = string;

/**
 * Formatting style for generated files
 */
type JsModuleFormat = "commonjs" | "haste";

type FeatureFlag =
  | {
      kind: "disabled";
    }
  | {
      kind: "enabled";
    }
  | {
      kind: "limited";
      allowlist?: string[];
    }
  | {
      kind: "rollout";
      rollout?: number;
    };

/**
 * Configuration where Relay should expect some fields in the schema.
 */
type SchemaConfig = {
  connectionInterface?: {
    cursor?: string;
    edges?: string;
    endCursor?: string;
    hasNextPage?: string;
    hasPreviousPage?: string;
    node?: string;
    pageInfo?: string;
    startCursor?: string;
  };
  /**
   * Configure the name of the globally unique ID field on the Node interface
   */
  nodeInterfaceIdField?: string;
  nonNodeIdFields?: {
    /**
     * Mappings from types in your schema to allowed types for their fields named `id`
     */
    allowedIdTypes: {
      /**
       * The type of the `id` field of this type
       */
      [k: string]: string;
    };
  };
  /**
   * The name of the directive indicating fields that cannot be selected
   */
  unselectableDirectiveName?: string;
};

/**
 * Mappings from custom scalars in your schema to built-in GraphQL types, for type emission purposes
 */
type CustomScalarTypes = {
  [k: string]:
    | string
    | {
        name: string;
        path: string;
      };
};

/**
 * Configuration for @module
 */
type ModuleImportConfig = {
  /**
   * Defines the custom import statement to be generated on the `ModuleImport` node in ASTs, used for dynamically loading components at runtime.
   */
  dynamicModuleProvider?:
    | {
        mode: "JSResource";
      }
    | {
        mode: "Custom";
        statement?: string;
      };
};

type FeatureFlags = {
  enable_flight_transform?: boolean;
  enable_relay_resolver_transform?: boolean;
  use_named_imports_for_relay_resolvers?: boolean;
  relay_resolver_model_syntax_enabled?: boolean;
  relay_resolver_enable_terse_syntax?: boolean;
  hash_supported_argument?: FeatureFlag;
  no_inline?: FeatureFlag;
  enable_3d_branch_arg_generation?: boolean;
  actor_change_support?: FeatureFlag;
  text_artifacts?: FeatureFlag;
  enable_client_edges?: FeatureFlag;
  skip_printing_nulls?: FeatureFlag;
  enable_fragment_aliases?: FeatureFlag;
  compact_query_text?: FeatureFlag;
};

type TypegenConfig = {
  language: TypegenLanguage;
  /**
   * (Flow only) When set, enum values are imported from a module with this suffix. For example, an enum Foo and this property set to `.test` would be imported from `Foo.test`
   */
  enumModuleSuffix?: string;
  /**
   * (Flow only) When set, generated input types will have the listed fields optional even if the schema defines them as required.
   */
  optionalInputFields?: string[];
  /**
   * (TypeScript only) Whether to use the `import type` syntax introduced in Typescript version 3.8. This will prevent warnings from `importsNotUsedAsValues`.
   */
  useImportTypeSyntax?: boolean;
  customScalarTypes?: CustomScalarTypes;
  /**
   * Require all GraphQL scalar types mapping to be defined, will throw if a GraphQL scalar type doesn't have a JS type.
   */
  requireCustomScalarTypes?: boolean;
  /**
   * Work in progress new Flow type definitions
   */
  flowTypegen?: {
    noFutureProofEnums?: NoFutureProofEnums;
  };
  eagerEsModules?: EagerEsModules;
};

/**
 * Configuration for all diagnostic reporting in the compiler
 */
type DiagnosticReportConfig = {
  /**
   * Threshold for diagnostics to be critical to the compiler's execution. All diagnostic with severities at and below this level will cause the compiler to fatally exit.
   */
  criticalLevel: "error" | "warning" | "info" | "hint";
};
