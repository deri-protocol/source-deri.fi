import React, { useState, useEffect } from 'react'
import styled,{StyleSheetManager} from 'styled-components'
import { PRIMARY, SECONDARY } from '../../utils/Constants';
import classNames from 'classnames';
import Loading from '../Loading/Loading';
import UnderlineText from '../UnderlineText/UnderlineText';
import Icon from '../Icon/Icon';
const Wrapper = styled.div`
    position : ${props => props.position ? props.position : 'initial'};
    bottom : ${props => props.position ? '8px' : '0px'};
    display : flex;
    align-items : center;
    justify-content: center;
    border-radius: ${props => props.radius}px;
    background-color : ${props => props.pending ? props.hoverBgColor : props.backgroundColor};
    font-size : ${props => props.fontSize}px;
    font-weight : ${props => props.fontWeight};
    color : ${props => props.pending ? '#fff' : props.fontColor};
    width : ${props => props.width}px;
    border: ${props => props.borderSize}px solid ${props => props.defaultBorderColor};
    // border : 1px solid ${props => props.backgroundColor};
    height : ${props => props.height}px;
    opacity : ${props => props.pending ? '0.5' : '1'};
    img{
      margin-right:4px;
      margin-left:4px;
    }
    .spinner{
      margin-left:4px;
    }
    &:hover {
      border : 1px solid ${props => props.hoverBorderColor};
      cursor: pointer;
      background-color: ${props => props.hoverBgColor};
      color : #fff;
    }
    &.selected {
      border : 1px solid ${props => props.selectedBorderColor || props.hoverBorderColor};
    }
    &.disabled:hover {
      // border : none!important;
    }
    &.disabled {
      background : rgba(85, 119, 253, 0.1);
      border : none;
      cursor : not-allowed;
    }
  `
export default function Button({ label, fontColor = '#E0ECFF', isAlert = false, type = PRIMARY, bgColor, hoverBgColor, selectedBorderColor, position, defaultBorderColor = '#203B60', borderSize = 1, disabled = false, outline = false, isSelected = false, outlineColor = 'rgba(205, 122, 55, 0.5)', icon, tip, tipIcon, disabledIcon, disabledTipIcon, hoverIcon, hoverTipIcon, onClick, width = 158, fontSize = 14, fontWeight = '600', height = 48, className, styles = {}, radius = 4 }) {
  const [pending, setPending] = useState(false)
  const [isHover, setIsHover] = useState(false)
  let backgroundColor;
  if (bgColor) {
    backgroundColor = bgColor;
  } else if (type === PRIMARY) {
    backgroundColor = '#3756CD';
  } else if (type === SECONDARY) {
    backgroundColor = '#203B60'
  }
  const hoverBorderColor = outline ? outlineColor : 'none';
  const hover = (value) => {

  }
  const click = async (e) => {
    if (onClick && !pending && !disabled) {
      setPending(true);
      const result = await onClick(e);
      setPending(false)
    }
    if (isAlert && disabled) {
      const result = await onClick(e);
    }
  }
  const clazz = classNames(className, {
    selected: isSelected,
    disabled: disabled
  })
  return (
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper hoverBorderColor={hoverBorderColor}
        selectedBorderColor={selectedBorderColor}
        backgroundColor={backgroundColor}
        hoverBgColor={hoverBgColor}
        fontColor={fontColor}
        fontSize={fontSize}
        fontWeight={fontWeight}
        pending={pending}
        width={width}
        position={position}
        defaultBorderColor={defaultBorderColor}
        borderSize={borderSize}
        onMouseMove={() => { setIsHover(true) }}
        onMouseOut={() => { setIsHover(false) }}
        radius={radius}
        height={height} className={clazz} style={{ ...styles }} onClick={click}>
        {icon && <Icon token={disabled ? disabledIcon ? disabledIcon : icon : isHover ? hoverIcon ? hoverIcon : icon : pending ? hoverIcon ? hoverIcon : icon : icon} />}<span>{label}</span>  {tip && <UnderlineText multiline={true} tip={tip}> <Icon token={disabled ? disabledTipIcon ? disabledTipIcon : tipIcon : isHover ? hoverTipIcon ? hoverTipIcon : tipIcon : pending ? hoverTipIcon ? hoverTipIcon : tipIcon : tipIcon} /> </UnderlineText>}{pending && <Loading borderColor="#FFFFFF" bgColor="rgba(255, 255, 255, 0.3)" />}
      </Wrapper>
    </StyleSheetManager>
  )
}