<template>
  <el-dialog
    :title="antsT('重要提示')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    width="400px"
    center
  >
    <div class="text-center">
      <p style="font-size:24px;">{{antsT('未实名认证')}}</p>
      <p>{{antsT('当前账号未进行实名认证，将影响服务继续正常使用')}}</p>
      <p>{{antsT('请立即去实名认证，保障您的业务安全')}}</p>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button
        style="width:100%;margin-bottom:30px;"
        type="primary"
        @click="goRealNamePage"
        >{{antsT('立即去实名认证')}}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'RealNameTipsDialog',
  data() {
    return {
      dialogVisible: true
    }
  },
  methods: {
    /**
     * @description: 点击前往实名认证页面
     */

    goRealNamePage() {
      this.dialogVisible = false
      this.$router.push('/dns/user/auth')
    }
  }
}
</script>
