import './loading.scss';
import  styled from 'styled-components';

const Spinner = styled.div`
  &.spinner {
    background : ${props => props.bgColor};
    border : 1px solid ${props => props.borderColor};
  }
`

export default function Loading({bgColor = 'rgba(255, 171, 0, 0.5)',borderColor = 'rgba(255, 171, 0, 0.5)'}){
  return (
    <Spinner className="spinner" bgColor={bgColor} borderColor={borderColor}>
      {Array.from(Array(9)).map((i,index) => <div className={`bar${index+1}`}></div>)}
    </Spinner>
  )
}