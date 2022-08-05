import styled, { StyleSheetManager } from 'styled-components';

const BarWrapper = styled.div`
  background : #F3F3F3;
  width : ${props => props.width};
  .process-bar {
    background : ${props => props.background};
    width : ${props => props.percent};
    height: 100%;
    border-radius: 3px;
  }
`
export default function ProcessBar({ width, percent, className, background = '#FFAB00' }) {
  return (
    <StyleSheetManager disableCSSOMInjection>
      <BarWrapper className={className} width={width} percent={percent} background={background}>
        <div className="process-bar"></div>
      </BarWrapper>
    </StyleSheetManager>
  )
}