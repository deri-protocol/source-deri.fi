import { Redirect } from "react-router-dom";

export default function IndexRoute(){
  const url = window.location.href;
  if(/^https?:\/\/(app|alphatest|testnet|v2app)/.test(url)) {
    return  <Redirect to='/futures/pro'/> 
  } else if(/^https?:\/\/governance/.test(url)) {
    return  <Redirect to='/governance'/> 
  } else if(/^https?:\/\/bridge/.test(url)) {
    return  <Redirect to='/bridge'/> 
  } else if(/^https?:\/\/info/.test(url)) {
    return <Redirect to='/info'/>
  }
  return <Redirect to='/index'/>
}