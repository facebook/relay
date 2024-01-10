/**
 * This is the object containing the configuration of your Relay project.
 * 
 * @see https://github.com/facebook/relay/tree/main/packages/relay-compiler
 */
export type RelayConfig = RelayConfigSingleProject | RelayConfigMultiProject;

/**
 * This is the configuration containing the object for single project configuration.
 */
export type RelayConfigSingleProject = {
  /** Root directory of application code. */
  src: string;
  /** Relative path to the file with GraphQL SDL file. */
  schema: string;
  /** The name of the language used for input files and generated artifacts. */
  language: RelayConfigLanguage;
  /** A specific directory to output all artifacts to. When enabling this the babel plugin needs `artifactDirectory` to be set as well. */
  artifactDirectory?: string;
  /**
   * Directories to ignore under `src`.
   * 
   * @default ["/node_modules/", "/mocks/", "/generated/"]
   */
  excludes?: string[];
  /** Extra config for the schema itself. */
  schemaConfig?: RelayConfigSchemaConfig;
  /**
   * This option controls whether or not a catch-all entry is added to enum type definitions values that may be added 
   * in the future. Enabling this means you will have to update your application whenever the GraphQL server schema adds 
   * new enum values to prevent it from breaking.
   * 
   * @default false
   */
  noFutureProofEnums?: boolean;
  /** Mappings from custom scalars in your schema to built-in GraphQL types, for type emission purposes. */
  customScalars?: RelayConfigCustomScalars;
  /**
   * This option enables emitting ES modules artifacts.
   * 
   * @default false
   */
  eagerEsModules?: boolean;
  /** Relay supports two versions of the config. */
  persistConfig?: RelayConfigPersist;
  /** Command name that for relay compiler. */
  codegenCommand?: string;
  /**
   * Name of the global variable for dev mode
   * 
   * @default "__DEV__"
   */
  isDevVariableName?: string;
  /** 
   * Formatting style for generated files.
   * 
   * @default "commonjs"
   */
  jsModuleFormat?: 'commonjs' | 'haste';
  /** Options for configuring the output of compiler diagnostics. */
  diagnosticReportConfig: RelayConfigDiagnosticReport;
  featureFlags: RelayFeatureFlags;
}

/**
 * This is the configuration containing the object for multiproject configuration.
 */
export type RelayConfigMultiProject = {
  /** Name of this configuration. */
  name?: string;
  /** Root directory relative of this configuration. */
  root?: string;
  /** A header to be prepend to each generated artifact. */
  header?: string[];
  /**
   * A mapping directory from directory paths (relative to the root) to a project.
   * If a path is a subdirectory of another path, the more specific path wins.
   */
  sources: Record<string, string>;
  /** Command name that for relay compiler. */
  codegenCommand?: string;
  /**
   * Directory to be excluded under each project.
   * 
   * @default ["/node_modules/", "/mocks/", "/generated/"]
   */
  excludes?: string[];
  /** Configuration of each project that will be reached by the compiler. */
  projects: Record<string, RelayConfigMultiProjectItem>;
  savedStateConfig?: {
    mergebase?: string;
    "mergebase-with"?: string;
    "saved-state"?: {
      storage?: string;
      "commit-id"?: string;
      config?: any;
    };
  };
  /**
   * Name of the global variable for dev mode
   * 
   * @default "__DEV__"
   */
  isDevVariableName?: string;
}

type RelayConfigMultiProjectItemSchemaConfig =
  | { 
      /** The path of your schema file. */
      schema: string 
    };
  | { 
      /**
       * A directory containing a schema broken up in multiple `*.graphql` files.
       */
      schemaDir: string;
    }

type RelayConfigMultiProjectItemDynamicModuleProvider =
  | { mode: "JSResource" }
  | { mode: "Custom", statement?: string; };

type RelayConfigMultiProjectItemTypegenConfig = {
  /** The name of the language used for input files and generated artifacts. */
  language: RelayConfigLanguage;
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
    /**
     * This option controls whether or not a catch-all entry is added to enum type definitions values that may be added 
     * in the future. Enabling this means you will have to update your application whenever the GraphQL server schema adds 
     * new enum values to prevent it from breaking.
     * 
     * @default false
     */
    noFutureProofEnums?: NoFutureProofEnums;
  };
  /**
   * This option enables emitting ES modules artifacts.
   * 
   * @default false
   */
  eagerEsModules?: boolean;
}

