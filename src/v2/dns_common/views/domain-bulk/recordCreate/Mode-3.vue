<template>
  <ants-form
    ref="formRef"
    :model="form"
    :rules="formRules"
    label-width="110px"
    :status-icon="false"
    space-class="space-y-6"
  >
    <ants-form-item
      label="域名列表"
      prop="domains"
    >
      <div
        class="relative"
        style="max-width:400px;"
      >
        <ants-input
          type="textarea"
          rows="8"
          placeholder="输入一级域名，每行一个，最多可输入1000个域名。例如：
  domain1.com
  domain2.com"
          v-model="form.domains"
        />
        <span class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs">
          已输入(<span class="text-primary">{{ domainRows }}</span>)行
        </span>
      </div>
    </ants-form-item>
    <ants-form-item
      label="主机记录"
      prop="tops"
    >
      <ants-input
        style="max-width:400px;"
        placeholder="多个可用逗号“,” 分割"
        v-model="form.tops"
      />
      <span class="ml-sm text-sm text-ants-text-4">
        例如 www,@,wap
      </span>
    </ants-form-item>
    <ants-form-item
      label="记录类型"
      prop="type"
    >
      <TypeSelect
        v-model="form.type"
        ref="sortRef"
        @change="changeType"
        style="max-width:400px;"
        size="medium"
      />
      <span class="ml-sm text-sm text-ants-text-4">
        默认显示A记录
      </span>
    </ants-form-item>
    <ants-form-item
      label="记录值"
      prop="value"
    >
      <div class="flex flex-col sm:flex-row">
        <div
          class="relative flex-1"
          style="max-width:400px;"
        >
          <ants-input
            type="textarea"
            rows="8"
            placeholder="一行一个记录值，最多不超过域名的个数"
            v-model="form.value"
          />
          <span class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs">
            已输入(<span class="text-primary">{{ valueRows }}</span>)行
          </span>
        </div>

        <div
          class="leading-10 pl-df text-sm text-ants-text-4 align-top"
          style="max-width:420px"
        >
          将第一个域名解析到第一个记录值，按照顺序依次将域名解析到对应的记录值；
          到第 <span class="text-error">[记录值个数+1]</span> 个域名时，重新开始
          解析到第一个记录值，如此循环遍历解析；以上可做到尽量等分域名分组解析到不同记录值，
          详细解析结果可看任务日志。
          <div class="text-error mt-sm">注意：记录值个数不能超过域名个数</div>
        </div>
      </div>

    </ants-form-item>
    <ants-form-item
      label="线路类型"
      prop="line"
    >
      <ants-select
        placeholder="默认"
        disabled
        v-model="form.line"
        style="max-width:400px;"
      >
        <ants-option
          label="默认"
          value="100000000-999999999"
        />
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

export default {
  components: {
    TypeSelect
  },
  data() {
    return {
      form: {
        ...defaultForm
      },
      formRules
    }
  },
  computed: {
    // 已输入多少行域名
    domainRows() {
      if (this.form.domains === '') return 0
      return this.form.domains.trim().split(/[\r\n]+/).length
    },

    // 已输入多少行记录
    valueRows() {
      if (this.form.value === '') return 0
      return this.form.value.trim().split(/[\r\n]+/).length
    }
  },
  created() {},
  methods: {
    // 记录类型改变
    changeType(val) {},

    // 提交表单
    submit() {
      this.$refs.formRef.validate((valid) => {
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
            // 记录值，数组
            value: value.trim().split(/[\r\n]+/)
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
