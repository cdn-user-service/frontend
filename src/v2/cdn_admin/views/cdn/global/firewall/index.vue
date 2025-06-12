<template>
  <div class="content-box" style="margin-top:0;">
    <ants-tab-card :tab-arr="tabArr" @change="changeTab" :active="activeTab">
      <router-view></router-view>
    </ants-tab-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab:
        this.$route.path.replace('/cdn/global/firewall/', '') || 'network',
      tabArr: [
        {
          label: '网络防火墙',
          value: 'network'
        },
        // {
        //   label: 'Web防火墙',
        //   value: 'web'
        // },
        {
          label: '默认精准规则',
          value: 'waf'
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
      this.$router.push(`/cdn/global/firewall/${val}`)
    }
  }
}
</script>
