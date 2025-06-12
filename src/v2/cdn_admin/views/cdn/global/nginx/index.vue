<template>
  <div class="content-box" style="margin-top:0;">
    <ants-tab-card :tab-arr="tabArr" @change="changeTab" :active="activeTab">
      <router-view></router-view>
    </ants-tab-card>
  </div>
</template>

<script>
const tabArr = [
  {
    label: 'Worker',
    value: 'worker'
  },
  {
    label: 'HTTP',
    value: 'http'
  },
  {
    label: 'HTTP Header',
    value: 'http-header'
  },
  {
    label: 'Cache',
    value: 'cache'
  },
  {
    label: 'Stream',
    value: 'stream'
  },
  {
    label: '转发',
    value: 'upstream'
  },
  {
    label: '公共',
    value: 'public'
  },
  {
    label: 'IP访问规则',
    value: 'waf'
  }
]
export default {
  data() {
    return {
      activeTab: this.$route.path.replace('/cdn/global/nginx/', '') || 'worker',
      tabArr
    }
  },
  methods: {
    /**
     * @description: 切换页面
     * @param {*} val
     */

    changeTab(val) {
      this.activeTab = val
      this.$router.replace(`./${val}`)
    }
  }
}
</script>
