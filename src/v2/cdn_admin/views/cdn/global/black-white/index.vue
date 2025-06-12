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
      activeTab: this.$route.query.type || '1',
      tabArr: [
        {
          label: 'IP永久白名单',
          value: '1'
        },
        {
          label: 'IP永久黑名单',
          value: '4'
        },
        {
          label: '域名白名单',
          value: 'white_host'
        },
        {
          label: '域名黑名单',
          value: 'black_host'
        }
      ]
    }
  },
  created() {},
  methods: {
    /**
     * @description: 切换页面
     * @param {*} val
     */

    changeTab(val) {
      this.activeTab = val
      const path = val == 1 || val == 4 ? 'ip' : 'domain'
      this.$router.replace(`./${path}?type=${val}`)
      // let path = ''
      // if (val == 1 || val == 4) {
      //   path = 'ip'
      //   this.$router.replace(`./${path}?control=${val}`)
      // } else {
      //   this.$router.replace(`./${val}`)
      // }
    }
  }
}
</script>
