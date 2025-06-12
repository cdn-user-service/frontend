<template>
  <div class="py-lg">
    将清理
    <strong class="text-primary">{{ siteIdsNum }}</strong>
    个站点缓存
  </div>
</template>

<script>
const defaultForm = {
  // 缓存清理
  clean_cache: 1
}

export default {
  components: {},
  props: {
    siteIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      cards: {},
      form: {
        ...defaultForm
      }
    }
  },
  computed: {
    siteIdsNum() {
      return this.siteIds.length
    }
  },
  created() {},
  methods: {
    getForm() {
      return {
        ...this.form
      }
    },

    resetForm() {
      this.form = {
        ...defaultForm
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
