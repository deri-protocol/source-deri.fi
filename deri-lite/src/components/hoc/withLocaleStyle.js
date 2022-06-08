import React from 'react';

const withLocaleStyle = Component => page => {
  class WithLocaleStyle extends React.Component {

    componentDidMount() {
      
    }
    
    render(){
      return(
        <Component {...this.props}></Component>
      )
    }
  }
  return WithLocaleStyle;
}

export default withLocaleStyle;