import {http, t} from 'vue'
import store from './../../store'
import * as types from '../../store/types'
import settings from './../../store/settings'

export default {

    login(credentials) {
        return new Promise((resolve, reject) => {

            http.post(settings.apiUrl('authenticate'), credentials)
                .then(({data}) => {
                    localStorage.setItem('token', data.token);
                    store.commit(types.AUTH_LOGIN);
                    this.getAuthUserDetails(resolve);
                }, ({data}) => {
                    reject(data.error)
                });

        });
    },

    checkAuth() {
        if (localStorage.getItem('token')) {
            store.commit(types.AUTH_LOGIN);
            this.getAuthUserDetails(window.noop);
        }
    },

    getAuthUserDetails(onResolved) {
        http.get(settings.apiUrl('authenticate'))
            .then(({data}) => {
                store.commit(types.AUTH_DATA_UPD, data);
                onResolved(data);
            }, r => {
                if (r.status === 401) {
                    store.commit(types.TOAST_ADD, {message: t('auth.token_expired'), class: 'toast-info'});
                    store.commit(types.AUTH_LOGOUT);
                }
                else
                    settings.handleError(r);
            })
    },

    register(details) {
        return new Promise((resolve, reject) => {
            http.post(settings.apiUrl('register'), details)
                .then(({data}) => {
                    localStorage.setItem('token', data.token);
                    store.commit(types.AUTH_LOGIN);
                    store.commit(types.AUTH_DATA_UPD, data);
                    resolve(data);
                }, ({data}) => {
                    reject(data);
                });
        });
    },

    sendResetLink(email) {
        return new Promise((resolve, reject) => {
            http.post(settings.apiUrl('password/email'), {email})
                .then(({data}) => {
                    resolve(data.status);
                }, ({data}) => {
                    reject(data);
                });
        });
    },

    reset(details) {
        return new Promise((resolve, reject) => {
            http.post(settings.apiUrl('password/reset'), details)
                .then(({data}) => {
                    resolve(data.status);
                }, ({data}) => {
                    reject(data);
                });
        });
    },

    middleware: {

        /**
         * Determines user authenticated sate
         *
         * @returns {boolean}
         */
        isAuthenticated() {
            return store.state.auth.user.authenticated;
        },

        /**
         * Determine has a auth user presented role
         *
         * @param {string} role
         * @returns {boolean}
         */
        hasRole(role) {
            if (!this.isAuthenticated())
                return false;

            let check = (role) => !!~store.state.auth.roles.indexOf(role);

            // if user has an super_admin role, allow him to do anything
            if (check('SUPER_ADMIN'))
                return true;

            return check(role);
        },

        /**
         * Determine has a auth user any of role presented in list of roles
         *
         * @param {Array} roles List of roles to match
         * @returns {boolean}
         */
        hasAnyRole(roles) {
            if (!this.isAuthenticated())
                return false;

            for (let key in roles)
                if (roles.hasOwnProperty(key) && this.hasRole(roles[key]))
                    return true;

            return false;
        },

        /**
         * Determine has a auth user all roles presented in list
         *
         * @param {Array} roles List of roles to match
         * @returns {boolean}
         */
        hasAllRoles(roles) {
            if (!this.isAuthenticated())
                return false;

            for (let key in roles)
                if (roles.hasOwnProperty(key) && !this.hasRole(roles[key]))
                    return false;

            return true;
        }

    },
}