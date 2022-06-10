import { useEffect } from 'react'

export default function useDisableScroll(nested) {
  
  useEffect(() => {
    // window.scrollTo(0, 0);
    document.querySelector('body').style.overflow = 'hidden'
    return () => {
      if(!nested){
        document.querySelector('body').style.overflow = 'auto'
      }
    };
  }, []);
  return null;
}
