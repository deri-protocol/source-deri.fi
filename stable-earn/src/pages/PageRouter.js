import React from 'react';
import { Routes, Route } from 'react-router-dom'
import LoadableComponent from '../utils/LoadableComponent';
import { inject, observer } from 'mobx-react';


// const Home = LoadableComponent(() => import('./Home/Home'))
const StableEarn = LoadableComponent(() => import('./StableEarn'))

function PageRouter({ intl,actions }) {
  const getLang = (page, key, params, options) => {
    return intl.eval(page, key, params, options)
  }
  const { dict } = intl
  return (
    <Routes>
      <Route exact path='/' element={<StableEarn actions={actions} lang={dict['stable-earn']} getLang={(key, params, options) => getLang('dip-hunter', key, params, options)} />}></Route>
    </Routes>
  )
}
export default inject('intl')(observer(PageRouter))