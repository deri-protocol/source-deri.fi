
const paddingDate = (date) => {
  date = date.toString()
  if (date.length === 1) {
    return '0' + date
  } else {
    return date
  }
}
export const getEpochTimeRange = (time) => {
  //console.log('1', time.getTime()/1000)
  const year = time.getUTCFullYear()
  const month = time.getUTCMonth()
  const day = time.getUTCDate()
  let epochs = []
  for (let i = 0; i< 3; i++) {
    const newDate = new Date(`${year}-${paddingDate(month + 1)}-${paddingDate(day)}T${paddingDate(8*i)}:00:00Z`)
    //console.log(newDate.getTime()/1000)
    epochs.push(newDate)
  }
  epochs.push(new Date(`${year}-${paddingDate(month + 1)}-${paddingDate(day+1)}T00:00:00Z`))
  let index = -1
  for (let i = 0; i< epochs.length; i++) {
    //console.log(i, epochs[i].getTime()/1000)
    if (time.getTime() < epochs[i].getTime()) {
      index = i
      break
    }
  }
  if (index !== -1) {
    return [epochs[index - 1].getTime()/1000, epochs[index].getTime()/1000]
  }
  throw new Error(`getEpochTimeRange(): cannot get epoch range for time ${time}`)
}