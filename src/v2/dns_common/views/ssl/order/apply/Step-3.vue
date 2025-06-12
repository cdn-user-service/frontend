<template>
  <div class="space-y-8">
    <div class="bg-ants-bg-4 rounded-2xl p-df">
      <div class="rounded-2xl p-df bg-ants-bg-4">
        <TitleBorder title="相关操作" />

        <div class="mt-lg flex items-center">
          <ants-input
            v-model="form.key"
            placeholder="请输入私钥密码（选填）"
            class="mr-lg"
            style="width: 200px;"
            size="small"
          />
          <!-- <ants-button
            size="small"
            type="primary"
            text="上传文件"
          /> -->
          <DownloadSslCert :certId="certDetail.certId" class="mr-sm">
            <ants-button size="small" type="primary" text="下载证书" />
          </DownloadSslCert>

          <ants-button
            size="small"
            type="primary"
            text="下载私钥"
            @click="doDownloadPrivateKey()"
          />
          <ants-button
            size="small"
            type="primary"
            text="下载证书链"
            @click="doDownloadCaCertificate()"
          />

          <ApplyCancelDialog
            ref="ApplyCancelDialogRef"
            @refresh="refresh"
            :certId="certDetail.certId"
          />
        </div>
      </div>
    </div>

    <div class="bg-ants-bg-4 rounded-2xl p-df">
      <div class="rounded-2xl p-df bg-ants-bg-4">
        <TitleBorder title="域名验证" />

        <ants-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="0"
          label-position="left"
          class="mt-lg"
          :status-icon="false"
        >
          <div
            v-for="(item, idx) in form.dcvList"
            :key="idx"
            class="flex items-center"
          >
            <ants-form-item :prop="`dcvList.${idx}.domainName`">
              <ants-input
                v-model="item.domainName"
                placeholder="请输入域名"
                class="mr-lg reset-disabled-input"
                style="width: 200px;"
                size="small"
                disabled
              />
            </ants-form-item>
            <ants-form-item
              :prop="`dcvList.${idx}.dcvMethod`"
              :rules="{
                required: true,
                message: '请选择验证方式',
                trigger: 'change'
              }"
            >
              <ants-select
                v-model="item.dcvMethod"
                placeholder="请选择验证方式"
                style="width: 200px;"
                class="mr-lg"
                size="small"
              >
                <ants-option
                  v-for="(item, key) in dcvMethodObj"
                  :key="key"
                  :value="key"
                  :label="item"
                />
              </ants-select>
            </ants-form-item>
            <ants-form-item>
              <ants-button
                v-if="item.is_verify == 'verified'"
                size="mini"
                type="success"
                text="已验证"
                icon="el-icon-check"
              />
              <ants-button
                v-else
                size="mini"
                type="info"
                text="未验证"
                icon="el-icon-close"
              />
            </ants-form-item>
          </div>
        </ants-form>
      </div>
    </div>

    <Contact :contact="certDetail.administrator" />

    <Csr :csr="certDetail.csr" />
  </div>
</template>

<script>
import Csr from './Csr.vue'
import Contact from './Contact.vue'
import DownloadSslCert from './DownloadSslCert.vue'
import ApplyCancelDialog from './ApplyCancelDialog.vue'
import { DCV_METHOD } from '../cert-params'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { doDownloadSslCert } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const rules = {}

export default {
  components: {
    Csr,
    Contact,
    DownloadSslCert,
    ApplyCancelDialog
  },
  data() {
    return {
      rules,
      form: {
        key: '',
        dcvList: [
          {
            dcvEmail: '',
            dcvMethod: '',
            domainName: ''
          }
        ]
      },
      btnLoading: false,
      dcvMethodObj: DCV_METHOD,

      // 证书详情
      certDetail: {
        certId: '',
        // 联系人信息
        administrator: {},
        // CSR验证信息
        csr: '',
        // 绑定域名、验证方式，
        dcvList: [],
        DCVdns: {},
        DCVfile: {}
      }
    }
  },
  methods: {
    // 初始化数据
    init(detail = {}) {
      this.certDetail = {
        ...this.certDetail,
        ...detail
      }
      // 验证域名赋值
      if (this.certDetail.dcvList.length) {
        this.form.dcvList = [...this.certDetail.dcvList]
      }
    },

    // 刷新证书
    refresh() {
      this.$emit('refresh')
    },

    // 下载证书
    async downloadCert() {
      this.btnLoading = true
      try {
        const { data: res } = await doDownloadSslCert({
          certId: this.certDetail.certId
        })
        if (res.code !== 1) return
        this.$msg.success('下载成功')
      } finally {
        this.btnLoading = false
      }
    },

    // 下载私钥
    doDownloadPrivateKey() {
      const { privateKey, certId } = this.certDetail
      // 如果没有私钥，提示没有私钥
      if (!privateKey) {
        return this.$msg.error('私钥获取失败')
      }
      // 下载私钥为 pem 格式
      const blob = new Blob([privateKey], { type: 'text/plain;charset=utf-8' })
      const fileName = `${certId}-privateKey.key`
      this.doDownloadFile(blob, fileName)
    },

    // 下载证书链
    doDownloadCaCertificate() {
      const { caCertificate, certId } = this.certDetail
      // 如果没有证书链，提示没有证书链
      if (!caCertificate) {
        return this.$msg.error('证书链获取失败')
      }
      // 下载证书链为 pem 格式
      const blob = new Blob([caCertificate], {
        type: 'text/plain;charset=utf-8'
      })
      const fileName = `${certId}-caCertificate.ca`
      this.doDownloadFile(blob, fileName)
    },

    // 下载文件
    doDownloadFile(blob, fileName) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName)
      } else {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName
        link.click()
        window.URL.revokeObjectURL(link.href)
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
