<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    width="800px"
    top="5vh"
    @close="resetForm"
    :footer="false"
  >
    <template slot="title">
      <div class="font-semibold">
        证书详情【
        <span
          class="inline-block truncate align-middle"
          style="max-width: 50%;"
        >
          {{ certData.commonName }}
        </span>
        】
      </div>
    </template>

    <ul v-loading="loading" class="space-y-lg">
      <li
        v-for="(item, key) in {
          pem_cert: 'SSL PEM：',
          private_key: 'SSL KEY：'
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
              :text="certData.cert[key] || ''"
              class="custom-copy-icon absolute cursor-color rounded-xl bg-ants-bg-5"
              style="top:10px;right:15px;line-height:1; margin:0;font-size:16px;"
            />
          </el-tooltip>

          <div class="text-sm">
            <pre>
              {{ certData.cert[key] || '' }}
            </pre>
          </div>
        </div>
      </li>
    </ul>
  </ants-dialog>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getCertifyDetail } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  data() {
    return {
      loading: false,
      dialogVisible: false,
      certData: {
        id: null,
        commonName: '',
        cert: {}
      }
    }
  },
  methods: {
    showDialog(row = {}) {
      this.dialogVisible = true
      this.certData.id = row.id
      this.certData.commonName = row.commonName
      this.certData.cert = {}
      this.getDetail()
    },

    // 获取证书详情
    async getDetail() {
      this.loading = true
      try {
        const { data: res } = await getCertifyDetail({
          id: this.certData.id
        })
        if (res.code !== 1) return
        this.certData.cert = (res.data || {}).cert || {}
      } finally {
        this.loading = false
      }
    },

    // 表单重置
    resetForm() {}
  }
}
</script>

<style lang="scss">
.custom-copy-icon {
  .copy-icon {
    display: inline-block;
    padding: 10px;
  }
}
</style>
