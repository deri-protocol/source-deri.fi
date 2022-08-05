import ReactTooltip from "react-tooltip";
import styled, { StyleSheetManager } from "styled-components";
import React ,{ useRef } from "react";

const Wrapper = styled(ReactTooltip)`
  &.__react_component_tooltip{
    padding : 0;
  }
  &.__react_component_tooltip.show {
    // position : absolute;
    opacity: 1;
    width : ${props => props.width || 216}px;
    padding : ${props => props.padding}px;
    border-radius: ${props => props.borderRadius}px;
    max-width : ${props => window.screen.availWidth}px;
    z-index : ${props => props.zIndex || 2};
    color : ${props => props.color};
    white-space: initial;
    font-weight : 500;
    font-size : 10px;
  }
  &.__react_component_tooltip.show::after{
    content: none;
  }
  &.__react_component_tooltip.show.place-right{
    margin: 0px;
  }
  &.__react_component_tooltip .multi-line{
    text-align : left;
  }
  &.__react_component_tooltip.show.place-bottom {
    margin : 4px;
  }
`

const Tooltip = React.forwardRef((props,ref) =>{
  const {effect = 'solid' ,place = 'bottom',className = 'tooltip',type = 'info',globalEventOff= 'click',padding,backgroundColor = '#FFFFF',color,...rest} = props
  return(
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper {...rest} ref={ref} effect={effect} place={place} globalEventOff ='click' className={className} type={type}  color={color} backgroundColor={backgroundColor} padding={padding} clickable width={props.width}>
        {props.children}
      </Wrapper>
    </StyleSheetManager>
  )
})

export default Tooltip