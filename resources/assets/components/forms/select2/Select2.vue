<template>
  <select class="form-control">
    <slot></slot>
  </select>
</template>

<script>
  import help from '../../../help'
  import Select2Options from './index'

  export default {
    props: {
      value: {type: String},
      options: {type: Select2Options, 'default': _ => []}
    },

    mounted () {
      this.log('mounted')
      const $select = $(this.$el)
      this.compile($select)
    },

    data () {
      return {
        oldTagVal: ''
      }
    },

    methods: {
      log (type, extend = {}) {
        this.$log.group('select2')(type, {
          value: this.value,
          options: this.options,
          search: this.search,
          settings: this.settings,
          ...extend
        }, this.$el)
      },

      compile ($select) {
        $select
          .select2(this.options)
          .val(this.value)
          .on('change', this.onChange.bind(this, $select))
          .on('select2:open', this.onOpen.bind(this, $select))
          .on('select2:close', this.onClose.bind(this, $select))
          .trigger('change')

        this.compiled($select)
      },

      /**
       * Do post actions after select2 is binded in dom
       * @param {$} $select
       */
      compiled ($select) {
        if (this.options.initialSelection &&
          help.isFunction(this.options.initialSelection)) {
          this.options.initialSelection(
            (text, value, defaultSelected = true, selected = true) => {
              let option = new Option(text, value, defaultSelected, selected)
              $select.append(option)
            }
          )

          $select.trigger('change')
        }
      },

      /**
       * Actions to be done on select2 change event
       * @param {$} $select
       */
      onChange ($select) {
        let tagVal = this.getTagVal($select)

        /* eslint-disable no-self-compare */
        if (tagVal !== -1 && this.oldTagVal !== tagVal &&
          $select.val() === tagVal) {
          this.$emit('new', tagVal)
        } else {
          this.$emit('input', $select.val())
        }

        this.oldTagVal = tagVal
      },

      /**
       * Actions to be done on select2 open event
       * @param {$} $select
       */
      onOpen ($select) {
        this.oldTagVal = ''
      },

      /**
       * Actions to be done on select2 close event
       * @param {$} $select
       */
      onClose ($select) {
        let tagVal = this.getTagVal($select)
        if (tagVal !== -1 && this.oldTagVal !== tagVal) {
          this.oldTagVal = tagVal
          this.$emit('new', tagVal)
        }
      },

      /**
       * Get taggable value or -1 if does not have any
       * @param {$} $select
       * @returns {String|Number} Current tag value or -1 if value is not selected
       */
      getTagVal ($select) {
        const tagVal = $select.find('[data-select2-tag="true"]')
        if (tagVal.length === 0) return -1

        return $(tagVal[tagVal.length - 1]).val()
      }
    },

    watch: {
      value (val) {
        this.log('value updated', {newValue: val})
        let $select = $(this.$el)

        if ($select.val() === val) return

        // update value
        $select.val(val).trigger('change')
      },

      options (options) {
        this.log('options updated', {options})
        // update options
        $(this.$el).select2({data: options})
      }
    },

    destroyed () {
      this.log('destroyed')
      $(this.$el).off().select2('destroy')
    }
  }
</script>