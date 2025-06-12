<template>
  <el-dialog
    title="导入IP段数据"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="600px"
    @close="resetForm"
    center
  >
    <div class="upload_box">
      <div>
        <el-upload
          class="upload-demo"
          drag
          action=""
          ref="uploadIp"
          :headers="headersObj"
          :auto-upload="false"
          :limit="1"
          accept=".txt"
          name="ipfile"
          :http-request="uploadImg"
          list-type="text"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或 <em>点击上传</em>
            <div style="font-weight:700;">
              仅支持上传 .txt 格式
            </div>
          </div>
        </el-upload>
      </div>

      <ul class="text-ants-text-3 space-y-8 text-sm mt-lg">
        <li>
          1、仅支持上传 .txt 格式的文件；
        </li>
        <li>
          2、文件内容格式：一行为一个IP段， 如：1.1.1.1 99.99.99.99
          中国湖北省十堰市。
        </li>
        <li>
          3、数据导入过程中请勿刷新页面。
        </li>
      </ul>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" type="info" @click="dialogVisible = false"
        >取 消</el-button
      >
      <el-button
        size="small"
        type="primary"
        :loading="btnLoading"
        @click="submitUploadFile()"
        >导 入</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
// api
import { importIpListData } from '@/v2/dns_admin/api/dns/ips'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      btnLoading: false,
      dialogVisible: false,
      headersObj: {
        Authorization: getToken()
      },
      ipfile: null
    }
  },
  methods: {
    // 覆盖默认的上传行为
    uploadImg(param) {
      this.ipfile = param.file
    },

    // 点击导入按钮进行文件上传
    async submitUploadFile() {
      this.$refs.uploadIp.submit()
      if (!this.ipfile) {
        return this.$msg.error('请选择要上传的txt文件')
      }

      this.btnLoading = true

      const form = new FormData() // 携带文件必须使用此对象
      form.append('file', this.ipfile)
      // console.log(form.getAll('domain'))
      const { data: res } = await importIpListData(form)

      this.btnLoading = false

      if (res.code !== 1) return
      this.$parent.getTableData()

      // 提示成功多少个、失败多少个
      let text = '已成功导入' + res.data.success_count + ' 个IP段。'
      if (res.data.success_count != res.data.data_count) {
        text +=
          res.data.data_count - res.data.success_count + ' 个IP段导入失败！'
      }
      this.$alert(text, '友情提示', {
        confirmButtonText: '确定',
        type:
          res.data.success_count != res.data.data_count ? 'warning' : 'success',
        center: true,
        callback: action => {
          this.dialogVisible = false
        }
      })
    },

    // 表单重置
    resetForm() {
      this.btnLoading = false
      this.ipfile = null
      this.$refs.uploadIp.clearFiles()
    }
  }
}
</script>

<style lang="scss">
.upload_box {
  .upload-demo {
    position: relative;
  }
  .el-upload-list--picture-card {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .el-upload-list--picture-card .el-upload-list__item {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
  }

  .el-upload {
    width: 100%;
    height: 100%;
  }
  .el-upload-dragger {
    width: 100% !important;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 160px;
    .el-icon-upload {
      margin: 0;
      margin-bottom: 15px;
    }
    .el-upload__text {
      line-height: 25px;
    }
  }
  .el-upload-list__item {
    position: absolute;
    top: 0;
    left: 0;
    background-color: theme('colors.ants-text-3');
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    font-size: 20px;
  }
  .el-icon-close {
    display: inline-block !important;
  }
}
</style>
