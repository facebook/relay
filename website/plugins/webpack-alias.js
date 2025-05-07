const path = require('path');
module.exports = function (context, options) {
  return {
    name: 'custom-webpack-alias',
    configureWebpack() {
      // The relative location of the JSON schema file differs between GitHub
      // and internal Meta builds, so we need a palace to handle that
      // conditionality.

      // TODO: Handle the internal case once this has been imported.
      const jsonSchemaPath = path.resolve(
        __dirname,
        '../../compiler/crates/relay-compiler/relay-compiler-config-schema.json',
      );

      return {
        resolve: {
          alias: {
            '@compilerConfigJsonSchema': jsonSchemaPath,
          },
        },
      };
    },
  };
};
