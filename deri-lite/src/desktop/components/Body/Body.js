import React from 'react';
import { withRouter, Switch,Route,Redirect} from 'react-router-dom'
import LoadableComponent from '../../../utils/LoadableComponent'
import './body.css'
import withLanguage from '../../../components/hoc/withLanguage';
import IndexRoute from '../../../components/IndexRoute/IndexRoute';



const Lite = LoadableComponent(()=>import('../../pages/trade/Lite/Lite')) 


@withRouter
@withLanguage
class Body extends React.Component {

  render(){
    const {dict} = this.props  
    return (
      <div className='body'>
        <Switch >
          <Route exact path='/' component={() => <Lite lang={dict['lite']}/>}/>
        </Switch>
      </div>
    )
  }
}
export default Body