import './App.css';
import { inject, observer } from 'mobx-react';
import PageRouter from './pages/PageRouter';
import { useLocation } from 'react-router-dom'


function App({intl,actions}) {
  const location = useLocation();
  const curRouterClass = location.pathname.split('/')[1]
  return (
    <div className={`App ${curRouterClass}`}>
      <PageRouter intl={intl} actions={actions}></PageRouter>
    </div>
  );
}

export default inject("intl")(observer(App));
