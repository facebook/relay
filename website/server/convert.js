var buildGraphQLSpec = require('./buildGraphQLSpec');
var fs = require('fs-extra');
var glob = require('glob');
var mkdirp = require('mkdirp');
var optimist = require('optimist');
var path = require('path');
var argv = optimist.argv;

function splitHeader(content) {
  var lines = content.split('\n');
  for (var i = 1; i < lines.length - 1; ++i) {
    if (lines[i] === '---') {
      break;
    }
  }
  return {
    header: lines.slice(1, i + 1).join('\n'),
    content: lines.slice(i + 1).join('\n')
  };
}

function backtickify(str) {
  var escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    // Don't treat literal ${...} as template substitutions in docs
    .replace(/\${/g, '\\${')
    // Replace require( with require\( so node-haste doesn't replace example
    // require calls in the docs
    .replace(/require\(/g, 'require\\(');
  return '`' + escaped + '`';
}

function execute() {
  var MD_DIR = '../docs/';

  glob.sync('src/relay/{docs,graphql}').forEach(function(file) {
    fs.removeSync(file);
    fs.mkdirsSync(file);
  });

  var metadatas = {
    files: [],
  };

  glob.sync(MD_DIR + '**/*.*').forEach(function(file) {
    var extension = path.extname(file);
    if (extension === '.md' || extension === '.markdown') {
      var content = fs.readFileSync(file, {encoding: 'utf8'});
      var metadata = {};

      // Extract markdown metadata header
      var both = splitHeader(content);
      var lines = both.header.split('\n');
      for (var i = 0; i < lines.length - 1; ++i) {
        var keyvalue = lines[i].split(':');
        var key = keyvalue[0].trim();
        var value = keyvalue.slice(1).join(':').trim();
        // Handle the case where you have "Community #10"
        try { value = JSON.parse(value); } catch(e) { }
        metadata[key] = value;
      }
      metadata['source'] = path.basename(file);
      metadatas.files.push(metadata);

      if (metadata.permalink.match(/^https?:/)) {
        return;
      }

      // Create a dummy .js version that just calls the associated layout
      var layout = metadata.layout[0].toUpperCase() + metadata.layout.substr(1) + 'Layout';

      var content = (
        '/**\n' +
        ' * @' + 'generated\n' +
        ' */\n' +
        'var React = require("React");\n' +
        'var Layout = require("' + layout + '");\n' +
        'var content = ' + backtickify(both.content) + '\n' +
        'var Post = React.createClass({\n' +
        '  statics: {\n' +
        '    content: content\n' +
        '  },\n' +
        '  render: function() {\n' +
        '    return <Layout metadata={' + JSON.stringify(metadata) + '}>{content}</Layout>;\n' +
        '  }\n' +
        '});\n' +
        // TODO: Use React statics after upgrading React
        // 'Post.content = content;\n' +
        'module.exports = Post;\n'
      );

      var targetFile = 'src/relay/' + metadata.permalink.replace(/\.html$/, '.js');
      mkdirp.sync(targetFile.replace(new RegExp('/[^/]*$'), ''));
      fs.writeFileSync(targetFile, content);
    }

    if (extension === '.json') {
      var content = fs.readFileSync(file, {encoding: 'utf8'});
      metadatas[path.basename(file, '.json')] = JSON.parse(content);
    }
  });

  fs.writeFileSync(
    'core/metadata.js',
    '/**\n' +
    ' * @' + 'generated\n' +
    ' * @providesModule Metadata\n' +
    ' */\n' +
    'module.exports = ' + JSON.stringify(metadatas, null, 2) + ';'
  );

  buildGraphQLSpec('src');
}

if (argv.convert) {
  console.log('convert!')
  execute();
}

module.exports = execute;
