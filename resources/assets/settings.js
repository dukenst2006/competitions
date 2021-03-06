import axios from 'axios'
import moment from 'moment'
import router from './router'
import store from './store'
import help from './help'
import Vue from 'vue'
import { login } from './router/routes'

export default {
  domain: 'http://crip-competitions.dev',

  apiRoot: `api/`,

  serverDateFormat: 'YYYY-MM-DD HH:mm:ss',

  /**
   * Logging placement area
   * 'console' - logs all sections to the browser console
   * false     - disables all logs
   */
  logs: 'console',

  /**
   * List of enabled log sections
   * To disable logs for some section, remove it from this list
   * To disable all logs, change logs property value to false or make logSections list empty
   */
  logSections: [
    'global',
    'api',
    'component',
    'error',
    'info'
    // // 'select2', // Uncomment this line to see all changes in select2 helper
  ],

  filesysUrl ({target = 'ckeditor', callback = '', image = ''} = {target: 'ckeditor'}) {
    return `${this.domain}/packages/filemanager?target=${target}` +
      (callback ? `&callback=${callback}` : '') +
      '&type=image' +
      (image ? `&select=${image}` : '') +
      `&token=${localStorage.getItem('token')}`
  },

  /**
   * Generate url to the application api
   * @param {string}  path        Request path
   * @param {object} [params]     Parameters to be included in URL
   * @param {object} [urlReplace] Url placeholders should be replaced with variable values
   * @returns {string} Absolute API url
   */
  apiUrl (path, params = {}, urlReplace = {}) {
    let url = path.replace(new RegExp('^[\\/]+'), '')
    url = `${this.domain}/${this.apiRoot}${url}`
    url = url.supplant(urlReplace)

    Object.keys(params).forEach(index => {
      let val = params[index]
      if (typeof val !== 'undefined' && val !== '') {
        url = this.addParameter(url, index, val)
      }
    })

    return url
  },

  /**
   * Global handler of Vue HTTP error responses
   * @param   {object}           errorResponse
   * @param   {function(object)} [reject]
   * @returns {object}
   */
  handleError (errorResponse, reject = _ => _) {
    if (help.isUndefined(errorResponse)) {
      return this.handleUnknownError(errorResponse)
    }

    let result = errorResponse.data

    if (errorResponse.status !== 422) {
      result = {error: ['Unknown error']}
    }

    if (reject && typeof reject === 'function') {
      reject(result)
    }

    switch (errorResponse.status) {
      case 401:
        Vue.log.error(
          'settings.handleError -> unauthorized', errorResponse.data
        )
        store.commit('logout')
        router.push({...login, query: {redirect: router.currentRoute.fullPath}})
        break
      case 422:
        Vue.log.error(
          'settings.handleError -> validation failed', errorResponse.data
        )
        break
      case 403:
      case 405:
        Vue.log.error(
          'settings.handleError -> method not allowed', errorResponse
        )
        Vue.toasted.error('Action is not allowed')
        // TODO: send this as email to admin to be able detect users who is trying hack app
        //   or some places has not enough protection and simple user can open it and
        //   create not allowed requests
        break
      default:

    }

    return result
  },

  handleUnknownError (error) {
    Vue.log.error('settings.handleError -> unknown', error)
    // TODO: send email as there happened something that we did not expected
    Vue.toasted.error('Unknown server error. Please contact support if this error repeats.')
  },

  /**
   * Append new parameter to url
   * @param {String} url Original URL
   * @param {String} param Parameter key
   * @param {String} value Parameter value
   * @returns {String} URL with appended parameter
   */
  addParameter (url, param, value) {
    // Using a positive lookahead (?=\=) to find the
    // given parameter, preceded by a ? or &, and followed
    // by a = with a value after than (using a non-greedy selector)
    // and then followed by a & or the end of the string
    const val = new RegExp(`(\\?|\\&)${param}=.*?(?=(&|$))`)
    const parts = url.toString().split('#')
    const hash = parts[1]
    const qstring = /\?.+$/
    let newURL = url = parts[0]

    // Check if the parameter exists
    if (val.test(url)) {
      // if it does, replace it, using the captured group
      // to determine & or ? at the beginning
      newURL = url.replace(val, `$1${param}=${value}`)
    } else if (qstring.test(url)) {
      // otherwise, if there is a query string at all
      // add the param to the end of it
      newURL = `${url}&${param}=${value}`
    } else {
      // if there's no query string, add one
      newURL = `${url}?${param}=${value}`
    }

    if (hash) {
      // if hash exists, append it to new url
      newURL += `#${hash}`
    }

    return newURL
  },

  /**
   * Set user auth token in storage for later usage
   * @param token
   */
  setToken (token) {
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = this.getAuthToken()
  },

  /**
   * Determine storage token existence
   * If exists - reset to make sure it is in interceptors
   * @returns {boolean}
   */
  hasToken () {
    let result = !!localStorage.getItem('token')

    if (result) {
      this.setToken(localStorage.getItem('token'))
    }

    return result
  },

  /**
   * Get auth header token value
   * @returns {string}
   */
  getAuthToken () {
    return `Bearer ${localStorage.getItem('token')}`
  },

  /**
   * Delete token from storage
   */
  removeToken () {
    localStorage.removeItem('token')
  },

  /**
   * Get last user used locale from storage
   * @returns {string}
   */
  getLocale () {
    return localStorage.getItem('locale')
  },

  /**
   * Set user locale to storage
   * @param locale
   */
  setLocale (locale) {
    localStorage.setItem('locale', locale)
  },

  /**
   * Convert server date string to moment object instance.
   * @param   {String} date
   * @returns {null|moment.Moment}
   */
  parseServerDate (date) {
    if (date) return moment(date, this.serverDateFormat)

    return null
  }
}
