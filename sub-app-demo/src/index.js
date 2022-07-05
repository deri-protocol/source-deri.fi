import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './public-path.js';
import { HashRouter } from 'react-router-dom';

function getSubRootContainer(container) {
  return container ? container.querySelector('#sub-root') : document.querySelector('#sub-root');
}

function render(props) {
  const { container,name ='' } = props;
  const root = ReactDOM.createRoot(getSubRootContainer(container))
  root.render(
    // <React.StrictMode>
      <HashRouter basename={name}>
        <App {...props} />
      </HashRouter>
    // </React.StrictMode>
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('react app bootstraped');
}

export async function mount(props) {
  console.log('props from main framework', props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  const root = ReactDOM.createRoot(getSubRootContainer(container))
  root.unmount();
}
