<template>
  <el-card class="content-box animated fadeIn batch-record-box">
    <div slot="header">
      <TitleBorder title="导入记录" />
    </div>

    <ants-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="0"
      label-position="top"
      status-icon
      class="phone-form"
    >
      <ants-form-item label="选择域名">
        <QueryDomainSelect ref="QueryDomainSelectRef" />
      </ants-form-item>

      <ants-form-item prop="file" label="上传JSON文件">
        <el-upload
          class="upload-demo"
          drag
          action=""
          ref="uploadRecords"
          :headers="headersObj"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :auto-upload="false"
          :limit="1"
          accept=".json"
          name="file"
          :http-request="uploadData"
          list-type="text"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            {{ antsT('将文件拖到此处，或') }}<em> {{ antsT('点击上传') }}</em>
          </div>
        </el-upload>
      </ants-form-item>

      <ants-form-item>
        <div class="el-upload__tip">
          <div>{{ antsT('使用说明：') }}</div>
          <!-- <div>
              1、上传文件格式支持 XLS 表格及 ZONE 文件，建议先参考模板格式。
            </div> -->
          <div>
            {{ antsT('现在只支持上传 JSON 文件，建议先参考模板格式。')
            }}<a :href="templateUrl" download="record-template.json">{{
              antsT('下载模板')
            }}</a>
          </div>
          <!-- <div>
              XLS 表格文件必须先选择已有的域名，否则无法上传。<a href="#"
                >下载模板</a
              >
            </div> -->
        </div>
      </ants-form-item>

      <ants-form-item>
        <ants-button
          type="primary"
          size="small"
          :loading="btnLoading"
          @click="submitForm"
          icon="el-icon-check"
          text="批量导入"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
import QueryDomainSelectAdmin from '@/v2/dns_admin/components/QueryDomainSelect'
import QueryDomainSelectUsers from '@/v2/dns_users/components/QueryDomainSelect'
import templateJson from './template.json'
import { getToken } from '@/utils/auth'

const blob = new Blob([JSON.stringify(templateJson, null, 2)], {
  type: 'application/json'
})
const templateUrl = URL.createObjectURL(blob)

// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const { batchCreateRecords } = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

export default {
  components: {
    QueryDomainSelect:
      PROCESS_NAME === 'dns_admin'
        ? QueryDomainSelectAdmin
        : QueryDomainSelectUsers
  },

  data() {
    return {
      templateUrl,
      form: {
        domain: '',
        file: ''
      },
      formRules: {
        domain: [
          {
            required: true,
            message: '请选择域名',
            trigger: 'change'
          }
        ]
      },

      loading: false,
      btnLoading: false,
      domainList: [],
      headersObj: {
        Authorization: getToken()
      }
    }
  },

  methods: {
    /**
     * @description: 批量导入记录提交
     */

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        const domainStr = this.$refs.QueryDomainSelectRef.value
        if (!domainStr) return this.$msg.error('请选择域名！')

        // 上传JSON文件
        this.$refs.uploadRecords.submit()
        if (!this.form.file) return this.$msg.error('请选择要上传的JSON文件')

        this.btnLoading = true
        const form = new FormData() // 携带文件必须使用此对象
        form.append('file', this.form.file)
        // console.log(form.getAll('file'))
        const { data: res } = await batchCreateRecords(domainStr, form)
        this.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success('导入记录成功，请勿重复导入')
        // 清空已上传的文件列表
        this.form.file = ''
        this.$refs.uploadRecords.clearFiles()
      })
    },

    // 覆盖默认的上传行为
    uploadData(param) {
      console.log(param)
      this.form.file = param.file
    },

    // 移除文件钩子
    handleRemove(file) {
      console.log(file)
    },

    // 监听文件上传成功事件
    handleSuccess(response, file) {
      console.log(response)
    }
  }
}
</script>

<style lang="scss">
.batch-record-box {
  .upload-demo {
    width: 360px;
    height: 100%;
    @media screen and (max-width: 600px) {
      width: 100% !important;
    }
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
    background-color: theme('colors.ants-border-3');
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
}
</style>
