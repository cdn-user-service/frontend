<template>
  <ants-input
    class="ants-search_input mr-sm"
    :placeholder="placeholderText"
    clearable
    v-model="value"
    size="small"
    @change="changeInput"
  >
    <i
      slot="prefix"
      class="el-input__icon aicon icon-sousuo"
      @click="changeInput"
    ></i>
  </ants-input>
</template>

<script>
export default {
  name: 'AntsSearchInput',
  props: {
    searchKey: {
      type: String,
      default: ''
    },
    searchValue: {
      type: String,
      default: ''
    },
    placeholderText: {
      type: String,
      default: '检索...'
    }
  },
  data() {
    return {
      value: this.searchValue
    }
  },
  methods: {
    changeInput() {
      this.$attrs.queryInfo[this.searchKey] = this.value.trim()
      this.$attrs.queryInfo[this.$attrs.pagenumKey || 'page'] = 1

      this.$listeners.changeInput()
    }
  }
}
</script>
