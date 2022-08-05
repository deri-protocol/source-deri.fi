import styled, { StyleSheetManager } from "styled-components"
import { Icon } from '@deri/eco-common';
import { formatAddress } from "../../utils/utils"
import './message.scss'

const Wraper = styled.div`
  display : flex;
  align-items : center;
  width: 288px;
  height: 71px;
  font-size : 14px;
  color : #E0ECFF;
  background: #FFFFFF;
  box-sizing: border-box;
  box-shadow: 0px 50px 77px rgba(176, 183, 195, 0.22);
  border-radius: 8px;
  img {
    margin-left : 24px;
    margin-right : 16px;
  }
`
export default function MessageTemplate({ style, options, message, close }) {
  return (
    <>
      {options.isTransaction && <div className='transaction-message'>
        <div className='message-title'>
          <div className='icon message-title-text'>
            {options.type === 'success' && <Icon token='success' width={16} height={16} />}
            {options.type === 'error' && <Icon token='error' width={16} height={16} />}
            {options.title}
          </div>
          <div className={options.type === 'error' ? 'close noAnimation' : 'close'} onClick={close}>
            <div className='close-icon'>
              <Icon token="close" width='7' />
            </div>
            <div className={options.type === 'error' ? "circle_process" : "circle_process animation"}>
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
              {message}
            </div>
            {options.transactionHash ? <div className={options.type === 'success' ? 'link' : 'link error'}>
              <a target='_blank' href={options.link}>Click here to view transaction {formatAddress(options.transactionHash)}</a>
            </div> : ""}
          </div>

        </div>
      </div>}
      {!options.isTransaction && <StyleSheetManager disableCSSOMInjection>
        <Wraper style={style}>
          {options.type === 'success' && <Icon token='success' width={25} height={25} />}
          {options.type === 'error' && <Icon token='error' width={25} height={25} />}
          {message}
        </Wraper>
      </StyleSheetManager>}
    </>

  )
}