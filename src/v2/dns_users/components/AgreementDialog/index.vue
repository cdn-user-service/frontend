<template>
  <el-dialog
    :title="$root.webName + antsT('服务协议')"
    top="5vh"
    :visible.sync="dialogVisible"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    @close="closeAgree"
    append-to-body
    center
  >
    <div
      class="text_box leading-10"
      ref="textBox"
      id="textBox"
      @scroll="scrollDiv"
      v-loading="loading"
      v-html="agreement"
    ></div>
    <template slot="footer">
      <ants-button
        type="primary"
        @click="agreeSub"
        :disabled="isDisabled"
        text="我已阅读并同意"
      />
    </template>
  </el-dialog>
</template>

<script>
import { getAgreement } from '@/v2/dns_users/api/public'

export default {
  data() {
    return {
      loading: false,
      dialogVisible: false,
      isDisabled: true,
      agreement: ''
    }
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      // 如果同意协议高度小于 盒子高度
      if (this.$refs.textBox) {
        if (this.$refs.textBox.scrollHeight <= 400) {
          this.isDisabled = false
        } else {
          // 先给页面注册滚动事件
          const textBoxDiv = document.getElementById('textBox')

          if (textBoxDiv.addEventListener) {
            textBoxDiv.addEventListener('scroll', this.scrollDiv, true)
          } else {
            textBoxDiv.attachEvent('onscroll', this.scrollDiv, true)
          }
        }
      }
    })
  },
  destroyed() {
    if (window.removeEventListener) {
      window.removeEventListener('scroll', this.scrollDiv, true)
    }
    if (window.detachEvent) {
      window.dispatchEvent('onscroll', this.scrollDiv, true)
    }
  },
  methods: {
    /**
     * @description: 获取同意协议内容
     */
    async showDialog() {
      this.dialogVisible = true

      this.loading = true
      const { data: res } = await getAgreement()
      this.loading = false

      if (res.code !== 1) return

      if (res.data && res.data.paramValue) {
        const paramValue = JSON.parse(res.data.paramValue)
        this.agreement = paramValue && paramValue.agreement
      }

      this.$nextTick(() => {
        this.isDisabled = this.$refs.textBox.scrollHeight > 400
      })
    },

    /**
     * @description: 监听用户是否已经阅读完
     * @param {*} e
     */

    scrollDiv(e) {
      if (!this.isDisabled) return

      if (e.target.scrollHeight - e.target.offsetHeight <= e.target.scrollTop) {
        // 滚动到底部， - 2 表示有上下 1 px 的边框
        this.isDisabled = false
      }
    },

    // 页面关闭则表示不同意
    closeAgree() {
      // this.isDisabled = true
    },

    // 同意
    async agreeSub() {
      this.dialogVisible = false
      this.$msg.success('您已阅读并同意' + this.$root.webName + '服务协议')
    }
  }
}
</script>

<style lang="scss" scoped>
.text_box {
  padding: 10px 15px;
  line-height: 26px;
  min-height: 400px;
  max-height: calc(95vh - 240px);
  overflow-y: scroll;
  border: 1px solid theme('colors.ants-border-3');
}
</style>
