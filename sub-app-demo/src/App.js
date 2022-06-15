import logo from './logo.svg';
import './App.css';
import menu from './assets/img/menu.svg'
import { useState } from 'react'
import Test from './test/Test';


function App(props) {
  const { actions } = props
  const open = () => {
    console.log("actions.getGlobalState('menuStatus')", actions.getGlobalState('menuStatus'),actions)
    const status = !actions.getGlobalState('menuStatus')
    actions.setGlobalState({ 'menuStatus': status })
    console.log("actions.getGlobalState('menuStatus')", actions.getGlobalState('menuStatus'),actions)
  }

  return (
    <div className="App">
      <header className="App-header">
        <img className='menu' src={menu} onClick={open} />
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          This is react sub app's demo for deri.fi.
        </p>
      </header>
    </div>
  );
}

export default App;
