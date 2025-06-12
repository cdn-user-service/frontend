<template>
  <ants-dialog
    :title="`${title}解析记录`"
    v-model="dialogVisible"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
    ref="dialogRef"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
    >
      <ants-form-item label="主机记录" prop="top">
        <ants-input
          v-model="form.top"
          placeholder="请输入主机记录"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="记录类型" prop="recordType">
        <ants-select v-model="form.recordType" placeholder="请选择记录类型">
          <ants-option
            v-for="item in recordTypeList"
            :key="item"
            :label="item"
            :value="item"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="线路类型" prop="line">
        <ants-select
          v-model="form.line"
          filterable
          placeholder="请选择线路类型"
        >
          <ants-option
            v-for="(item, key) in lineList"
            :key="key"
            :label="item"
            :value="key"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item label="记录值" prop="value">
        <ants-input
          v-model="form.value"
          placeholder="请输入记录值"
        ></ants-input>
      </ants-form-item>

      <ants-form-item label="TTL" prop="ttl">
        <ants-input-number
          v-model="form.ttl"
          :step="1"
          :min="1"
          :precision="0"
          placeholder="TTL"
        ></ants-input-number>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 表单初始化数据
const defaultForm = {
  // 操作类型、create = 创建、update = 修改
  handle: 'create',
  // 记录ID, 添加的时候为空
  recordId: null,
  // 主机记录
  top: '',
  // 记录类型
  recordType: '',
  // 线路类型
  line: '',
  // 记录值
  value: '',
  // ttl
  ttl: 600
}

// 1、当记录类型为 A记录，记录值为 IP地址
const checkA =
  /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/
/**
 * 2、当记录类型为 CNAME记录，记录值为 域名
 * 此正则表达式用于验证域名的合法性
 * 域名必须满足以下条件：
 * - 总长度在3到255个字符之间
 * - 开始于字母或数字
 * - 每个部分（由点分隔）长度在1到62个字符之间，只能包含字母、数字和短划线
 * - 结束于字母或数字，且至少包含一个点和一个两到二十个字母的顶级域名
 */
const checkCNAME =
  /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*(\.[a-zA-Z0-9]{2,20})$/
// 3、当记录类型为 MX记录，记录值为 域名 或者 IP地址
// const checkMX =
// 4、当记录类型为 TXT记录，记录值暂不验证
// const checkTXT =
// 5、当记录类型为 NS记录，记录值为 DNS域名
// const checkNS = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
// 6、当记录类型为 AAAA记录，记录值为 ipv6地址
const checkAAAA =
  /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
// 7、当记录类型为 SRV记录，记录值格式：优先级、空格、权重、空格、端口、空格、主机名，例如： 1 1 8080 ns1.antscdn.com
const checkSRV =
  /^([1-9]|10)\s([1-9]|10)\s([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])\s([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*(\.[a-zA-Z0-9]{2,20}))$/
// 8、当记录类型为 CAA记录，记录值格式：flag tag value。 其中flag目前取值为0-128；tag取值为issue、issuewild、iodef；value为CA的域名或用于违规通知的电子邮箱。例如：12 iodef www.antscdn.com
const checkCAA =
  /^([0-9]|[1-9][0-9]|1[0-2][0-8]|109|119)\s(issue|issuewild|iodef)\s([^\u4e00-\u9fa5|"<>\\\s]+)$/

export default {
  props: {
    cname: String,
    dnsConfigId: String,
    // 可选择的IP；列表
    ipsArr: Array,
    lineList: [Array, Object]
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      // 记录类型列表
      recordTypeList: ['A', 'CNAME', 'TXT', 'AAAA'],

      form: {
        ...defaultForm
      },

      formRules: {
        // 添加DNS对话框的规则
        top: [
          {
            required: true,
            message: '请输入主机记录',
            trigger: ['change', 'blur']
          }
        ],
        recordType: [
          {
            required: true,
            message: '请选择记录类型',
            trigger: 'change'
          }
        ],
        line: [
          {
            required: true,
            message: '请选择线路类型',
            trigger: 'change'
          }
        ],
        value: [
          {
            required: true,
            message: '请输入记录值',
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              if (this.form.recordType === 'CNAME') {
                if (!checkCNAME.test(value)) {
                  callback(new Error('CNAME 记录值格式有误'))
                } else {
                  callback()
                }
              } else if (this.form.recordType === 'A') {
                if (!checkA.test(value)) {
                  callback(new Error('A 记录值格式有误'))
                } else {
                  callback()
                }
              } else if (this.form.recordType === 'AAAA') {
                if (!checkAAAA.test(value)) {
                  callback(new Error('AAAA 记录值格式有误'))
                } else {
                  callback()
                }
              } else {
                callback()
              }
            },
            trigger: ['blur']
          }
        ],
        ttl: [
          {
            required: true,
            message: '请输入TTL',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(row = {}, handle = '') {
      this.dialogVisible = true
      this.title = '添加'
      if (row.recordId) {
        this.title = '编辑'
      }
      this.form = {
        ...defaultForm,
        ...row,
        id: String(this.dnsConfigId),
        domain: this.$route.query.domain
      }

      this.form.handle = handle
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        if (
          this.form.recordType === 'CNAME' &&
          !checkCNAME.test(this.form.value)
        ) {
          this.$message.error('CNAME 记录值格式有误')
          return false
        }

        if (this.form.recordType === 'A') {
          if (!checkA.test(this.form.value)) {
            this.$message.error('A 记录值格式有误')
            return false
          }
        }
        if (this.form.recordType === 'AAAA') {
          if (!checkAAAA.test(this.form.value)) {
            this.$message.error('AAAA 记录值格式有误')
            return false
          }
        }

        this.$refs.dialogRef.btnLoading = true

        const res = this.form.recordId
          ? await this.$listeners.doCreateUpdateDns(this.form)
          : await this.$listeners.doCreateDns(this.form)
        this.$refs.dialogRef.btnLoading = false
        if (!res) return
        this.$parent.changeDnsApiId(String(this.dnsConfigId))
        this.dialogVisible = false
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
