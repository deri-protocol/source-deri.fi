import * as apis from '../web3/index'
import { show, hide } from "react-functional-modal";
import ChainInteraction from "../components/ChainInteraction/ChainInteraction";
import { MODAL_OPTIONS, EVENT_TRANS_BEGIN, EVENT_TRANS_END } from '../utils/Constants'
import Emitter from '../utils/Emitter'
class ApiProxy {
  async request(method, options = {}) {
    let res = null;
    const { subject, title, content } = options
    if (options.write) {
      Object.assign(options, {
        onAccept: (hash) => {
          this.onProcessing(subject, 'success', options)
          window.setTimeout(() => {
            this.close(subject)
            Emitter.emit(EVENT_TRANS_BEGIN, { title: title, content: content, hash: hash })
          }, 2000)
        },
        onReject: () => {
          this.onProcessing(subject, 'reject', options)
          window.setTimeout(() => this.close(subject), 2000)
        }
      })
      this.onProcessing(subject, 'pending', options)
    }
    try {
      res = await apis[method].call(this, options)
    } catch (e) {
      console.log(e)
    }
    res = this.processResponse(res, options)
    if (options.write) {
      Emitter.emit(EVENT_TRANS_END, { title: title, content: content, context: res })
    }
    return res
  }

  syncRequest(method, params = [], options = {}) {
    const res = apis[method].call(this, ...params)
    return this.processResponse(res, options)
  }

  close(subject) {
    hide(this.getMessageKey(subject))
  }

  getMessageKey(subject = '') {
    return `transaction-box-${subject.split(/\s+/).join('-')}`
  }

  onProcessing(subject, status, options) {
    const { direction = 'DEPOSIT', approved } = options;
    const key = this.getMessageKey(subject)
    this.close(key);
    const params = {
      ...MODAL_OPTIONS,
      style: {
        background: "rgba(0, 0, 0, 0.4)",
        zIndex: 11111111,
      },
      key: key
    }
    show(<ChainInteraction title={subject} status={status} direction={direction.toUpperCase()} options={options} approved={approved} close={() => this.close(subject)} />, params)
  }



  processResponse(res, options) {
    if (options.includeResponse) {
      if (res && res.response) {
        return res
      }
    } else {
      if (res && res.response) {
        return res.response.data
      }
    }
    return res
  }
}

export default new ApiProxy();