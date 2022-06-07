import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import './public-path.js';
import { HashRouter } from 'react-router-dom';
function getSubRootContainer(container) {
  return container ? container.querySelector('#sub-root') : document.querySelector('#sub-root');
}

function render(props) {
  const { container } = props;
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter basename='/sub-app-demo'>
        <App store={{...props}} />
      </HashRouter>
    </React.StrictMode>

    ,getSubRootContainer(container)
  );
}

function storeTest(props) {
  props.onGlobalStateChange((value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev), true);
  props.setGlobalState({
    ignore: props.name,
    user: {
      name: props.name,
    },
  });
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('react app bootstraped');
}

export async function mount(props) {
  console.log('props from main framework', props);
  storeTest(props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  const root = ReactDOM.createRoot(getSubRootContainer(container))
  root.unmount(getSubRootContainer(container));
}
