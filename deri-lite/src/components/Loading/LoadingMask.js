import withModal from "../hoc/withModal"
import './loading.less'

export default withModal(() => (<div className='loading-mask'>
  <div className="snippet" data-title=".dot-pulse">
      <div className="stage">
        <div className="dot-pulse"></div>
      </div>
    </div>
</div>))
