var exec = require('child_process').execFileSync;
var fs = require('fs-extra');
var glob = require('glob');

module.exports = function(targetDir) {
  fs.copySync('node_modules/spec-md/css', targetDir + '/relay/graphql');
  glob.sync('graphql/*.md').forEach(function(file) {
    var html = exec('./node_modules/.bin/spec-md', [file]);
    var outFilename = (
      targetDir + '/relay/graphql/' +
      path.basename(file, '.md').toLowerCase() +
      '.htm'
    );
    fs.writeFileSync(outFilename, html.toString());
  });
}
