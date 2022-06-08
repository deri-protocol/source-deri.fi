import { initGlobalState } from 'qiankun';

const initialState = {};
const actions = initGlobalState(initialState);

actions.getGlobalState = (key) => {
  return key ? initialState[key] : initialState;
}

export default actions;
