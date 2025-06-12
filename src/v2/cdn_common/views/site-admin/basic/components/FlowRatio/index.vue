<template>
  <ants-form-card>
    <template slot="title">{{ antsT('站点流量统计系数') }}</template>
    <template slot="content">
      <ants-input-number
        v-model="form.flow_ratio"
        :min="1"
        :max="999999"
        :step="1"
        :precision="2"
        size="small"
      />
      <span class="text-ants-text-3 mx-sm mr-lg">倍</span>

      <ants-button
        size="mini"
        type="primary"
        icon="el-icon-check"
        :loading="$attrs.btnLoading"
        @click="doSave()"
        text="提 交"
      />
    </template>
  </ants-form-card>
</template>

<script>
export default {
  data() {
    return {
      form: {
        // 站点流量统计系数
        flow_ratio: 1
      }
    }
  },
  created() {},
  methods: {
    async doSave() {
      this.saveSiteAttr({
        flow_ratio: +this.form.flow_ratio
      })
    },

    /**
     * @description: 保存配置数据
     */

    async saveSiteAttr(dataObj) {
      await this.$listeners.saveSiteAttr(dataObj)
    }
  }
}
</script>
