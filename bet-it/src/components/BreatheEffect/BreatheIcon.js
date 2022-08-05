import styled, { StyleSheetManager } from 'styled-components'
import { Icon } from '@deri/eco-common';
export default function BreatheIcon({ rgb, icon }) {

  const Wrapper = styled.div`
    &.anim-circle {
      color: transparent;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(${props => props.rgb},0.983);
      animation: breathe 4s linear infinite;
      display : flex;
      justify-content: center;
      align-items: center;
    }
    @keyframes breathe {
      0% {
        box-shadow: 
          0 0 0 4px rgba(${props => props.rgb},0.3),
          0 0 0 8px rgba(${props => props.rgb},0.3),
          0 0 0 12px rgba(${props => props.rgb},0.1);
      }
      50% {
        box-shadow: 
          0 0 0 8px rgba(${props => props.rgb},0.3), 
          0 0 0 16px rgba(${props => props.rgb},0.3), 
          0 0 0 22px rgba(${props => props.rgb},0.1);
      }
      100% {
        box-shadow: 
          0 0 0 4px rgba(${props => props.rgb},0.3), 
          0 0 0 8px rgba(${props => props.rgb},0.3),
          0 0 0 12px rgba(${props => props.rgb},0.1);
      }
    }
  `
  return (
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper className='anim-circle' rgb={rgb}>
        <Icon token={icon} width='22' height='22' />
      </Wrapper>
    </StyleSheetManager>
  )
}