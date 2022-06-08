import {useState,useRef,useEffect} from 'react';
export default function Button({btnText,className,disabled,click,afterClick,checkApprove,wallet,spec,lang}){
  const [status, setStatus] = useState(disabled ? 'disabled' : 'enabled');
  const [isApproved, setIsApproved] = useState(true);
  const [pending, setPending] = useState(false);
  const [buttonText, setbuttonText] = useState(btnText)
  const loadRef = useRef(null)

  const onClick = async () => {
    if(status !== 'enabled') {
      return ;
    }
    beforeAction()
    const result = await click();    
    if(result){
      afterClick && afterClick()
    } 
    afterAction()
  }

  const beforeAction = ()  => {
    setStatus('disabled')
    setPending(true);
    loadRef.current && (loadRef.current.style.display = 'inline-block')
  }

  const afterAction = () => {
    loadRef.current && (loadRef.current.style.display = 'none')
    setStatus('enabled')
    setPending(false);
  }

  const loadApproveStatus = async () => {
    if(checkApprove && wallet && wallet.detail.account){
      const res = await wallet.isApproved(spec.pool,spec.bTokenId)
      setIsApproved(res);
    }
  }
  const approve = async () => {
    beforeAction();
    const res = await wallet.approve(spec.pool,spec.bTokenId);
    if(res.success){
      setIsApproved(true);
    } else {
      setIsApproved(false)
      alert(lang['approve-failed'])
    }
    afterAction();
  }

  const action = () => {
    if(isApproved){
      onClick();
    } else {
      approve();
    }
  }

  useEffect(() => {
    loadApproveStatus();
    return () => {};
  }, [wallet,spec,checkApprove]);

  useEffect(() => {
    if(btnText){
      setbuttonText(btnText)
    }
    return () => {
    }
  }, [btnText])

  return(
    <button className={className} onClick={action} >
        <span className='btn-loading-wrap'>
          <span ref={loadRef}
            className='spinner spinner-border spinner-border-sm'
            style={{display : 'none' ,marginRight : '2'}}>
          </span>
        </span>
          {pending ? lang['pending'] : (isApproved ? buttonText : lang['approve'])  }
        </button>
  )
}