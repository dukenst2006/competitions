<template>
  <div>
    <div class="col-md-2 col-sm-3">
      <div class="list-group">
        <router-link
            :to="newMessageRoute" class="list-group-item list-group-item-info"
            active-class="active"
        >
          New Message
        </router-link>

        <router-link
            :to="inboxRoute" active-class="active" class="list-group-item"
        >
          Inbox <span class="badge">{{ unreadMessages }}</span>
        </router-link>

        <router-link
            :to="outboxRoute" active-class="active" class="list-group-item"
        >
          Outbox
        </router-link>
      </div>
    </div>
    <div class="col-md-10 col-sm-9">
      <div class="row">
        <grid id="messages-list" :paging="paging">
          <span slot="title">Messages</span>
          <table class="table table-hover table-condensed">
            <thead>
            <tr>
              <th>#</th>
              <th>
                <span v-if="isInboxActive">Sender</span>
                <span v-else>Recipient</span>
              </th>
              <th>Subject</th>
              <th>When</th>
            </tr>
            </thead>
            <tbody>
            <template v-for="message in paging.items">
              <router-link
                  tag="tr" :to="message.readRoute" class="pointer"
                  :class="paging.rowClasses(message, {active: !message.is_read})"
              >
                <td><i class="fa" :class="messageClass(message)"></i></td>
                <td>
                  <span v-if="isInboxActive">{{ message.from_name }}</span>
                  <span v-else>{{ message.to_name }}</span>&nbsp;
                  <span v-if="message.reply_count">
                    ( {{ message.reply_count }} )
                  </span>
                </td>
                <td>{{ message.subject }}</td>
                <td>{{ message.date_from_now }}</td>
              </router-link>
            </template>
            </tbody>
          </table>
        </grid>
      </div>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
  import { messagesRoute, newMessageRoute } from '../../router/routes'
  import msg from './api'
  import Paging from '../../components/grid/Paging'

  export default {
    name: 'messages',

    data () {
      return {
        paging: new Paging(this, {route: messagesRoute})
      }
    },

    created () {
      this.$log.component(this)
      this.paging.init(() => this.fetchMessages(this.routeType))
    },

    computed: {
      isInboxActive () {
        return this.routeType === 'inbox'
      },

      routeType () {
        return this.$route.params.type
      },

      inboxRoute () {
        return {...messagesRoute, params: {type: 'inbox'}}
      },

      outboxRoute () {
        return {...messagesRoute, params: {type: 'outbox'}}
      },

      newMessageRoute () {
        return {...newMessageRoute, params: {type: this.routeType}}
      },

      unreadMessages () {
        return this.$store.state.messages.unread
      }
    },

    methods: {
      /**
       * Fetch messages from api.
       * @param {String} messageType
       */
      fetchMessages (messageType) {
        this.paging.loading = true
        msg.get(messageType, this.paging)
          .then(messages => this.paging.update(messages))
      },

      /**
       * Resolve message class
       * @param {Message} message
       */
      messageClass (message) {
        return {
          'fa-envelope-open': message.is_read,
          'fa-envelope': !message.is_read,
          [message.colorClass]: true
        }
      }
    },

    watch: {
      '$route' (to, from) {
        // TODO: pagination does not roll back when users open message from page
        // 2 or more. In this case, after close, user allays is returned to
        // first page.
        if (to.name === messagesRoute.name &&
          to.params.type !== from.params.type) {
          messagesRoute.params.type = to.params.type
          messagesRoute.params.page = to.params.page
          this.fetchMessages(to.params.type)
        }
      }
    }
  }
</script>

<style>
  .pointer {
    cursor: pointer;
  }
</style>
