<template>
  <div class="space-y-8">
    <div class="bg-ants-bg-4 rounded-2xl p-df">
      <div class="rounded-2xl p-df bg-ants-bg-4">
        <TitleBorder title="相关操作" />

        <div class="mt-lg">
          <ApplyCancelDialog
            ref="ApplyCancelDialogRef"
            @refresh="refresh"
            :certId="certDetail.certId"
          />
          <!-- <ants-button
            size="small"
            type="primary"
            text="下载私钥"
            icon="el-icon-download"
            :loading="btnLoading"
          /> -->
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
          class="my-lg"
          :status-icon="false"
          space-class="space-y-4"
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
                class="ml-df"
                size="mini"
                type="primary"
                text="修改"
                :loading="btnLoading"
                :disabled="delLoading"
                @click="doUpdateDcv(item)"
              />
              <ants-button
                v-if="idx > 0"
                size="mini"
                type="danger"
                text="删除"
                :loading="delLoading"
                :disabled="btnLoading"
                @click="doRemoveDomain(idx, item.domainName)"
              />
            </ants-form-item>
          </div>
        </ants-form>
        <div>
          <ants-button
            size="small"
            type="primary"
            :disabled="btnLoading || delLoading"
            :loading="btnValidLoading"
            icon="el-icon-s-promotion"
            @click="doValidateDomain()"
            :text="
              btnValidLoading
                ? '验证中...'
                : form.dcvInfo == 'DCVfile'
                ? '文件验证'
                : 'DNS验证'
            "
          />
        </div>

        <el-divider></el-divider>
        <ants-radio-group v-model="form.dcvInfo">
          <ants-radio label="DCVdns" text="DNS验证" />
          <ants-radio label="DCVfile" text="文件验证" />
        </ants-radio-group>
        <ul class="space-y-sm pt-lg">
          <li v-for="(item, key) in dcvInfo" :key="key" class="">
            <span class="inline-block font-semibold" style="width:80px;"
              >{{ antsT(item) }}：</span
            >
            <ants-copy :text="(certDetail[form.dcvInfo] || {})[key]" />
          </li>
        </ul>
      </div>
    </div>

    <Contact :contact="certDetail.administrator" />

    <Csr :csr="certDetail.csr" />
  </div>
</template>

<script>
import Csr from './Csr.vue'
import Contact from './Contact.vue'
import ApplyCancelDialog from './ApplyCancelDialog.vue'

import { DCV_METHOD } from '../cert-params'

const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doUpdateSslDcv,
  doRemoveSslDomain,
  doValidateDNS
} = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const rules = {}
export default {
  components: {
    Csr,
    Contact,
    ApplyCancelDialog
  },
  data() {
    return {
      rules,
      form: {
        dcvInfo: 'DCVdns',
        dcvList: [
          {
            dcvEmail: '',
            dcvMethod: '',
            domainName: ''
          }
        ]
      },
      btnValidLoading: false,
      btnLoading: false,
      delLoading: false,
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
  computed: {
    dcvInfo() {
      const DCVdnsObj = {
        DCVdnsHost: '主机记录',
        DCVdnsValue: '记录值',
        DCVdnsType: '记录类型'
      }
      const DCVfileObj = {
        DCVfileName: '文件名',
        DCVfilePath: '文件路径',
        DCVfileContent: '文件内容'
      }
      return this.form.dcvInfo === 'DCVdns' ? DCVdnsObj : DCVfileObj
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

    // 修改DCV验证方式，域名验证方式
    async doUpdateDcv(item) {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        const confirmResult = await this.$confirm(
          `您确定要修改域名【${item.domainName}】的验证方式？`,
          '修改DCV验证方式',
          {
            center: true,
            type: 'info'
          }
        ).catch(err => err)

        if (confirmResult !== 'confirm') {
          return
        }

        console.log(this.form)
        this.btnLoading = true
        try {
          const { data: res } = await doUpdateSslDcv({
            ...item,
            certId: this.certDetail.certId
          })
          if (res.code !== 1) return
          this.$msg.success('修改成功')
          // 返回上一页
        } finally {
          this.btnLoading = false
        }
      })
    },

    // 点击验证域名
    async doValidateDomain() {
      this.btnValidLoading = true
      const typeObj = {
        DCVdns: 'dns',
        DCVfile: 'file'
      }
      try {
        const { data: res } = await doValidateDNS({
          certId: this.certDetail.certId,
          type: typeObj[this.form.dcvInfo]
        })
        if (res.code !== 1) return
        this.$msg.success('验证成功')
      } finally {
        this.btnValidLoading = false
      }
    },

    // 删除申请中的域名
    async doRemoveDomain(idx, domainName) {
      if (!idx) return

      const confirmResult = await this.$confirm(
        `此操作将会删除申请中的ssl域名：${domainName}，是否继续？`,
        '删除域名',
        {
          center: true,
          type: 'error'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') return

      this.delLoading = true
      try {
        const { data: res } = await doRemoveSslDomain({
          certId: this.certDetail.certId,
          domainName
        })
        if (res.code !== 1) return
        this.$msg.success('删除域名成功')
        this.refresh()
      } finally {
        this.delLoading = false
      }
    }
  }
}
</script>

<style lang="scss">
.reset-disabled-input {
  &.is-disabled .el-input__inner {
    background-color: theme('colors.ants-bg-1');
    color: theme('colors.ants-text-1');
  }
}
</style>
