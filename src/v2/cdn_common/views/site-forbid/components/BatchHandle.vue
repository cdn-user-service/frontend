<template>
  <el-dropdown @command="clickMore">
    <el-button
      type="primary"
      size="small"
      :loading="btnLoading"
      :disabled="$root.loading"
    >
      {{ antsT('批量操作') }}<i class="el-icon-arrow-down el-icon--right"></i>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="black">批量拉黑</el-dropdown-item>
      <el-dropdown-item command="release">批量解封</el-dropdown-item>
      <el-dropdown-item command="input">指定解封</el-dropdown-item>
      <!-- <el-dropdown-item command="shangba">批量上报</el-dropdown-item> -->
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doReleaseIps,
  doIpInBlackForever
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  props: {
    selectArr: Array
  },
  data() {
    return {
      btnLoading: false
    }
  },
  methods: {
    async clickMore(command) {
      // 指定解封
      if (command === 'input') {
        this.$emit('showBatchReleaseDialog')
        return 
      }

      if (!this.selectArr.length) return this.$msg.warning(this.antsT('请选择IP'))
      const arr = this.selectArr.map(item => item.i)

      switch (command) {
        // 批量解封
        case 'release':
          this.releaseIps(arr + '')
          break
        case 'black':
          // 批量拉黑拉黑
          this.ipInBlack(arr + '')
          break
        case 'shangba':
          // 批量上报
          this.ipInWhite(arr + '')
          break
      }
    },

    /**
     * @description: 批量解封IP
     */

     async releaseIps(ips = '') {
      const { data: res } = await doReleaseIps({
        ips
      })
      if (res.code !== 1) return
      this.$emit('refreshData')
      this.$msg.success(this.antsT('解封成功'))
    },

    /**
     * @description: 批量拉黑IP
     */

     async ipInBlack(ips = '') {
      const { data: res } = await doIpInBlackForever({
        id: 0,
        ips,
        remark: '三层永久封禁',
        control: 4 // 三层永久封禁 = 4
      })

      if (res.code !== 1) return
      this.$emit('refreshData')
      this.$msg.success(res.data + this.antsT('个IP拉黑成功'))
    }
  }
}
</script>
