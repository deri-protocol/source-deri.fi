import {isBrowser,isMobile} from 'react-device-detect'

export default function useLang(dict,page){
  if(dict){
    if(isMobile){
      return Object.assign(dict[page],dict[page]['mobile'])
    } 
    return dict[page]
  }
  return {}
}