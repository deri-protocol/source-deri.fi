import './spinner.scss'
import styled, { StyleSheetManager } from 'styled-components'
const Wrapper = styled.div`
  width : ${props => props.width}px;
  height : ${props => props.height}px;
`
export default function Spinner({ width = 16, height = 16 }) {

  return (
    <StyleSheetManager disableCSSOMInjection>
      <Wrapper className='spinner-border' width={width} height={height} />
    </StyleSheetManager>
  )
}