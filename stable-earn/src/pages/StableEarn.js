import './stable-earn.scss'
import { Icon } from '@deri/eco-common';
import Operate from '../components/Operate/Operate';
import { useState } from 'react';
import Header from '../components/Header/Header';
export default function StableEarn({ lang, getLang, actions }) {
  const faqList = [
    { label: "How Stable Earn works?", answer: "Stable Earn runs a BNB POS staking fund, with its purpose to help users earn BNB staking yield with their BUSD investment. 90% of the BUSD invested will be swapped into BNB which is staked to Stader for POS yield. That is, 90% of the capital is participating in the Proof-of-Staking of the BNB Smart Chain (BSC). The rest 10% will be used as margin on Deri Protocol to short BNB perps. This combination ensures that the net value of the fund is not affected by BNB price fluctuations. " },
    { label: "What are the fees?", answer: "Stable Earn does not charge any fees.", answerTwo: " However, when users invest or redeem, they will incur transaction fees, including fees for BNB-BUSD swapping and trading BNB perps. These fees are charged for the use of these platform services and are not controlled by Stable Earn." },
    { label: "What is FLP?", answer: "FLP (short for Fund LP) is an ERC20 token that represents your ownership of the fund's assets. When you invest in Stable Earn, the fund will issue you a certain number of FLP tokens based on the NAV of the fund at the time of investment. When you redeem, the FLP tokens will be locked and the estimated redemption BUSD amount will be calculated based on the number of FLP tokens * the NAV of the fund at the time of redemption. When the redemption is completed, the FLP tokens will be burned." },
    { label: "What is the redemption process?", answer: "As with all BNB staking platforms, there is a 15-day unbound period to fully redeem your investment. You need to initiate a redemption request first and the FLP token in your wallet will be locked in the fund contract. Your investment will not accrue yield once the redemption process starts. The requested funds will be available for withdrawal in 15 days.", answerTwo: "Alternatively, you can use Instant Redeem, which will convert BNBX to BNB in DEX and then swap into BUSD for withdrawal. Please note, however, that as BNB/BNBX generally has a discounted rate on DEX, Instant Redeem will leave you with a little less withdrawable funds compared to the regular redemption process." },
    { label: "What are the risks?", answer: "Liquidation risk: If the BNB price rises significantly, the corresponding short position may be at risk of liquidation. The keeper will actively monitor the margin account at all times. When the margin falls below a certain limit, the keeper will manually trigger a rebalance transaction: sell part of the BNBX and restore the margin to the expected level. But we can not exclude the possibility of liquidation under extreme market conditions.", answerTwo: "Smart contract risk: The underlying smart contracts of Deri Protocol and Stader have been audited by Peckshield and Certik. but there’s always the possibility of a bug or vulnerability compromising participants' funds." },
    { label: "How is projected APY calculated?", answer: "The Stable Earn helps users to earn yield from BNB staking. The projected APY is calculated as BNB staking yield * 0.9, where the 0.9 coef. refers 90% of the investment in BUSD converted to BNB staking. However, please note that this is only the projected APY and the actual APY may vary." },
    {label:"How Stable Earn manage hedge positions?",answer:"For each new investment made by a user, 90% of the funds are used to purchase BNB on the DEX and 10% are deposited into the Stable Earn's margin account on Deri Protocol. This margin account is only used to hedge the BNB exposure held by the fund. Whenever a user invests or redeems, the smart contract automatically calculates the hedging position that needs to be adjusted, thus ensuring the delta neutral status of the fund.",answerTwo:"When the BNB price fluctuates significantly, the keeper may start a rebalance transaction. Specifically, when the BNB price rises, the corresponding short position may be at risk of liquidation. If the margin balance falls below a certain limit, the keeper will trigger a rebalance to top up additional margin. When the price of BNB falls sharply, the short position accumulates some profit and the keeper will take part of the profit out of the margin account and swap it for BNB to improve the capital efficiency."}
  ]
  const scrollToAnchor = (anchorName) => {
    if (anchorName) {
      let anchorElement = document.getElementById(anchorName);
      if (anchorElement) { anchorElement.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    }
  }
  const switchMenu = () => {
    const status = !actions.getGlobalState('menuStatus')
    actions.setGlobalState({ 'menuStatus': status })
  }
  return (
    <div className='stable-earn'>
      <Header collect={true} switchMenu={switchMenu}></Header>
      <div className='stable-earn-bg-box'>
        <div className='deri-stader-box'>
          <div className='deri-stader-title'>
            Powered By
            <div className='deri-stader'>
              <div className='deri-logo-text'>
                <Icon token="deri" />
                DERI
              </div>
              <div className='stader-logo-text'>
                X
                <Icon token="stader" />
                Stader
              </div>
            </div>
          </div>
          <div className='deri-stader-describe'>
            <div className="stable-title">
              STABLE EARN
            </div>
            <div className='stable-describe'>
              Stable Earn is a fund for you to invest BUSD and earn stable yield in BUSD at almost zero risk.
            </div>
          </div>
        </div>
      </div>
      <div className='stable-earn-info'>
        <div className='strategy-bnb-staking-describe'>
          <div className='describe-left-text-box'>
            <div className='describe-left-text-box-title'>
              Strategy - BNB Staking
            </div>
            <div className='describe-left-text-box-text'>
              <div className='text-info'>
                Under the hood, it buys BNB to stake on Stader (ultimately used for BNB POS staking) and hedges the BNB price fluctuations with a perp position on Deri Protocol. This fund enables you to earn BUSD from BNB staking rewards without worrying about BNB price fluctuations.
              </div>
              <a onClick={() => scrollToAnchor("faq")}>Learn More <Icon token="go-down" /></a>
            </div>
          </div>
          <div className='describe-illustration'>
            <Icon token="illustration" />
          </div>
        </div>
        <Operate />
      </div>
      <div className='stable-earn-faq-box' id="faq">
        <div className='faq-title'>
          FAQs
        </div>
        {faqList.map((item, index) => {
          return <FaqInfo item={item} index={index} />
        })}

      </div>
    </div>
  )
}

function FaqInfo({ item, index }) {
  const [isFaqOpen, setIsFaqOpen] = useState(false)
  return (
    <div className='faq-info-box' key={index}>
      <div className='faq-title-img' onClick={() => { setIsFaqOpen(!isFaqOpen) }} >
        <div className='faq-question-title'>
          {item.label}
        </div>
        <div>
          <Icon token={isFaqOpen ? 'faq-open' : 'faq-close'} width='22' height='24' />
        </div>
      </div>
      {isFaqOpen && <div className='faq-des'>
        <div>
          {item.answer}
        </div>
        <br></br>
        <div>
          {item.answerTwo && item.answerTwo}
        </div>
        <div>
          <br></br>
          {item.answerThree && item.answerThree}
        </div>
      </div>}
    </div>
  )
}