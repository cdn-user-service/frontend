<template>
  <el-dialog
    :title="antsT('请勿重复支付')"
    :visible.sync="isAlipaySuccess"
    width="450px"
    center
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
  >
    <el-result
      class="-mt-lg -mb-lg"
      icon="success"
      :title="antsT('我已经完成支付？')"
      :subTitle="antsT('现在可前往 “支付记录” 页面查看')"
    >
    </el-result>
    <template slot="footer">
      <el-button
        type="primary"
        size="small"
        @click="goPage('/cdn/finance/order/14')"
        >{{ antsT('查看记录') }}</el-button
      >
      <el-button
        type="success"
        size="small"
        @click="goPage('/cdn/plan/purchase')"
        >{{ antsT('继续购买') }}</el-button
      >
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      isAlipaySuccess: false
    }
  },
  methods: {
    goPage(url) {
      this.isAlipaySuccess = false
      this.$router.replace(url)
    }
  }
}
</script>
