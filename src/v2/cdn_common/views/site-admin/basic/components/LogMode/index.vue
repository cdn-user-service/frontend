<template>
  <ants-form-card class="site-flow-box">
    <template slot="title">{{ antsT('日志记录模式') }}</template>
    <template slot="info">
      {{
        antsT(
          '自定义站点的日志模式选项。若无特殊需求，推荐跟随默认设置：默认限制1000条/秒'
        )
      }}
    </template>
    <template slot="content">
      <ants-radio-group v-model="form.access_log_mode" @change="changeLogMode">
        <ants-radio
          v-for="(item, key) in logMode"
          :key="key"
          :label="+key"
          :text="item"
          class="inline-block my-sm"
        />
      </ants-radio-group>
    </template>
  </ants-form-card>
</template>

<script>
const logMode = {
  0: '关闭日志',
  1: '无限制',
  // 2: '限制 1条/秒',
  // 3: '限制 10条/秒',
  4: '限制 100条/秒',
  5: '限制 1000条/秒',
  6: '限制 1万条/秒',
  7: '限制 10万条/秒'
}

export default {
  data() {
    return {
      logMode,
      form: {
        // [int] 日志模式选项
        access_log_mode: 5
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 切换日志模式选项
     */

    async changeLogMode(val) {
      this.saveSiteAttr({
        access_log_mode: val
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
