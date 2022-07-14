import {useEffect,useState} from "react"
import {hide} from "react-functional-modal"
import './modal.scss';
export default function OperateMoadl({lang,type="POSITION",wallet}){
  return(
    <div className='withdraw-deposit-position'>
      <div className='font-box'>
        {type}
      </div>
    </div>
  )
}