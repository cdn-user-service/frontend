<template>
  <el-select
    :placeholder="antsT(placeholder)"
    :loading-text="antsT(loadingText)"
    :no-data-text="antsT(noDataText)"
    :no-match-text="antsT(noMatchText)"
    v-bind="$attrs"
    v-on="$listeners"
    class="ants-select"
  >
    <template v-for="(index, name) in $slots" :slot="name">
      <slot :name="name" />
    </template>
  </el-select>
</template>

<script>
export default {
  name: 'AntsSelect',
  props: {
    placeholder: String,
    noMatchText: String,
    noDataText: String,
    loadingText: String
  }
}
</script>

<style lang="scss">
.ants-select {
  width: 100%;
}
</style>
