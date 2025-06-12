<template>
  <span
    v-loading="loading"
    element-loading-spinner="el-icon-loading"
    @click="doDownload()"
  >
    <slot />
  </span>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doDownloadSslCert } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

export default {
  props: {
    certId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    // 下载证书
    async doDownload() {
      this.loading = true
      try {
        const res = await doDownloadSslCert({
          certId: this.certId
        })
        this.loading = false
        console.log('res', res)
        const attachment = res.headers['content-disposition'].split('=')[1]
        const domainAndCertId = attachment.split('.gz')[0] || ''
        const defaultFileName = domainAndCertId.replace(/"/g, '')
        const fileName = `${defaultFileName || this.certId}.gz`
        this.$msg.success('下载成功')

        // 下载二进制 zip 文件
        const blob = new Blob([res.data], { type: 'application/octet-stream' })
        if ('download' in document.createElement('a')) {
          // 非IE下载
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
