<template>
  <span
    class="cursor-color mx-1"
    v-if="textStr"
    @click="$handleClipboard(text, $event, name)"
  >
    <span class="el-icon-copy-document" v-if="isIcon" style="font-size: 14px">
    </span>
    <slot />
  </span>
</template>

<script>
/**
  <ants-clipboard :text="item" :name="name" />
 */
export default {
  name: 'AntsClipboard',
  props: {
    text: {
      required: true,
      // type: [String, Number],
      validator: function (value) {
        return (
          value === null ||
          typeof value === 'string' ||
          typeof value === 'number'
        )
      },
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    isIcon: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    textStr() {
      const textStr = this.text.toString()
      return textStr === 'undefined' ? '' : textStr
    }
  }
}
</script>
