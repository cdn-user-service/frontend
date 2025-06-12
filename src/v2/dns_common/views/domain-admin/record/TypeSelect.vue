<template>
  <ants-select
    :size="size"
    ref="sortRef"
    filterable
    v-bind="$attrs"
    v-on="$listeners"
  >
    <ants-option
      v-for="(item, key) in typeObj"
      :key="key"
      :label="item"
      :value="key"
    />
  </ants-select>
</template>

<script>
const typeObj = {
  A: 'A',
  CNAME: 'CNAME',
  MX: 'MX',
  TXT: 'TXT',
  SPF: 'SPF',
  NS: 'NS',
  AAAA: 'AAAA',
  SRV: 'SRV',
  CAA: 'CAA',
  SURL: '显性URL',
  HURL: '隐性URL',
  FURL: '强制URL'
}
export default {
  props: {
    size: {
      type: String,
      default: 'small'
    }
  },
  data() {
    return {
      typeObj
    }
  },
  methods: {
    focus() {
      this.$refs.sortRef.$children[0].focus()
    }
  }
}
</script>
