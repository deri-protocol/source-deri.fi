import { makeObservable, observable, action, computed } from "mobx";
import { restoreLocale, storeLocale } from "../utils/utils";
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
    const language ="EN"
    const prefix = language && language.split('-')[0]
    const locale = restoreLocale()
    if(locale && Object.keys(supportedCatalog).includes(locale) ){
      this.locale = locale
    } else if(prefix && Object.keys(supportedCatalog).includes(prefix)){
      this.locale = prefix
    }
  }

  setLocale(locale){
    if(locale && supportedCatalog[locale]){
      this.locale = locale;
      storeLocale(locale)
    }
  }

  get(page,key){
    return cache[this.locale][page][key]
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