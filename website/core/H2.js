/**
 * @providesModule H2
*/

var React = require('React');
var Header = require('Header');

var H2 = React.createClass({
  render: function() {
    return <Header {...this.props} level={2}>{this.props.children}</Header>
  }
});

module.exports = H2;
