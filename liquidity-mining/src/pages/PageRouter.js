import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import LoadableComponent from '../utils/LoadableComponent';
import { inject, observer } from 'mobx-react';


// const Home = LoadableComponent(() => import('./Home/Home'))
const ComingSoon = LoadableComponent(() => import('./ComingSoon'))

export default function PageRouter({ actions }) {

  return (
    <Routes>
      <Route exact path='/' element={<ComingSoon actions={actions} />}></Route>
    </Routes>
  )
}