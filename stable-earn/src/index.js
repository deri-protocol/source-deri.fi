import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import './index.css';
import App from './App';
function getBetitRootContainer(container) {
  return container ? container.querySelector('#stable-earn-root') : document.querySelector('#stable-earn-root');
}
function render(props) {
  const { container, name = "" } = props;
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter basename={name}>
        <App {...props} />
      </HashRouter>
    </React.StrictMode>,
    getBetitRootContainer(container)
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
  ReactDOM.unmountComponentAtNode(getBetitRootContainer(container));
}


