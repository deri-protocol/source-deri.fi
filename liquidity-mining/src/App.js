import './App.css';
import { inject, observer } from 'mobx-react';
import PageRouter from './pages/PageRouter';
import { useLocation } from 'react-router-dom'


export default function App({actions}) {
  const location = useLocation();
  const curRouterClass = location.pathname.split('/')[1]
  return (
    <div className={`App ${curRouterClass}`}>
      <PageRouter  actions={actions}></PageRouter>
    </div>
  );
}

