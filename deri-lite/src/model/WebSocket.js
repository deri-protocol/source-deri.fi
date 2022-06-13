import { io } from "socket.io-client";
import {equalIgnoreCase } from "../utils/utils";

class WebSocket {
  constructor(){
    this.socket = io(process.env.REACT_APP_WSS_URL, {
      transports: ['websocket'],
      withCredentials: true
    })
    this.events = [];
    this.reconnectListeners = {}
    this.reconnected = false
    this.socket.on('connect', () => {
      console.log('connect')
      if(this.reconnected){
        console.log('reconnect and emit reconnect event')
        this.reconnected = false
        Object.values(this.reconnectListeners).forEach(callback => callback())
      }
      this.events.forEach(event => {
        this.socket.emit(event[0],event[1]);
      })
    })
    this.socket.on('disconnect',event => {
      this.reconnected = true
      console.log('web socket disconnect,will reconnect auto')
    })
  }

  addReconnectEvent(id,callback){
    this.reconnectListeners[id] = callback
  }

  removeReconnectEvent(id){
    delete this.reconnectListeners[id]
  }


  subscribe(event = 'get_kline_update',params = {},onMessage,listener = 'kline_update'){
    this.socket.on(listener,data => {
      if (data.time_type === params.time_type && equalIgnoreCase(data.symbol,params.symbol) && onMessage) {
        onMessage(data)
      }
    })
    this.socket.emit(event, params)
    if(this.findEvent(event,params) === -1){
      this.events.push([event,params])
    }
  }

  findEvent(event,params){
    return this.events.findIndex(item => item[0] === event && item[1].symbol === params.symbol && item[1].time_type === params.time_type);
  }

  unsubscribe(event,params = {}){
    this.socket.emit(event,params)
    const pos = this.findEvent(event,params)
    this.events.splice(pos,1)
  }
}
export default new WebSocket()