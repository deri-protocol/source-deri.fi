import  {useEffect } from 'react'
import Body from './components/Body/Body'
import './style/index.less'
import useWindowSize from '../hooks/useWindowSize';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'
export default function Mobile ({locale ,actions}){
  const winSize = useWindowSize();
  const location = useLocation();
  const curRouterClass = location.pathname.split('/')[1]
  useEffect(() => {
    document.querySelector('html').setAttribute('style',`font-size : ${winSize.width /375 * 100}px`) 
    return () => {document.querySelector('html').removeAttribute('style')}
  }, [winSize])

  return (
    <div className={`mobile ${curRouterClass} ${locale}`}>
      <Body actions={actions}></Body>
    </div>
  )
}