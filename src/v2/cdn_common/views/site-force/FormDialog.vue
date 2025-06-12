<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`${logTitle}强制跳转`"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      :status-icon="false"
    >
      <ants-form-item label="域名" prop="domain" v-if="logTitle != '批量修改'">
        <ants-input v-model="form.domain" placeholder="请输入域名" />
      </ants-form-item>

      <ants-form-item label="跳转地址" prop="rewriteUrl">
        <ants-input v-model="form.rewriteUrl" placeholder="请输入跳转地址">
          <ants-select
            v-model="form.scheme"
            slot="prepend"
            placeholder="协议"
            style="width: 110px"
          >
            <el-option label="http://" value="http://"></el-option>
            <el-option label="https://" value="https://"></el-option>
          </ants-select>
        </ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { requestOther } = require(`@/v2/${PROCESS_NAME}/api/public`)

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  cnameDomain: '',
  domain: '',
  rewriteUrl: '',

  scheme: 'http://'
}

export default {
  components: {},
  data() {
    // 验证规则
    const { isDomain, isDomains, isUrl } = this.$validator

    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        domain: [
          {
            required: true,
            message: '请输入域名',
            trigger: ['change', 'blur']
          },
          {
            validator: isDomain(),
            trigger: 'blur'
          }
        ],
        cnameDomain: {
          required: true,
          message: '请输入CNAME',
          trigger: ['change', 'blur']
        },

        rewriteUrl: [
          {
            required: true,
            message: '请输入跳转地址',
            trigger: ['change', 'blur']
          }
        ],

        alias: [
          {
            validator: isDomains(),
            trigger: 'blur'
          }
        ]
      },

      dnsRewrite: {
        dnsAddress: '',
        cnameDomain: ''
      },
      logTitle: '',
      allData: []
    }
  },
  methods: {
    show(type = '', row = {} || [], dnsRewrite = {}) {
      if (type === 'allUpdate') {
        this.allData = row
        this.logTitle = '批量修改'
        // 替换 https:// 和 http:// 为空
        // const rewriteUrl = row[0].rewriteUrl
        //   ? row[0].rewriteUrl.replace(/(https?:\/\/)/, '')
        //   : ''

        // console.log((row[0].rewriteUrl || '').replace(rewriteUrl, ''))
        this.form = {
          ...defaultForm
        }
        this.dnsRewrite = {
          ...dnsRewrite
        }
      } else if (type === 'add') {
        this.logTitle = '添加'
      } else {
        this.logTitle = '修改'
        // 替换 https:// 和 http:// 为空
        const rewriteUrl = row.rewriteUrl
          ? row.rewriteUrl.replace(/(https?:\/\/)/, '')
          : ''

        console.log((row.rewriteUrl || '').replace(rewriteUrl, ''))
        this.form = {
          ...defaultForm,
          ...row,
          rewriteUrl,
          scheme: (row.rewriteUrl || '').replace(rewriteUrl, '') || 'http://'
        }
        this.dnsRewrite = {
          ...dnsRewrite
        }
      }
      this.dialogVisible = true
    },

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          let obj = {}
          let arr = []
          if (this.logTitle === '批量修改') {
            arr = this.allData.map((item) => {
              return JSON.stringify({
                ...item,
                scheme: this.form.scheme,
                cnameDomain: item.cnameDomain,
                rewriteUrl: this.form.scheme + this.form.rewriteUrl,
                certInfo: null
              })
            })
            obj = {
              url: this.dnsRewrite.dnsAddress + '/app/rewrite/cname/save',
              method: 'post',
              params: arr
            }
            console.log('批量修改===》', arr)
          } else {
            obj = {
              url: this.dnsRewrite.dnsAddress + '/app/rewrite/cname/save',
              method: 'post',
              param: JSON.stringify({
                ...this.form,
                cnameDomain:
                  this.form.cnameDomain || this.dnsRewrite.cnameDomain,
                rewriteUrl: this.form.scheme + this.form.rewriteUrl
              })
            }
          }
          // console.log('提交参数', obj)
          const { data: res } = await requestOther(obj)
          if (res.code !== 1) return
          // const trueData = JSON.parse(res.data || '{}')
          // if (!trueData.code) return this.$msg.error(trueData.msg)
          this.dialogVisible = false
          this.$msg.success('保存成功')
          this.$emit('refresh')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
