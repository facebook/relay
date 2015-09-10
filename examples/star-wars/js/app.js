import 'babel/polyfill';
import StarWarsApp from './components/StarWarsApp';
import StarWarsAppHomeRoute from './routes/StarWarsAppHomeRoute';

ReactDOM.render(
  <Relay.RootContainer
    Component={StarWarsApp}
    route={new StarWarsAppHomeRoute({
      factionNames: ['empire', 'rebels']
    })}
  />,
  document.getElementById('root')
);
