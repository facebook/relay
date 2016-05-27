module.exports = {
  'parser': 'babel-eslint',
  'rules': {
    'graphql/template-strings': ['error', {
      schemaJson: require('./data/schema.json'),
      env: 'relay'
    }]
  },
  plugins: [
    'graphql'
  ],
  root: true
}
