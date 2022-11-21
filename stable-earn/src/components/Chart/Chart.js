import { useState ,useEffect} from "react"
import axios from 'axios'
import { AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid, ResponsiveContainer } from 'recharts'
export function Chart(){
  const [data, setData] = useState(null)
  return(<div className="strategy-performance">
    <div className="title">

    </div>
    <div className="chart-box">

    </div>
  </div>)
}