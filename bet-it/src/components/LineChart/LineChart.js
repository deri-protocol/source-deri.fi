import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
const oracleUrl = process.env.REACT_APP_ORACLE_HTTP_URL

export default function LineChart({ symbol, pool, chain, color }) {
  const [data, setData] = useState([])
  const now = new Date().getTime();
  const from = parseInt((now - 1000 * 60 * 60 * 24) / 1000);
  const to = parseInt(now / 1000);
  const loadData = async () => {
    const url = `${oracleUrl}/kline`
    const res = await axios.get(url, {
      params: {
        chain:chain,
        pool:pool,
        symbol: symbol,
        type:"index",
        period: 'hour',
        from: from,
        to: to
      }
    })
    if (res.status === 200 && res.data && res.data.length) {
      const data = res.data.map(d => ({ value: d.close, time: new Date(d.time).getHours() }))
      setData(data)
    }
  }

  useEffect(() => {
    loadData();
  }, [symbol, color])

  return (data ?
    <ResponsiveContainer height={97}>
      <AreaChart width={376} data={data}>
        <defs>
          <linearGradient id={color} x1="0" y1="1" x2="0" y2="0" >
            <stop offset="10%" stopColor={color} stopOpacity={0.1} />
            <stop offset="90%" stopColor={color} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide={true} />
        <YAxis dataKey='value' type="number" hide domain={['dataMin - 100', 'dataMax + 100']} />
        <Area type="monotone" dataKey="value" stroke={color} fillOpacity={0.5} strokeWidth={3} fill={`url(#${color})`} />
      </AreaChart>
    </ResponsiveContainer>
    : null)
}