import { useEffect, useState, useRef } from 'react';
import { Icon, Loading } from "@deri/eco-common"
import { inject, observer } from 'mobx-react'
import { formatAddress } from "../../utils/utils"
import Emitter from "../../utils/Emitter";
import { useWallet } from "use-wallet";
import useChain from '../../hooks/useChain'
import { eqInNumber } from "../../utils/utils";
import { EVENT_TRANS_BEGIN, EVENT_TRANS_END } from '../../utils/Constants'
import './transactionState.scss'
export default function TransactionState() {
  const [isShow, setIsShow] = useState(false)
  const [messageInfo, setMessageInfo] = useState({})
  const endTag = useRef()
  const wallet = useWallet()
  const chains = useChain()
  const chain = chains.find((item) => eqInNumber(item.chainId, wallet.chainId))
  const closeBox = () => {
    setIsShow(false)
    setMessageInfo({});
    endTag.current = false
  }
  const onMessageInfoBgein = (data) => {
    setIsShow(true)
    let info = {}
    if (endTag.current) {
      endTag.current = false
      return;
    }
    info["link"] = `${chain.viewUrl}/tx/${data.hash}`
    info["hash"] = data.hash
    info["title"] = data.title.processing
    info["content"] = data.content.success
    info["type"] = "processing"
    setMessageInfo(info)
  }
  const onMessageInfoEnd = (res) => {
    let info = {}
    if (!res.context) {
      closeBox()
      return false;
    }
    endTag.current = true
    if (res.context.success) {
      info["type"] = "success"
      info["content"] = res.content.success
      if (res.content.isPrice) {
        info["content"] = `${res.content.success}`
      }
      info["title"] = res.title.success
      info["hash"] = res.context.response.data.transactionHash
      info["link"] = `${chain.viewUrl}/tx/${res.context.response.data.transactionHash}`
    } else {
      if (res.context.response.transactionHash === "") {
        closeBox(false)
        return;
      }
      info["type"] = "error"
      info["title"] = res.title.error
      info["content"] = `${res.content.error} : ${res.context.response.error.message}`
      info["hash"] = res.context.response.transactionHash
      info["link"] = `${chain.viewUrl}/tx/${res.context.response.transactionHash}`
    }
    setMessageInfo(info)
    setIsShow(true)
  }
  useEffect(() => {
    Emitter.on(EVENT_TRANS_BEGIN, onMessageInfoBgein)
    Emitter.on(EVENT_TRANS_END, onMessageInfoEnd)
    return () => {
      Emitter.off(EVENT_TRANS_BEGIN, onMessageInfoBgein)
      Emitter.off(EVENT_TRANS_END, onMessageInfoEnd)
    }
  }, [chain])
  useEffect(() => {
    let timer
    if (messageInfo.type === "success") {
      timer = window.setTimeout(() => {
        closeBox();
        console.log("closeBox")
      }, 8000)
    }else {
      timer = window.setTimeout(() => {
        endTag.current = false
      }, 2000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [messageInfo])
  return (
    <>
      {isShow ? <div className='transaction-state'>
        <div className='message-title'>
          <div className='icon message-title-text'>
            {messageInfo.type === 'success' && <Icon token='success' width={16} height={16} />}
            {messageInfo.type === 'error' && <Icon token='error' width={16} height={16} />}
            {messageInfo.type === 'processing' && <Loading borderColor="rgba(55, 125, 255, 1)" bgColor="rgba(55, 125, 255, 0.1)" />}
            {messageInfo.title}
          </div>
          <div className={messageInfo.type !== 'success' ? 'close noAnimation' : 'close'} onClick={closeBox}>
            <div className='close-icon'>
              <Icon token="close" width='7' />
            </div>
            <div className={messageInfo.type === 'success' ? "circle_process animation" : "circle_process"}>
              <div className="wrapper right">
                <div className="circle rightcircle"></div>
              </div>
              <div className="wrapper left">
                <div className="circle leftcircle" id="leftcircle"></div>
              </div>
            </div>
          </div>
        </div>
        <div className='message-text-link'>
          <div className='message-text-box'>
            <div className='message-text'>
              {messageInfo.content}
            </div>
            <div className={messageInfo.type === 'success' ? 'link' : messageInfo.type === "error" ? 'link error' : "link processing"}>
              <a rel='noreferrer' target='_blank' href={messageInfo.link}>Click here to view transaction {formatAddress(messageInfo.hash)}</a>
            </div>
          </div>

        </div>
      </div> : null}
    </>

  )
}
