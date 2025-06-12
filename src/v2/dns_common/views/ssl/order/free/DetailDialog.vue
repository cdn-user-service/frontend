<template>
  <ants-dialog
    title="证书详情"
    width="800px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
    top="5vh"
    :footer="false"
  >
    <ul v-loading="loading" class="space-y-lg">
      <li
        v-for="(item, key) in {
          crt: 'SSL PEM：',
          key: 'SSL KEY：'
        }"
        :key="key"
        class="block relative sm:flex"
      >
        <div style="width:80px" class="font-semibold pt-sm">
          {{ item }}
        </div>

        <div
          style="height:calc((100vh - 350px) / 2);"
          class="flex-1 border border-ants-border-3 bg-ants-bg-1 rounded-2xl p-df leading-8 overflow-y-auto"
        >
          <el-tooltip effect="light" content="复制" placement="top-end">
            <ants-copy
              icon
              :text="form[key] || ''"
              class="custom-copy-icon absolute cursor-color rounded-xl bg-ants-bg-5"
              style="top:10px;right:15px;line-height:1; margin:0;font-size:16px;"
            />
          </el-tooltip>

          <div class="text-sm">
            <pre>
              {{ form[key] || '' }}
            </pre>
          </div>
        </div>
      </li>
    </ul>
  </ants-dialog>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getFreeSslDetail } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

export default {
  props: {},
  data() {
    return {
      loading: false,
      dialogVisible: false,
      form: {
        crt: '',
        key: ''
      }
    }
  },
  methods: {
    // 对话框显示
    show({ key, crt, orderId }) {
      this.dialogVisible = true
      this.form.crt = crt
      this.form.key = key

      if (!crt || !key) {
        this.getSslCertDetail(orderId)
      }
    },

    // 查询证书详情，刚购买的证书查询不到详情，需要手动查询
    async getSslCertDetail(orderId) {
      this.loading = true
      try {
        const { data: res } = await getFreeSslDetail({
          orderId
        })
        const obj = res || {}
        this.form.crt = obj.crt
        this.form.key = obj.key
      } finally {
        this.loading = false
      }
    },

    // 表单提交
    submit() {},

    // 对话框关闭
    closed() {
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
.free-ssl-detail {
  font-size: 12px;
  &.el-textarea.is-disabled {
    .el-textarea__inner {
      background-color: theme('colors.ants-bg-1');
      color: theme('colors.ants-text-1');
      cursor: copy;
    }
  }
}

.custom-copy-icon {
  .copy-icon {
    display: inline-block;
    padding: 10px;
  }
}
</style>
