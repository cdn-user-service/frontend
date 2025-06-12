<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <div slot="header">
        <TitleBorder title="DNS强制转发配置"></TitleBorder>
      </div>

      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
        label-position="top"
      >
        <ants-form-item prop="cnameDomain" label="CNAME">
          <ants-input v-model="form.cnameDomain" placeholder="请输入CNAME" />
        </ants-form-item>

        <ants-form-item prop="dnsAddress">
          <span slot="label">
            <span>DNS客户端API接口请求根路径</span>
            <span class="text-error pl-sm">
              客户端站点根路径 +
              {{ apiRoot }}【如：https://www.dns.com{{ apiRoot }}】
            </span>
          </span>
          <ants-input
            v-model="form.dnsAddress"
            placeholder="请输入DNS客户端API接口请求根路径"
          />
        </ants-form-item>

        <ants-form-item>
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-check"
            :loading="btnLoading"
            @click="submitForm"
            text="保存配置"
          />
        </ants-form-item>
      </ants-form>
    </el-card>
  </div>
</template>

<script>
import mixins from '../mixins'

const defaultForm = {
  cnameDomain: '',
  dnsAddress: ''
}

const resetAPI = (window.config || {}).resetAPI

const apiRoot = resetAPI ? '/api/' : '/ants-dns-api/'

export default {
  mixins: [mixins],
  data() {
    const { isIp, isPort } = this.$validator
    return {
      apiRoot,
      btnLoading: false,
      form: {
        ...defaultForm
      },
      formRules: {
        cnameDomain: [
          {
            required: true,
            message: '请输入CNAME',
            trigger: ['change', 'blur']
          }
        ],
        dnsAddress: [
          {
            required: true,
            message: '请输入DNS客户端API接口请求根路径',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getDetailByKey()
  },
  methods: {
    // 获取配置数据
    async getDetailByKey() {
      const { data: res } = await this.getGlobalKeyDetail('dns_rewrite_conf')
      if (!res) return
      console.log(res)
      const pvalue = JSON.parse(res.pvalue || '{}')
      console.log('pvalue', pvalue)
      this.form = {
        ...this.form,
        ...pvalue
      }
    },

    // 表单提交
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const data = await this.saveGlobalAttr({
            dns_rewrite_conf: JSON.stringify(this.form)
          })
          if (!data) return
          this.$msg.success('保存成功')
        } finally {
          this.btnLoading = false
        }
      })
    }
  }
}
</script>
