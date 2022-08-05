import styled, { StyleSheetManager } from "styled-components"
import React from 'react'
import { Icon } from '@deri/eco-common';
const Wrapper = styled.div`
  padding : 0 8px;
  width :  ${props => props.width}px;
  height : ${props => props.height}px;
  color : ${props => props.color};
  border-color : ${props => props.borderColor};
  background-color : ${props => props.bgColor};
  border-radius : ${props => props.borderRadius}px;
  font-size : ${props => props.fontSize}px;
  border : 1px solid ${props => props.borderColor};
  display : flex;
  align-items : center;
  justify-content: space-around;
  text-align : center;
  .main {
    display : flex;
    align-items : center;
    justify-content: space-around;
    width : 100%;
  }
  img {
    margin-right :8px;
  }
`
export default function Label({ text, width, height, borderColor = '#E0ECFF', color = '#E0ECFF', bgColor, borderRadius = '12', fontSize = '12', icon, className }) {

  return (
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper className={className} width={width} height={height} borderColor={borderColor} color={color} bgColor={bgColor} borderRadius={borderRadius} fontSize={fontSize}>
        <span className='main'>
          {React.isValidElement(icon) ? icon : <Icon token={icon} />}
          {text}
        </span>
      </Wrapper>
    </StyleSheetManager>
  )
}