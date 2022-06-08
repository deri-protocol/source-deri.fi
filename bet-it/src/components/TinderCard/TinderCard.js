import React from "react";
import { useState, useEffect } from "react";
import Card from "../Card/Card";
import './style.scss'
import { Icon } from '@deri/eco-common';
export default function TindeCardBox({ bTokens, closeModal, lang, symbols, getLang, openSymbol }) {
  let indexCard;
  const showCardModal = () => {
    return false
  }
  const arr = JSON.parse(JSON.stringify(symbols))
  let obj = [];
  arr.forEach((item, index) => {
    if (item.symbol === openSymbol) {
      indexCard = index + 1
      obj = arr.splice(index)
      return;
    }
  })
  arr.unshift(...obj)
  const [cardIndex, setCardIndex] = useState(indexCard)

  useEffect(() => {
    var krisna = new window.Stack(document.getElementById('card-swipe'))
    var buttonClickCallback = function (bttn) {
      var bttn = bttn || this;
      bttn.setAttribute('data-state', 'unlocked');
      indexCard = indexCard + 1
      if (indexCard > symbols.length) {
        indexCard = 1
      }
      setCardIndex(indexCard)
      console.log("indexCard", indexCard)
    };
    var startX, startY, moveEndX, moveEndY, X, Y
    let card = document.getElementById('card-swipe')
    card.addEventListener("touchstart", function (e) {
      startX = e.touches[0].pageX
      startY = e.touches[0].pageY
    })
    card.addEventListener("touchmove", function (e) {
      moveEndX = e.changedTouches[0].pageX
      moveEndY = e.changedTouches[0].pageY
      X = moveEndX - startX
      Y = moveEndY - startY
      if (Math.abs(X) > Math.abs(Y) && X < 0) {

        krisna.reject(buttonClickCallback.bind(this));
      }

    });
  }, [])
  return (
    <div className="modal-body">
      <div className="card-index">
        {cardIndex}<span>/{symbols.length}</span>
      </div>
      <ul className="modal-body-container stack stack--krisna" id="card-swipe">
        {arr.map((item, index) => (
          <li className='swipe stack__item'>
            <Card info={item} bTokens={bTokens} lang={lang} key={index} getLang={getLang} showCardModal={showCardModal} />
          </li>
        ))}
      </ul>
      <div className='close-modal' onClick={closeModal}>
        <Icon token="close" />
      </div>

    </div>
  );
};
