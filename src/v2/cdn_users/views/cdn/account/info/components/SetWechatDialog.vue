<template>
  <el-dialog
    :title="antsT('绑定微信')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="500px"
    center
    append-to-body
  >
    <div style="height:380px;">
      <div class="font-bold text-center mb-xl">
        {{ antsT('绑定微信可使用微信扫码登录') }}
      </div>

      <WxLoginCode @successListenCode="successListenCode" name="授权" is-bind />
    </div>
  </el-dialog>
</template>

<script>
// API
import { bindWechatCode } from '@/v2/cdn_users/api/cdn/account'

import WxLoginCode from '@/v2/cdn_users/components/WxLoginCode'

export default {
  components: {
    WxLoginCode
  },
  data() {
    return {
      // 微信扫码数据
      dialogVisible: false
    }
  },

  methods: {
    /**
     * @description: 对话框显示
     */

    async showDialog() {
      this.dialogVisible = true
    },

    // 监听微信绑定扫码
    /**
     * @description: 微信扫码成功后的逻辑
     */

    async successListenCode(res = {}) {
      this.$listeners.getUserData()
      this.$msg.success(this.antsT('绑定微信成功'))
      this.dialogVisible = false
    }
  }
}
</script>
