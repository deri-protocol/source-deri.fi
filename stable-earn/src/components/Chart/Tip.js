import DeriNumberFormat from "../../utils/DeriNumberFormat"
 const Tip = ({active, payload}) =>{
  if(active && payload && payload.length){
    return(
      <div className="chart-tip">
        <div className="chart-tip-title">
          Net Value
        </div>
        <div className="chart-tip-value">
          <DeriNumberFormat value={payload[0].payload.value} decimalScale={2} />
        </div>
      </div>
    )
  }else{
    return null
  }
}
export default Tip