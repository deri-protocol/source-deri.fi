import DeriNumberFormat from "../../utils/DeriNumberFormat"
const getMonth = (month) => {
  let monthText;
  switch (month) {
    case 1:
      monthText = "Jan"
      break;
    case 2:
      monthText = "Feb"
      break;
    case 3:
      monthText = "Mar"
      break;
    case 4:
      monthText = "Apr"
      break;
    case 5:
      monthText = "May"
      break;
    case 6:
      monthText = "Jun"
      break;
    case 7:
      monthText = "Jul"
      break;
    case 8:
      monthText = "Aug"
      break;
    case 9:
      monthText = "sep"
      break;
    case 10:
      monthText = "Oct"
      break;
    case 11:
      monthText = "Nov"
      break;
    case 12:
      monthText = "Dec"
      break;
    default:
      break;
  }
  return monthText
}
const Tip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    let date = new Date(payload[0].payload.timestamp * 1000)
    let month = date.getMonth() + 1;
    month = getMonth(month)

    let h = date.getHours();
    let day = date.getDate();
    let mm = date.getMinutes();
    let str;
    if (h > 12) {
      h -= 12;
      str = " PM";
    } else {
      str = " AM";
    }
    h = h < 10 ? "0" + h : h;
    day = day < 10 ? "0" + day : day;
    mm = mm < 10 ? "0" + mm : mm;
    let dateText = `${day} ${month} ${h} : ${mm} ${str} `
    return (
      <div className="chart-tip">
        <div className="chart-tip-title">
          Net Value
        </div>
        <div className="chart-tip-value">
          <DeriNumberFormat value={payload[0].payload.value} decimalScale={2} />
        </div>
        <div className="chart-tip-time">
          {dateText}
        </div>
      </div>
    )
  } else {
    return null
  }
}
export default Tip