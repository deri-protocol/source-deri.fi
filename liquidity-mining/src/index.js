import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import { Provider } from 'mobx-react';
import { HashRouter } from 'react-router-dom'
function getBetitRootContainer(container) {
  return container ? container.querySelector('#betit-root') : document.querySelector('#betit-root');
}


function render(props) {
  const { container, name = "" } = props;
  ReactDOM.render(
    <React.StrictMode>
      <HashRouter basename={name}>
          <Provider>
            <App {...props} />
          </Provider>
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
