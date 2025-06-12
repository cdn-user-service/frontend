<template>
  <ants-form
    ref="formRef"
    :model="form"
    :rules="formRules"
    label-width="110px"
    :status-icon="false"
    space-class="space-y-6"
  >
    <ants-form-item label="域名列表" prop="domains">
      <div style="max-width: 400px" class="relative">
        <ants-input
          type="textarea"
          rows="8"
          placeholder="输入一级域名，每行一个，最多可输入1000个域名。例如：
  domain1.com
  domain2.com"
          v-model="form.domains"
        />
        <span class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs">
          已输入(<span class="text-primary">{{ domainRows }}</span
          >)行
        </span>
      </div>
    </ants-form-item>
    <ants-form-item label="主机记录" prop="tops">
      <ants-input
        style="max-width: 400px"
        placeholder="多个可用逗号“,” 分割"
        v-model="form.tops"
      />
      <span class="ml-sm text-sm text-ants-text-4"> 例如 www,@,wap </span>
    </ants-form-item>
    <ants-form-item label="记录类型" prop="type">
      <TypeSelect
        v-model="form.type"
        ref="sortRef"
        @change="changeType"
        style="max-width: 400px"
        size="medium"
      />
      <span class="ml-sm text-sm text-ants-text-4"> 默认显示A记录 </span>
    </ants-form-item>
    <ants-form-item label="记录值" prop="value">
      <ants-input
        style="max-width: 400px"
        :placeholder="valuePlaceholder[form.type]"
        v-model="form.value"
      />
    </ants-form-item>
    <ants-form-item label="线路类型" prop="line">
      <ants-select
        placeholder="默认"
        disabled
        v-model="form.line"
        style="max-width: 400px"
      >
        <ants-option label="默认" value="100000000-999999999" />
      </ants-select>
      <span class="ml-sm text-sm text-ants-text-4">
        无需特殊设置，请保持默认即可
      </span>
    </ants-form-item>
  </ants-form>
</template>

<script>
import TypeSelect from '../../domain-admin/record/TypeSelect.vue'

const defaultForm = {
  // 域名列表
  domains: '',
  // 主机记录
  tops: '',
  // 记录类型
  type: 'A',
  // 记录值
  value: '',
  // 线路
  line: '100000000-999999999'
}

const formRules = {
  domains: [
    {
      required: true,
      message: '请输入域名列表',
      trigger: ['blur', 'change']
    }
  ],
  tops: [
    {
      required: true,
      message: '请输入主机记录',
      trigger: ['blur', 'change']
    }
  ],
  type: [
    {
      required: true,
      message: '请选择记录类型',
      trigger: 'change'
    }
  ],
  value: [
    {
      required: true,
      message: '请输入记录值',
      trigger: ['blur', 'change']
    }
  ],
  line: [
    {
      required: true,
      message: '请选择线路类型',
      trigger: 'change'
    }
  ]
}

const valuePlaceholder = {
  A: '将域名指向一个IPv4地址',
  CNAME: '将域名指向另一个域名',
  MX: '将域名指向邮件服务器地址',
  TXT: '文本长度限制255。通常做SPF记录（反垃圾邮件）',
  NS: '域名服务器记录，把子域名交给其他DNS服务商解析',
  AAAA: '将域名指向一个IPv6地址',
  SPF: '用于指定发送邮件的服务器（反垃圾邮件）',
  SRV: '记录哪台计算机提供了某项服务',
  CAA: '用于指定域名的证书颁发机构（CA）',
  SURL: '将一个域名重定向至某个具体网页，且显示实际 URL',
  HURL: '将一个域名重定向至某个具体网页，但隐藏实际 URL'
}

export default {
  components: {
    TypeSelect
  },
  data() {
    return {
      form: {
        ...defaultForm
      },
      formRules,
      valuePlaceholder
    }
  },
  computed: {
    // 已输入多少行域名
    domainRows() {
      if (this.form.domains === '') return 0
      return this.form.domains.trim().split(/[\r\n]+/).length
    }
  },
  created() {},
  methods: {
    // 记录类型改变
    changeType(val) {},

    // 提交表单
    submit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        console.log(this.form)

        const { domains, tops, type, value } = this.form
        this.$emit('submit', {
          form: {
            // 域名数组
            domain: domains.trim().split(/[\r\n]+/),
            // 主机记录
            tops,
            // 记录类型
            record_type: type,
            // 记录值
            value
          },
          // 执行成功后的回调
          success: this.resetForm
        })
      })
    },

    // 重置表单
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