export type RelayConfigMultiProjectItem = 
  RelayConfigMultiProjectItemSchemaConfig & RelayConfigMultiProjectItemTypegenConfig & {
  /**
   * The name of the base project. If a base project is set, the documents of that project can be referenced, 
   * but won't produce output artifacts. Extensions from the base project will be added as well and the schema 
   * of the base project should be a subset of the schema of this project.
   */
  base?: string;
  /**
   * The output directory for all our generated artifactories from the compiler. A project without an output directory will put 
   * the generated files in a `__generated__` directory next to the input file. All files in these directories should be generated 
   * by the Relay compiler, so that the compiler can cleanup extra files.
   */
  output?: string;
  /**
   * Some projects may need to generate extra artifacts. For those, we may need to provide an additional directory to put them. 
   * By default they will use `output`.
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
  /** Array of directories containing *.graphql files with schema extensions. */
  schemaExtensions?: string[];
  /** If this option is set, the compiler will persist queries using this config. */
  persist?: RelayConfigPersitConfigLocal;
  /**
   * Restrict @relay_test_operation to directories matching this regex
   */
  testPathRegex?: string;
  /** Generates a `// @relayVariables name1 name2` header in generated operation files. */
  variableNamesComment?: boolean;
  featureFlags?: RelayConfigFeatureFlags;
  /** A placeholder for allowing extra information in the config file */
  extra: unknown;
  /** 
   * A generic rollout state for larger codegen changes. The default is to
   * pass, otherwise it should be a number between 0 and 100 as a percentage.
   */
  rollout?: number;
  /** 
   * Formatting style for generated files.
   * 
   * @default "commonjs"
   */
  jsModuleFormat?: 'commonjs' | 'haste';
  /** Extra config for the schema itself. */
  schemaConfig?: RelayConfigSchemaConfig;
  /** Configuration for `@module`. */
  moduleImportConfig?: {
    /** 
     * Defines the custom import statement to be generated on the
     * `ModuleImport` node in ASTs, used for dynamically loading
     * components at runtime. 
     */
    dynamicModuleProvider: RelayConfigMultiProjectItemDynamicModuleProvider;
  };
  /** Options for configuring the output of compiler diagnostics. */
  diagnosticReportConfig?: DiagnosticReportConfig;
}

export type RelayConfigSchemaConfig = {
  /**  Configure the name of the globally unique ID field on the Node interface. Useful if you can't use the default id field name. */
  nodeInterfaceIdField?: string;
  /**
   * Specifies the name of the variable expected by the node query to pass the Node id.
   * 
   * @default "id"
   */
  nodeInterfaceIdVariableName?: string;
  /**
   * Restricts the type of all fields named `id` to `ID`.
   * 
   * `allowedIdTypes` - Mappings from types in your schema to allowed types for their fields named `id`.
   */
  nonNodeIdFields?: Record<string, string>;
}

export type RelayConfigPersist = RelayConfigPersitConfigRemote | RelayConfigPersitConfigLocal;

export type RelayConfigPersitConfigRemote = {
  /** String, URL to send a `POST` request to to persist. This field is required in `persistConfig`. */
  url: string;
  /** The document will be in a `POST` parameter text. This map can contain additional parameters to send. */
  param: Record<string, string>;
  /** The maximum number concurrent requests that will be made to url. Use a value greater than 0. */
  concurrency: number;
}

export type RelayConfigPersitConfigLocal = {
  /** Path for the JSON file that will contain operations map. Compiler will write queries in the format: { "md5(queryText) => "queryText", ...}. */
  file: string;
}

export type RelayConfigLanguage = 'javascript' | 'typescript' | 'flow';

export type RelayConfigCustomScalars = Record<string, string | { name: string, path: string }>;

export type RelayConfigDiagnosticReport = {
  /** The severity level of diagnostics that will cause the compiler to error out on. */
  criticalLevel: 'error' | 'warning' | 'info';
};

type RelayConfigFeatureFlag = 
  | { kind: "disabled"; }
  | { kind: "enabled"; }
  | {
      kind: "limited";
      allowlist: string[];
    }
  | {
      kind: "rollout";
      /** @minimum 0
       *  @maximum 100 
       */
      rollout: number;
    };

export type RelayConfigFeatureFlags = {
  /**
   * Let users enable the Relay Resolvers.
   * 
   * @see https://relay.dev/docs/guides/relay-resolvers/
   */
  enable_relay_resolver_transform?: boolean;
  /** Enable deprecated `@outputType` on Relay Resolvers. */
  relay_resolver_enable_output_type?: RelayConfigFeatureFlag;
  /** Enable returning interfaces from Relay Resolvers without `@outputType` */
  relay_resolver_enable_interface_output_type: RelayConfigFeatureFlag;
  /** 
   * For now, this also disallows fragments with variable definitions. 
   * This also makes `@module` to opt in using `@no_inline` internally
   * 
   * **NOTE** that the presence of a fragment in this list only controls 
   * whether a fragment is *allowed* to use `@no_inline`: whether the fragment is 
   * inlined or not depends on whether it actually uses that directive.
   */
  no_inline: RelayConfigFeatureFlag;
  enable_3d_branch_arg_generation: bool;
  actor_change_support: RelayConfigFeatureFlag;
  text_artifacts: RelayConfigFeatureFlag;
  skip_printing_nulls: RelayConfigFeatureFlag;
  /** Enable support for the experimental `@alias` directive on fragment spreads. */
  enable_fragment_aliases: RelayConfigFeatureFlag;
  /** Print queries in compact form. */
  compact_query_text: RelayConfigFeatureFlag;
  /** Create normalization nodes for client edges to client objects. */
  emit_normalization_nodes_for_client_edges: boolean;
  /** Fully build the normalization AST for Resolvers. */
  enable_resolver_normalization_ast: bool;
  /** Enforce strict flavors for relay resolvers and disallow mixing flavors. */
  relay_resolvers_enable_strict_resolver_flavors: RelayConfigFeatureFlag;
  /** Allow legacy verbose resolver syntax */
  relay_resolvers_allow_legacy_verbose_syntax: RelayConfigFeatureFlag;
  /** Allow relay resolvers to extend the Mutation type. */
  enable_relay_resolver_mutations: boolean;
  /** Perform strict validations when custom scalar types are used. */
  enable_strict_custom_scalars: boolean;
}
