<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`${title}DNS API`"
    width="650px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
  >
    <!-- <div class="ants-tips_box mb-xl">
      您可以接入自建DNS API。
      <a
        :href="`${$root.antsWebSite}/doc/126`"
        target="_blank"
        class="el-icon-paperclip underline"
      >
        查看接入文档</a
      >
    </div> -->
    <ants-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <ants-form-item label="自定义名称" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入自定义名称"
          maxlength="17"
          show-word-limit
        />
      </ants-form-item>

      <ants-form-item label="选择DNS" prop="source">
        <ants-select
          v-model="form.source"
          placeholder="请选择DNS"
          style="width: 100%"
        >
          <ants-option
            v-for="(item, key) in sourceObj"
            :key="key"
            :label="item"
            :value="key"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="解析域名" v-if="isAdmin" prop="appDomain">
        <ants-input v-model="form.appDomain" placeholder="请输入解析域名" />
      </ants-form-item>

      <ants-form-item :label="apiLabel.appId" prop="appId">
        <ants-input
          v-model="form.appId"
          :placeholder="'请输入' + apiLabel.appId"
        />
      </ants-form-item>

      <ants-form-item
        :label="apiLabel.appKey"
        prop="appKey"
        v-if="form.source !== 'cloudflare'"
      >
        <ants-input
          v-model="form.appKey"
          :placeholder="'请输入' + apiLabel.appKey"
        />
      </ants-form-item>

      <ants-form-item
        v-if="form.source === 'antsdns'"
        label="API 根路径"
        prop="appUrl"
      >
        <ants-input v-model="form.appUrl" placeholder="请输入自建 API 根路径" />
      </ants-form-item>

      <ants-form-item label="解析域名" v-if="!isAdmin">
        <ants-input
          v-model="form.appDomain"
          placeholder="选填，如不填写则不能查看解析记录"
        />
      </ants-form-item>
      <!-- <ants-form-item label="启用状态">
        <ants-switch
          v-model="form.status"
          active-text="启用"
          inactive-text="禁用"
        />
      </ants-form-item> -->
    </ants-form>
  </ants-dialog>
</template>

<script>
import { $mode, $dnsApiMode } from '@/utils/env'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doCreateUpdateDnsApi } = require(`@/v2/${PROCESS_NAME}/api/cdn/dns`)

const defaultForm = {
  // id = 0 表示添加，否则为修改
  id: 0,
  //
  remark: '',
  // 暂时固定
  userType: 1,
  userId: 1,
  // 解析域名
  appDomain: '',
  // DNS 服务商类型
  source: 'antsdns',
  // 密钥
  appId: '',
  appKey: '',
  appUrl: '',
  status: 1
}

const sourceObj = {
  antsdns: '自建DNS',
  aliyun: '阿里云DNS',
  dnspod: 'DNSPod',
  godaddy: 'GoDaddy',
  cloudflare: 'Cloudflare'
}

export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      sourceObj,
      isSuDun: $mode[176],
      isXDp: $dnsApiMode[88],
      isAdmin: PROCESS_NAME === 'cdn_admin'
    }
  },
  computed: {
    apiLabel() {
      const { source } = this.form
      return {
        appId: source == 'cloudflare' ? 'Apitokens' : '密钥 ID',
        // appKey: source == 'cloudflare' ? 'ApiZoneId' : '密钥 Key'
        appKey: '密钥 Key'
      }
    },
    rules() {
      return {
        // 添加DNS对话框的规则
        remark: [
          {
            required: true,
            message: '请输入自定义名称',
            trigger: ['change', 'blur']
          }
        ],
        source: [
          {
            required: true,
            message: '请选择DNS类型',
            trigger: 'change'
          }
        ],
        appDomain: [
          {
            required: true,
            message: '请输入解析域名',
            trigger: ['change', 'blur']
          }
        ],
        appId: [
          {
            required: true,
            message: '请输入' + this.apiLabel.appId,
            trigger: ['change', 'blur']
          }
        ],
        appKey: [
          {
            required: true,
            message: '请输入' + this.apiLabel.appKey,
            trigger: ['change', 'blur']
          }
        ],
        appUrl: [
          {
            required: true,
            message: '请输入自建 API 根路径',
            trigger: ['change', 'blur']
          }
        ]
      }
    },
    title() {
      return this.form.id ? '修改' : '添加'
    }
  },
  mounted() {
    console.log('this.===>', $mode, $dnsApiMode, this.isXDp)
    const addXdp = this.isXDp ? { xdpdns: 'xdpdns' } : null
    const addSudun = this.isSuDun ? { '99dns': '99Dns' } : null
    this.sourceObj = { ...sourceObj, ...addSudun, ...addXdp }
  },
  methods: {
    showDialog(row) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm,
        ...row
      }
    },

    // 添加DNS API 提交
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data } = await doCreateUpdateDnsApi(this.form)
          if (data.code !== 1) return
          this.dialogVisible = false
          this.$parent.getTableData()
          this.$msg.success(this.title + 'DNS API成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
