import Select2Options from '../components/helpers/forms/select2'
import settings from '../settings'
import VueI18n from 'vue-i18n'
import Vue from 'vue'
import en from './en'
import lv from './lv'

Vue.use(VueI18n)

Vue.config.lang = 'lv'
Vue.config.fallbackLang = 'en'

export const translations = {en, lv}

export const locales = {
  lv: {key: 'lv', text: translations.lv.locale},
  en: {key: 'en', text: translations.en.locale}
}

export const select = () => {
  let options = []
  Object.keys(locales)
    .forEach((locale) => options.push({
      id: locales[locale].key,
      text: locales[locale].text
    }))

  return (new Select2Options(options)).asSerchable(false)
}

export function init () {
  const locale = settings.getLocale()
  if (locale) {
    setLocale(locale)
  }
}

export function setLocale (locale = 'lv') {
  // set locale only if it is in set of defined locales
  if (~Object.keys(locales).indexOf(locale)) {
    settings.setLocale(locale)
    Vue.config.lang = locale
  }
}

// set locales
Object.keys(translations).forEach(function (lang) {
  Vue.locale(lang, translations[lang])
})
