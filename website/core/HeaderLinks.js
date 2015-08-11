/**
 * @providesModule HeaderLinks
*/

var HeaderLinks = React.createClass({
  links: [
    {section: 'docs', href: '/relay/docs/getting-started.html#content', text: 'Docs'},
    {section: 'support', href: '/relay/support.html', text: 'Support'},
    {section: 'github', href: 'https://github.com/facebook/relay', text: 'GitHub'},
  ],

  render: function() {
    return (
      <ul className="nav-site">
        {this.links.map(function(link) {
          return (
            <li key={link.section}>
              <a
                href={link.href}
                className={link.section === this.props.section ? 'active' : ''}>
                {link.text}
              </a>
            </li>
          );
        }, this)}
      </ul>
    );
  }
});

module.exports = HeaderLinks;
