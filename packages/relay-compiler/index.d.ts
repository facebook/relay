export type RelayCompilerConfigSchemaConfig = {
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

export type RelayCompilerConfigPersitConfigRemote = {
  /** String, URL to send a `POST` request to to persist. This field is required in `persistConfig`. */
  url: string;
  /** The document will be in a `POST` parameter text. This map can contain additional parameters to send. */
  param: Record<string, string>;
  /** The maximum number concurrent requests that will be made to url. Use a value greater than 0. */
  concurrency: number;
}

export type RelayCompilerConfigPersitConfigLocal = {
  /** Path for the JSON file that will contain operations map. Compiler will write queries in the format: { "md5(queryText) => "queryText", ...}. */
  file: string;
}

export type RelayCompilerConfigLanguage = 'javascript' | 'typescript' | 'flow';

/**
 * This is the object containing the configuration of your Relay project.
 * 
 * @see https://github.com/facebook/relay/tree/main/packages/relay-compiler
 */
export type RelayCompilerConfig = {
  /** Root directory of application code. */
  src: string;
  /** Relative path to the file with GraphQL SDL file. */
  schema: string;
  /** The name of the language used for input files and generated artifacts. */
  language: RelayCompilerConfigLanguage;
  /** A specific directory to output all artifacts to. When enabling this the babel plugin needs `artifactDirectory` to be set as well. */
  artifactDirectory?: string;
  /**
   * Directories to ignore under `src`.
   * 
   * @default ["/node_modules/", "/mocks/", "/generated/"]
   */
  excludes?: string[];
  schemaConfig?: RelayCompilerConfigSchemaConfig;
  /**
   * This option controls whether or not a catch-all entry is added to enum type definitions values that may be added 
   * in the future. Enabling this means you will have to update your application whenever the GraphQL server schema adds 
   * new enum values to prevent it from breaking.
   * 
   * @default false
   */
  noFutureProofEnums?: boolean;
  /** Mappings from custom scalars in your schema to built-in GraphQL types, for type emission purposes. */
  customScalars?: Record<string, string>;
  /**
   * This option enables emitting ES modules artifacts.
   * 
   * @default false
   */
  eagerEsModules?: boolean;
  /** Relay supports two versions of the config. */
  persistConfig?: RelayCompilerConfigPersitConfigRemote | RelayCompilerConfigPersitConfigLocal;
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
  diagnosticReportConfig: Record<string, string> & {
    /** The severity level of diagnostics that will cause the compiler to error out on. */
    criticalLevel: 'error' | 'warning' | 'info';
  }
}