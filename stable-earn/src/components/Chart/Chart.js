import { useState, useEffect, useCallback } from "react"
import { LineChart, XAxis, YAxis, Tooltip, Line, ResponsiveContainer } from 'recharts'
import { gql } from "graphql-request"
import { graph_request_test } from "../../utils/graph_api"
import dateFormat from 'dateformat';
import './chart.scss'
import Tip from './Tip'
import classNames from "classnames"
import { Icon } from "@deri/eco-common"
import { hide } from "react-functional-modal";
export function Chart(wallet) {
  const [data, setData] = useState(null)
  const [day, setDay] = useState("all")
  const [Ydomain, setYdomain] = useState([0, 'auto'])
  const load = useCallback(async () => {
    let query = gql`
      query($fromTimestamp:Int!,$chainId:Int!,$isDeposit:Boolean){
        stableEarnValues(where : {fromTimestamp : $fromTimestamp,chainId:$chainId,isDeposit:$isDeposit}){
          block
          chainId
          fundAddress
          isDeposit
          positionValue
          shareValue
          timestamp
          totalValue
          amountB0
        }
      }
    `
    let vChainId = 56;
    let timestamp = 0;
    let now = new Date()
    now = now.getTime() / 1000
    let daysTime = 86400
    if (day === "7") {
      timestamp = now - (daysTime * 7)
    }
    if (day === "30") {
      timestamp = now - (daysTime * 30)
    }
    if (wallet.account) {
      vChainId = wallet.chainId
    }
    let variables = { fromTimestamp: parseInt(timestamp), chainId: vChainId, isDeposit: true };
    let data = await graph_request_test(query, variables);
    console.log("stableEarnValues", data)
    if (data.stableEarnValues.length) {
      let list = [];
      let i = 0
      while (i < data.stableEarnValues.length) {
        list.push(data.stableEarnValues[i])
        i += 12
      }
      console.log(list)
      // let min = Math.min.apply(Math, list.map(function (o) {
      //   return o.shareValue.toFixed(2)
      // }
      // ))
      // let max = Math.max.apply(Math, list.map(function (o) {
      //   return o.shareValue.toFixed(2)
      // }
      // ))
      // setYdomain([+(min - 0.0001).toFixed(2), +(max + 0.0001).toFixed(2)])
      setData(list.map(d => ({ time: dateFormat(new Date(d.timestamp * 1000), 'UTC:mm.dd'), value: Number(d.shareValue),timestamp:d.timestamp })));
    }
  }, [day, wallet.account, wallet.chainId])
  const CustomizedDot = () => {
    return (
      <div></div>
    )
  }
  useEffect(() => {
    load()
  }, [day])
  return (<div className="strategy-performance">
    <div className="strategy-performance-title">
      <span>
        Strategy Performance
      </span>
      <div className="time-tab-close">
        <div className={classNames("day-tab-box", { check: day === "7" })} onClick={() => setDay("7")}>7 DAYS</div>
        <div className={classNames("day-tab-box", { check: day === "30" })} onClick={() => setDay("30")}>30 DAYS</div>
        <div className={classNames("day-tab-box", { check: day === "all" })} onClick={() => setDay("all")}>ALL</div>
        <Icon token="close-modal" width={12} height={12} onClick={() => hide("chart")} />
      </div>
    </div>
    <div className="chart-box">
      <ResponsiveContainer>
        <LineChart data={data} w>
          <Tooltip cursor={true} active={true} content={<Tip />} />
          <XAxis dataKey="time" tick={{ fill: '#B0B7C3', fontSize: '14' }} tickLine={false} axisLine={false} />
          <YAxis dataKey="value" domain={Ydomain} tick={{ fill: '#B0B7C3', fontSize: '14' }} tickLine={false} axisLine={false} />
          <Line strokeWidth={4} dot={<CustomizedDot />} type="monotone" dataKey="value" stroke="#377DFF" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>)
}