import React from 'react'
import { inject, observer } from 'mobx-react';
import { isMobile } from 'react-device-detect';

const withLanguage =  Component => {
  class WithLanguage extends React.Component {

    componentDidUpdate(prevProps) {
      if (this.props.location !== prevProps.location) {
        this.onRouteChanged(this.props.location);
      }
    }
  
    onRouteChanged(location) {
    }
    
    render(){
      const {intl,...props} = this.props
      const {dict} = intl
      //如果当前终端为移动端，判断是否存在移动端特殊语言包，如果有覆盖默认的语言包
      if(isMobile){
        for(let item in dict){
          if(dict[item].mobile){
            Object.assign(dict[item],dict[item].mobile)
          }
        }
      }
      return (
      <Component {...props} dict={dict}/>
      )
    }
  }
  return inject('intl')(observer(WithLanguage)) ;
}

export default withLanguage
