<template>
  <el-form-item
    :label="antsT(label)"
    ref="formItem"
    class="ants-form-item"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(index, name) in $slots" :slot="name">
      <slot :name="name" />
    </template>
    <template v-slot:error="{ error }">
      <div class="text-error text-sm absolute left-0 leading-none pt-1 ants-form-error">
        {{ antsT(error) }}
      </div>
    </template>
  </el-form-item>
</template>

<script>
export default {
  name: 'AntsFormItem',
  props: {
    label: String
  },
  data() {
    return {}
  },
  methods: {
    /**
     * @description: 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
     */ 
    resetField() {
        this.$refs.formItem.resetField()
    },

    /**
     * @description: 移除表单项的校验结果。传入待移除的表单项的 prop 属性或者 prop 组成的数组，如不传则移除整个表单的校验结果
     */ 
    clearValidate() {
        return this.$refs.formItem.clearValidate()
    }
  }
}
</script>

<style lang="scss">
.ants-form-item {
  margin-bottom: 0;
}
.ants-form-error {
    bottom: -15px;
}
</style>
