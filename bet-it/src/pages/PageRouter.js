import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import LoadableComponent from '../utils/LoadableComponent';
import { inject, observer } from 'mobx-react';


// const Home = LoadableComponent(() => import('./Home/Home'))
const BetIt = LoadableComponent(() => import('./BetIt'))
const Test = LoadableComponent(() => import('./Test'))

function PageRouter({ intl,actions }) {
  const getLang = (page, key, params, options) => {
    return intl.eval(page, key, params, options)
  }
  const { dict } = intl
  return (
    <Routes>
      <Route exact path='/' element={<BetIt actions={actions} lang={dict['betit']} getLang={(key, params, options) => getLang('betit', key, params, options)} />}></Route>
    </Routes>
  )
}
export default inject('intl')(observer(PageRouter))