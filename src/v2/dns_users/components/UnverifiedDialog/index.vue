
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
    <ul class="text-center">
      <li class="mb-xxl flex items-center justify-center">
        <span class="el-icon-info text-warning text-5xl mr-xs"></span>
        <span class="text-3xl font-bold">{{ antsT('未实名认证') }}</span>
      </li>
      <li class="my-lg">
        {{ antsT('当前账号未进行实名认证，将影响服务继续正常使用') }}
      </li>
      <li>{{ antsT('请立即去实名认证，保障您的业务安全') }}</li>
    </ul>
    <span slot="footer" class="dialog-footer">
      <ants-button
        style="width:100%;"
        class="mb-xxl"
        type="primary"
        @click="goVerificationPage"
        text="立即去实名认证"
      />
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'UnverifiedDialog',
  data() {
    return {
      dialogVisible: true
    }
  },
  methods: {
    /**
     * @description: 点击前往实名认证页面
     */

    goVerificationPage() {
      this.dialogVisible = false
      this.$router.push('/dns/account/verification')
    }
  }
}
</script>
