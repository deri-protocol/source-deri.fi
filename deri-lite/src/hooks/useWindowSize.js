import { useState, useEffect } from 'react'
export default function useWindowSize(){
  const [winSize, setWinSize] = useState({
    width : undefined,
    height : undefined
  });

  useEffect(() => {
    function handleResize() {
      setWinSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener('resize',handleResize)
  }, [])
  return winSize
}