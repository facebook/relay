import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {RelayEnvironmentProvider} from 'react-relay';
import RelayEnvironment from './RelayEnvironment.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 
    This places the Relay store in React context so that children components can
    use Relay hooks to fetch/read data.
    */}
    <RelayEnvironmentProvider environment={RelayEnvironment}>
      <App />
    </RelayEnvironmentProvider>
  </StrictMode>,
);
