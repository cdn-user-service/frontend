<template>
  <ants-form-card>
    <!-- <template slot="title">{{ antsT('搜索引擎爬虫限制') }}</template> -->
    <template slot="title">{{ antsT('防内容抓取') }}</template>
    <template slot="info">
      <ul class="space-y-6">
        <!-- <li>
          {{ antsT('禁止后将限制搜索引擎对页面的索引和跟踪') }}
        </li> -->
        <li>
          {{ antsT('禁止后将限制一切蜘蛛引擎对页面的抓取和跟踪') }}
        </li>
      </ul>
    </template>
    <template slot="content">
      <!-- 三个选项 -->
      <ants-radio-group v-model="status" @change="changeStatus">
        <ants-radio :label="0" text="关闭" />
        <ants-radio :label="1" text="自动跳转" />
        <ants-radio :label="2" text="手动跳转" />
      </ants-radio-group>
      <!-- <ants-switch
        :disabled="$root.disabledCrud"
        v-model="status"
        active-text="ON"
        inactive-text="OFF"
        v-loading="$attrs.btnLoading"
        @change="changeStatus"
      /> -->
    </template>
  </ants-form-card>
</template>

<script>
export default {
  data() {
    return {
      // 搜索引擎开关，[bool] 0 = 允许 | 1 = 禁止
      status: null
    }
  },
  mounted() {
    //
  },
  methods: {
    async changeStatus(val) {
      console.log('val', val)
      const res = await this.$listeners.saveSiteAttr({
        x_robots_tag: val
      })
      // 复位
      if (!res) {
        val = null
      }
    }
  }
}
</script>
