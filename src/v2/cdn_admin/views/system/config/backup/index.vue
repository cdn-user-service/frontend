<template>
  <el-card class="content-box animated fadeIn">
    <div slot="header">
      <strong>数据库备份</strong>
    </div>

    <div class="bg-ants-bg-5 rounded-2xl p-lg mb-lg">
      <strong class="mr-lg text-ants-text-3">备份数据库</strong>
      <ants-button
        type="primary"
        size="small"
        @click="doBackupExport"
        icon="el-icon-download"
        text="下载数据库"
        :loading="loading"
      />
    </div>

    <!-- <div class="bg-ants-bg-5 rounded-2xl p-lg flex">
      <strong
        class="mr-lg text-ants-text-3 inline-block"
        style="line-height:33px;"
      >导入数据库</strong>

      <el-upload
        class="upload-demo"
        action="https://www.vedns.com/api/sys/config/import/db"
        :auto-upload="true"
        :on-remove="handleRemove"
        :limit="2"
        accept=".sql"
        :on-exceed="handleExceed"
        :on-change="onChange"
        :file-list="fileList"
        :headers="headers"
      >
        <ants-button
          size="small"
          type="primary"
          icon="el-icon-plus"
          text="点击上传SQL文件"
        />
      </el-upload>
    </div> -->
  </el-card>
</template>

<script>
// api
import {
  doBackupExport,
  doBackupImport
} from '@/v2/cdn_admin/api/system/config'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      loading: false,
      fileList: [],

      headers: {
        token: getToken()
      }
    }
  },
  methods: {
    // 点击下载数据库
    async doBackupExport() {
      this.loading = true
      try {
        // 直接下载该文件
        const res = await doBackupExport()
        this.loading = false
        this.$msg.success('下载成功')
        const blob = new Blob([res.data], {
          type: 'application/octet-stream'
        })
        const fileName = `CDN-DB备份-${this.$dayjs().format(
          'YYYY-MM-DD HH:mm:ss'
        )}.sql`
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName
        link.click()
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    onChange(file, fileList) {
       console.log(file, fileList)
    },

    handleExceed() {},

    //
    handleRemove() {}
  }
}
</script>

<style lang="scss" scoped>
</style>
