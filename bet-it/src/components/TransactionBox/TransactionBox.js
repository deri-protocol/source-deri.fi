import BreatheIcon from "../BreatheEffect/BreatheIcon";
import './transactionBox.scss'
import { Icon, Loading } from '@deri/eco-common';
import { useState, useEffect } from "react";
import classNames from "classnames";
import Label from '../Label/Label';
import styled, { StyleSheetManager } from 'styled-components';
import ProcessBar from "../ProcessBar/ProcessBar";

export default function TransactionBox({ title, subTitle, icon, rgb, close, direction, approved, status, options = {} }) {
  const [current, setCurrent] = useState(rgb)
  const iconClass = classNames('trans-box-content-icon', {
    'trans-box-content-icon-fadeout': current !== rgb
  })
  const subTitleClass = classNames('trans-box-content-bold', {
    'trans-box-content-bold-slideout': current !== rgb
  })
  const descClass = classNames('trans-box-content-desc', {
    'trans-box-content-desc-slideout': current !== rgb
  })
  useEffect(() => {
    setCurrent(rgb)
  }, [rgb])

  return (
    <div className='trans-box'>
      <div className='trans-box-title'>
        {title}
        <Icon token='trans-close' height='10' width='10' className='close-icon' onClick={close} />
      </div>
      <div className='trans-box-content'>
        <div className={iconClass}>
          <BreatheIcon icon={icon} rgb={rgb} key={new Date().getTime()} />
        </div>
        <div className={subTitleClass}>{subTitle}</div>
        <ApproveStatus direction={direction} approved={approved} status={status} />
        {options.approveTip && <div className='trans-box-content-approve-tip'><Icon className='icon' token='approve-warn' />{options.approveTip}</div>}
      </div>
    </div>
  )
}

const StatusBarWrapper = styled.div`
  &.status-bar {
    display : flex;
    flex-direction : row;
    justify-content: center;
    margin-top : 30px;
    align-items : center;
    .approve-label ,.process-bar-wrapper {
      display : none;
    }

    .process-bar-wrapper {
      width : 120px;
      height : 6px;
      margin : 0 8px;
      border-radius : 3px;
    }
    &.approving ,&.approved {
      .approve-label {
        border: 1.5px solid rgba(255, 171, 0, 0.2);
      }
      .approve-label,.process-bar-wrapper {
        display : flex;
      }
    }

    &.pending {
      .approve-label ,.direction-label {
        background : rgba(255, 171, 0, 0.2);
        color : rgba(255, 171, 0, 0.6);
      }
      &.approving .direction-label {
        background: rgba(196, 196, 196, 0.2);
        border: 1.5px solid rgba(176, 183, 195, 0.5);
        color : #C8C8C8;
        .main {
          width : auto;
        }
        .spinner {
          display :none;
        }
      }
      &.approved {
        .approve-label {
          background: rgba(196, 196, 196, 0.2);
          border: 1.5px solid rgba(176, 183, 195, 0.5);
          color : #C8C8C8;
          .spinner {
            display :none;
          }
        }
        .process-bar-wrapper .process-bar {
          width : 80%;
        }
      }
    }
    &.success {
      &.approving {
        .approve-label {
          background : #38CB89;
          border : 0px;
          display : flex;
          color : #fff;
        }
        .process-bar-wrapper .process-bar {
          background : #38CB89;
        }
        .direction-label {
          background: rgba(196, 196, 196, 0.2);
          border: 1.5px solid rgba(176, 183, 195, 0.5);
          color : #C8C8C8;
          img {
            display :none;
          }
        }
      }
      &.approved {
        .approve-label {
          background : #38CB89;
          border : 0px;
          display : flex;
          color : #fff;
        }
        .process-bar-wrapper .process-bar {
          background : #38CB89;
          width : 100%;
        }
      }
    }
    &.reject {
      &.approving {
        .approve-label {
          background : #FF5630;
          border : 0px;
          display : flex;
          color : #fff;
        }
        .process-bar-wrapper .process-bar {
          background : rgba(196, 196, 196, 0.2);
        }
        .direction-label {
          background: rgba(196, 196, 196, 0.2);
          border: 1.5px solid rgba(176, 183, 195, 0.5);
          color : #C8C8C8;
          .spinner,img {
            display :none;
          }
        }
      }
      &.approved {
        .approve-label {
          background: rgba(196, 196, 196, 0.2);
          border: 1.5px solid rgba(176, 183, 195, 0.5);
          color : #C8C8C8;
          img {
            display :none;
          }
        }
        .process-bar-wrapper .process-bar {
          background : none;
        }
      }
    }
  }

  &.status-bar .direction-label {
    border :1.5px solid rgba(255, 171, 0, 0.2);
    border-radius: 15px;
    color :#FFFFFF;
  }
  
  &.status-bar.success .direction-label {
    background : #38CB89;
  }
  &.status-bar.reject .direction-label{
    background : #FF5630;
  }

`


function ApproveStatus({ approved, direction, status }) {
  const [transStatusIcon, setTransStatusIcon] = useState()
  const [approveStatusIcon, setApproveStatusIcon] = useState()
  const [approveLabel, setApproveLabel] = useState('APPROVE')


  const statusBarClass = classNames('status-bar', status, {
    approving: approved === false,
    approved: approved === true
  })

  useEffect(() => {
    if (status === 'pending') {
      if (approved) {
        setApproveStatusIcon('trans-disabled-success');
        setTransStatusIcon(<Loading />)
      } else {
        setApproveStatusIcon(<Loading />);
        setTransStatusIcon(<Loading />)
      }
    } else if (status === 'success') {
      if (approved) {
        setApproveStatusIcon('trans-success');
        setTransStatusIcon('trans-success');
      } else {
        setTransStatusIcon('trans-success');
      }
    } else {
      setTransStatusIcon('reject-close')
      setApproveStatusIcon('reject-close');
      setApproveLabel('REJECT')
    }

  }, [status])


  return (
    <StyleSheetManager disableCSSOMInjection>
      <StatusBarWrapper className={statusBarClass}>
        <Label text={approveLabel} className='approve-label' width='94' height='30' icon={approveStatusIcon} />
        <ProcessBar className='process-bar-wrapper' percent='50%' width='120px' />
        <Label text={direction} className='direction-label' icon={transStatusIcon} width='90' height='30' />
      </StatusBarWrapper>
    </StyleSheetManager>

  )
}