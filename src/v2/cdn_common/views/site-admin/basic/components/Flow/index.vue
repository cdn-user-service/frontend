<template>
  <ants-form-card class="site-flow-box">
    <template slot="title">{{ antsT('流量采集选项') }}</template>
    <template slot="info">
      {{ antsT('自定义站点的流量采集选项。若无特殊需求，推荐跟随默认设置。') }}
    </template>
    <template slot="content">
      <ants-radio-group
        v-model="form.site_vhost_filter_mode"
        @change="changeFlowSetting"
        class="space-y-10"
      >
        <ants-radio
          v-for="item in flowSettings"
          :key="item.label"
          :label="item.label"
          :text="item.text"
          class="block"
        />
      </ants-radio-group>
    </template>
  </ants-form-card>
</template>

<script>
const flowSettings = [
  {
    label: 0,
    text: '默认设置'
  },
  {
    label: 1,
    text: '超高并发（适用于视频资源类型站点，1G以上）'
  },
  {
    label: 2,
    text: '高并发（适用于大型网站，百兆以上）'
  },
  {
    label: 3,
    text: '低并发（适用于详细统计站点，低流量）'
  }
]
export default {
  data() {
    return {
      flowSettings,
      form: {
        // [int] 流量选项
        site_vhost_filter_mode: 0
      }
    }
  },
  created() {
  },
  methods: {
    /**
     * @description: 切换流量选项
     */

    async changeFlowSetting(val) {
      this.saveSiteAttr({
          site_vhost_filter_mode: val
      })
    },

    /**
     * @description: 保存配置数据
     */

    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    }
  }
}
</script>

<style lang="scss">
.site-flow-box {
  .el-radio.is-bordered + .el-radio.is-bordered {
    margin-left: 0;
  }
}
</style>
