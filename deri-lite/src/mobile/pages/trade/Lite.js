
import LiteTrade from "../../../components/Trade/LiteTrade";
import './lite.less'
import AreaPicker from "../../../components/AreaPicker/AreaPicker";
import leftMenu from "../../../assets/img/left-menu.svg"

function Lite({ lang, actions }) {
  const switchMenu = () => {
    console.log("actions.getGlobalState('menuStatus')", actions.getGlobalState('menuStatus'),actions)
    const status = !actions.getGlobalState('menuStatus')
    actions.setGlobalState({ 'menuStatus': status })
    console.log("actions.getGlobalState('menuStatus')", actions.getGlobalState('menuStatus'),actions)
  }
  return (
    <div className='trade-container'>
      <div onClick={switchMenu} className='let-menu'>
        <img src={leftMenu} alt="menu" />
      </div>
      <AreaPicker lang={lang} />
      <div className='trade-body'>
        <LiteTrade lang={lang} actions={actions} />
      </div>
    </div>
  )

}

export default Lite