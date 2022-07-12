import { useState, useEffect, useCallback } from "react";
import { Icon, Button } from '@deri/eco-common';
import classNames from 'classnames'
import './card.scss'
import ApiProxy from "../../model/ApiProxy";
import { useWallet } from "use-wallet";
import useChain from '../../hooks/useChain';
import { useAlert } from 'react-alert'
import DeriNumberFormat from "../../utils/DeriNumberFormat";
import { eqInNumber, getBtokenAmount, hasParent } from "../../utils/utils";
let timer;
export default function Card({ lang, getLang }) {
  return (
    <div className="card-box"></div>
  )
}