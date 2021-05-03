import ReactDOM from 'react-dom';
import App from './_app';
import { Provider } from 'react-redux';
import { configureStore } from './store/store';

ReactDOM.render(
  <Provider store={configureStore()}>
      <App />
  </Provider>,
  document.getElementById('root')
);