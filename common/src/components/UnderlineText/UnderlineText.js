/* eslint-disable react/no-danger-with-children */
import styled, { StyleSheetManager } from 'styled-components';
import ReactDOMServer from 'react-dom/server';
import Tooltip from '../Tooltip/Tooltip';
import {isMobile} from '../../utils/utils';
import {isWindows} from 'react-device-detect'
import { useCallback, useState } from 'react';

const Wrapper = styled.div`
  display:${props => props.block};
  .text {
    border-bottom : ${props => props.bottomLine && '1px dashed #93A1B8'};
    width : max-content;
    cursor : pointer;
    display:${props => props.block}
  }
  
  .__react_component_tooltip.tooltip.show {
    font-weight : 400;
    box-shadow: rgba(176, 183, 195, 0.14) 0px 8px 24px;
    background: #fff; 
  }
`


export default function UnderlineText({bottomLine, text, id = String(new Date().getTime()) + Math.random(), tip, multiline, html, className, element = '', block = 'block', width = 'auto', children, tiggerEvent }) {
  const [tooltip, showTooltip] = useState(true);
  const calculatePosition = (position, currentEvent, currentTarget, refNode, place, desiredPlace, effect, offset) => {
    const rect = currentTarget.getBoundingClientRect();
    const tooltipNodeRect = refNode.getBoundingClientRect();
    //位置被遮盖
    let { x: left, y: top, height, width } = rect
    const { left: originLeft, top: originTop } = position
    // top = top + height
    if (left + tooltipNodeRect.width / 2 > document.documentElement.clientWidth) {
      left = left - Math.abs(width - tooltipNodeRect.width);
    } else if (left - (tooltipNodeRect.width - width) / 2 < 0) {
      left = left - width
    } else {
      left = left - (tooltipNodeRect.width - width) / 2
    }
    if (top + height + tooltipNodeRect.height >= document.documentElement.clientHeight) {
      top = top + height - tooltipNodeRect.height
    } else {
      top = top + height
    }
    if (left < 0) {
      left = 0
    }
    if (top < 0) {
      top = 0
    }
    return { top: top, left: left }
  }

  return (
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper className={className} block={block} isWin={isWindows} bottomLine={bottomLine}>
        <div className='text' data-for={id}
          data-tip={ html ? ReactDOMServer.renderToString(element) : tip} data-event-off='click' data-event={isMobile() ? 'click' : tiggerEvent} data-html={html} >
          {text || children}
        </div>
        {tooltip && tip && <Tooltip id={id} width={width} padding='12' place='bottom' color='rgba(0, 0, 0, 0.3)' overridePosition={calculatePosition} html={html} borderRadius={8} multiline={multiline}>
        </Tooltip>}
      </Wrapper>
    </StyleSheetManager>
  )
}