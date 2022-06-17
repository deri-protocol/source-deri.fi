import './loading.scss'
import loadingPic from '../../assets/img/loading.png'

export default function Loading(){
  return (
    <div className='loading-pic'>
      <img src={loadingPic} />
    </div>
  )
}