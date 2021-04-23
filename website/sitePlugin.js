const webpack = require("webpack");

module.exports.default = function sitePlugin() {
  return {
    name: "sitePlugin",
    configureWebpack(config) {
      return {
        plugins: [
          new webpack.EnvironmentPlugin({
            FB_INTERNAL: process.env.FB_INTERNAL ?? false,
          }),
        ],
      };
    },
  }
}
