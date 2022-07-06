import { makeObservable, observable, action, computed } from "mobx";
import { formatNumber, getCookie, numberWithCommas, restoreLocale, setCookie, storeLocale } from "../utils/utils";
import supportedCatalog from '../locales/lang.json'


const cache = {}

function importAll(r){
  return r.keys().forEach(key => {
    const path = key.split('/')
    const lang = path[1]
    const page = path[2].split('.')[0].toLowerCase()
    if(!cache[lang]) {
      cache[lang] = {}
    }
    
    if(/mobile-/.test(page)){
      const pageName= page.split('-')[1]
      if(!cache[lang][pageName]){ 
        cache[lang][pageName] = {}
      }
      cache[lang][pageName]['mobile'] = r(key)
    } else {
      cache[lang][page] = r(key)
    }
  });
}
//lang.json 是语言包目录，需要排除在外
importAll(require.context(`../locales/`,true,/^((?!lang).)*\.json$/))

class Intl {
  locale = 'en'
  constructor(){
    makeObservable(this,{
      locale : observable,
      setLocale : action,
      dict : computed,
      localeLabel: computed
    })
    const defaultLanguage = navigator.language
    const locale = getCookie('locale')
    if(this.supportLang(locale)){
      this.locale = locale
    } else if(this.supportLang(defaultLanguage)){
      this.locale = defaultLanguage
    } else {
      this.locale = 'en'
    }
  }

  supportLang(lang){
    return Object.keys(supportedCatalog).includes(lang)
  }

  setLocale(locale){
    if(locale && supportedCatalog[locale]){
      this.locale = locale;
      setCookie('locale',locale)
    }
  }

  get(page,key){
    return cache[this.locale][page][key]
  }

  eval(page,key,params = {},options = {}){
    const {isNumberFormat,decimal = 2,} = options
    let value = this.dict[page][key];
    const matchs = value.match(/\$\{\w+\}/g);
    if(!page) {
      console.error('eval must spcify page')
      return;
    }
    for(var i = 0 ; i < matchs.length ; i++){
      const key = matchs[i].replace(/\$|\{|\}/g,'')
      const replaced = isNumberFormat && isNaN(params[key]) ? formatNumber(params[key],decimal) : params[key]
      value = value.replace(matchs[i], replaced)
    }
    return value
  }

  get dict(){         
    return cache[this.locale]
  }

  get localeLabel(){
    const label = supportedCatalog[this.locale];
    return label ? label.substr(0,2).toUpperCase() : "EN" 
  }
}

export default new Intl();