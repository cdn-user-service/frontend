<template>
  <div>
    <div class="ants-tips_box mt-lg">
      <i class="el-icon-info"></i>
      HTTPDNS使用HTTP协议进行域名解析，代替现有基于UDP的DNS协议，域名解析请求直接发送到HTTPDNS服务器，从而绕过运营商的Local DNS，能够避免Local DNS造成的域名劫持或调度不精准问题。
    </div>

    <el-card
      class="content-box"
      v-loading="loading"
    >
      <ants-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        label-position="left"
        hide-required-asterisk
      >
        <div class="p-lg bg-ants-bg-5 rounded-2xl space-y-df">
          <ants-form-item
            prop="status"
            label="启用HTTPDNS"
          >
            <ants-switch
              v-model="form.status"
              active-text="ON"
              inactive-text="OFF"
              v-loading="switchLoading"
              element-loading-spinner="el-icon-loading"
            />
          </ants-form-item>
          <ants-form-item
            prop="portHttp"
            label="监听端口"
          >
            <ants-input
              v-model="form.portHttp"
              placeholder="请输入监听端口"
              style="max-width: 400px;"
              :disabled="!form.status"
            />
          </ants-form-item>
          <ants-form-item
            prop="domain"
            label="域名"
          >
            <ants-input
              v-model="form.domain"
              placeholder="请输入域名"
              style="max-width: 400px;"
              :disabled="!form.status"
            />
          </ants-form-item>
        </div>

        <div class="p-lg bg-ants-bg-5 rounded-2xl space-y-df">
          <ants-form-item
            prop="httpsStatus"
            label="启用HTTPS"
          >
            <ants-switch
              v-model="form.httpsStatus"
              active-text="ON"
              inactive-text="OFF"
            />
          </ants-form-item>
          <ants-form-item
            prop="portHttps"
            label="监听端口"
          >
            <ants-input
              v-model="form.portHttps"
              placeholder="请输入监听端口"
              style="max-width: 400px;"
              :disabled="!form.httpsStatus"
            />
          </ants-form-item>
          <ants-form-item
            prop="certCrt"
            label="SSL PEM"
          >
            <ants-input
              v-model="form.certCrt"
              placeholder="请输入证书PEM编码"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              style="max-width: 400px;"
              :disabled="!form.httpsStatus"
            />
            <!-- <el-upload
                action=""
                :file-list="fileList"
                list-type="text"
                accept="txt"
                :on-change="onChange"
                :auto-upload="false"
                :limit="1"
              >
                <span
                  style="width:250px;"
                  class="text-center inline-block px-lg bg-ants-bg-1 border border-ants-border-2 rounded-xl cursor-color"
                >
                  上传HTTPS证书
                  <i class="el-icon-plus"></i>
                </span>
              </el-upload> -->
          </ants-form-item>

          <ants-form-item
            prop="certKey"
            label="SSL KEY"
          >
            <ants-input
              v-model="form.certKey"
              placeholder="请输入证书密钥"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 5 }"
              style="max-width: 400px;"
              :disabled="!form.httpsStatus"
            />
          </ants-form-item>
        </div>

        <ants-form-item>
          <ants-button
            class="ml-lg"
            type="primary"
            size="small"
            icon="el-icon-check"
            :loading="btnLoading"
            text="保存配置"
            @click="doSave()"
          />
        </ants-form-item>
      </ants-form>
    </el-card>
  </div>
</template>

<script>
import { getConfigData, doSaveConfig } from '@/v2/dns_admin/api/dns/httpdns'

const defaultForm = {
  // 启用HTTPDNS, 0=关闭httpDns;1=开启HTTPdns;2=开启HTTPSdns;3=开启HTTPDNS,HTTPSdns
  status: 0,
  // 监听端口
  portHttp: 80,
  portHttps: 443,
  // 启用HTTPS
  httpsStatus: 0,
  // HTTPS证书
  certCrt: '',
  // HTTPS私钥
  certKey: '',
  // 域名
  domain: ''
}
export default {
  data() {
    return {
      loading: false,
      btnLoading: false,
      switchLoading: false,
      form: {
        ...defaultForm
      },
      fileList: [],
      fileList1: []
    }
  },
  computed: {
    rules() {
      const { isPort } = this.$validator
      return {
        portHttp: [
          {
            required: true,
            message: '请输入监听端口',
            trigger: ['change', 'blur']
          },
          {
            validator: isPort(),
            trigger: 'blur'
          }
        ],
        portHttps: [
          {
            required: !!this.form.httpsStatus,
            message: '请输入监听端口',
            trigger: ['change', 'blur']
          },
          {
            validator: isPort(),
            trigger: 'blur'
          }
        ],
        domain: [
          {
            required: true,
            message: '请输入域名',
            trigger: ['change', 'blur']
          }
        ],
        certCrt: [
          {
            required: !!this.form.httpsStatus,
            message: '请输入证书PEM编码',
            trigger: ['change', 'blur']
          }
        ],
        certKey: [
          {
            required: !!this.form.httpsStatus,
            message: '请输入证书密钥',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getConfigData()
  },
  methods: {
    // 获取配置数
    async getConfigData() {
      this.loading = true
      try {
        const { data: res } = await getConfigData()
        this.loading = false
        if (res.code !== 1) return
        console.log(res)
        const obj = res.data || {}
        this.form = {
          ...defaultForm,
          ...obj,
          status: (obj.status === 1 || obj.status === 3) ? 1 : 0,
          httpsStatus: obj.status === 3 ? 1 : 0
        }
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 保存配置
    doSave() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        console.log(this.form)
        this.btnLoading = true
        try {
          const { status, httpsStatus } = this.form
          let newStatus = 0
          if (status === 1) {
            newStatus = httpsStatus ? 3 : 1
          }

          const { data: res } = await doSaveConfig({
            ...this.form,
            status: newStatus
          })
          this.btnLoading = false
          if (res.code !== 1) return
          this.$msg.success('保存成功')
        } catch (error) {
          this.btnLoading = false
          throw error
        }
      })
    },

    // 上传证书
    onChange(file, fileList) {
      this.fileList = fileList
      console.log(file, fileList)
    },
    onChange1(file, fileList) {
      this.fileList1 = fileList
      console.log(file, fileList)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
