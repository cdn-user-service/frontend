<template>
  <div class="content-box" style="margin-top: 0">
    <ants-tab-card :tab-arr="tabArr" @change="changeTab" :active="activeTab">
      <router-view></router-view>
    </ants-tab-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: this.$route.path.replace('/cdn/global/es/', '') || 'esView',
      tabArr: [
        {
          label: '采集配置',
          value: 'esView'
        },
        {
          label: '证书配置',
          value: 'certificate'
        }
      ]
    }
  },
  methods: {
    /**
     * @description: 切换页面
     * @param {*} val
     */

    changeTab(val) {
      this.activeTab = val
      // console.log('val', `/cdn/global/es/${val}`)
      this.$router.push(`/cdn/global/es/${val}`)
    }
  }
}
</script>
