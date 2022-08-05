import styled, { StyleSheetManager } from 'styled-components'
const Wrapper = styled.div`
    letter-spacing: 3px;
    font-size: ${props => props.size}px;
    font-weight: 900;
    position: relative;
    .down-text,.up-text{
      position:absolute;
      left:0px;
    }
    .up-text{
      color: ${props => props.upColor};
      -webkit-text-stroke:2px #FFF;
      z-index:2;
    }
    .down-text{
      color: ${props => props.downColor};
      text-shadow: 0px 4.57912px 6.86868px ${props => props.bgColor};
      left:5px;
      top:5px;
      -webkit-text-stroke:2px #FFF;
    }
  `
export default function Font({ upColor = "#FF9431", downColor = "rgba(255, 148, 49, 0.3)", size = "103", bgColor = "rgba(255, 148, 49, 0.3)", text }) {
  return (
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper upColor={upColor} downColor={downColor} size={size} bgColor={bgColor}>
        <span className='up-text'>
          {text}
        </span>
        <span className='down-text'>
          {text}
        </span>
      </Wrapper>
    </StyleSheetManager>
  )
}