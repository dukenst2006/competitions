import api from '../../api/index'
import Message from '../../entities/Message'

export default {
  /**
   * Get messages from the server
   * @param {String} type
   * @param {Paging} paging
   * @returns {Promise.<PagingResult>}
   */
  get (type, paging) {
    return api.get(
      'user/messages', item => new Message(item), {},
      {type, ...paging.toUrlParams()}
    )
  },

  /**
   * Get unread message count
   * @returns {Promise.<Number>}
   */
  countUnread () {
    return api.find('user/messages/count/unread', _ => _)
  },

  /**
   * Mark message as read
   * @param {Number} id
   * @returns {Promise.<Message>}
   */
  markAsRead (id) {
    return api.find('user/messages/read', item => new Message(item), id)
  },

  /**
   * Make reply on message
   * @param {Number} onId
   * @param {String} subject
   * @param {String} body
   */
  reply (onId, {subject, body}) {
    return api.save(`user/messages/${onId}/reply`, _ => _, {subject, body, id: 0})
  },

  /**
   * Send new message
   * @param {Number} to
   * @param {String} subject
   * @param {String} body
   * @returns {Promise.<Message>}
   */
  send ({to, subject, body}) {
    return api.save('user/messages', item => new Message(item), {to, subject, body, id: 0})
  }
}
