<template>
  <div class="inline-block" @click="onClick()">
    <span class="mr-1" v-if="!icon && !inline">
      {{ textStr }}
    </span>

    <span
      class="cursor-color relative text-text-2 copy-icon"
      @click.stop="$handleClipboard(textStr, $event, name)"
    >
      <span class="absolute top-0 left-0 right-0 bottom-0 z-10"></span>

      <slot>
        <slot name="left" />

        <i
          v-if="icon || !inline"
          class="el-icon-copy-document"
          style="font-size: 14px;"
        />

        <template v-else>
          {{ textStr }}
        </template>

        <slot name="right" />
      </slot>
    </span>
  </div>
</template>

<script>
/**
  <ants-copy :text="item" :name="name" />
 */
export default {
  name: 'AntsCopy',
  props: {
    text: {
      required: true,
      // type: [String, Number],
      validator: function(value) {
        return (
          value === null ||
          typeof value === 'string' ||
          typeof value === 'number'
        )
      },
      default: ''
    },
    // 指定复制字段名称
    name: {
      type: String,
      default: ''
    },
    // 内联
    inline: Boolean,
    // 只显示icon
    icon: Boolean
  },
  computed: {
    textStr() {
      const textStr = this.text.toString()
      return textStr === 'undefined' ? '' : textStr
    }
  },
  methods: {
    onClick() {
      this.$emit('click')
    }
  }
}
</script>
