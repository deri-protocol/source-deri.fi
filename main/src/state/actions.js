import { initGlobalState } from 'qiankun';


const initialState = {};
const actions = initGlobalState(initialState);
const callbacks = []

actions.getGlobalState = (key) => {
  return key ? initialState[key] : initialState;
}
actions.setGlobalState = state => {
  const prev = Object.assign({},initialState) 
  Object.assign(initialState,state)
  callbacks.forEach(callback => {    
    callback(initialState,prev)
  });
}

actions.onGlobalStateChange = callback => {
  if(!callbacks.find(c => c == callback)) {
    callbacks.push(callback)
  }
}

export default actions;
