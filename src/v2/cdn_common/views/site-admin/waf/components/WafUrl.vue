<template>
  <ants-form-card v-loading="$root.loading">
    <template slot="title">{{ antsT('URL频率') }}</template>
    <template slot="content">
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="120px"
      >
        <ants-form-item label="URL频率周期" prop="pri_waf_url_cycle">
          <ants-input-number
            size="small"
            v-model="form.pri_waf_url_cycle"
            :step="1"
            :min="1"
            :max="999999999"
            :precision="0"
            placeholder="频率周期"
          />
          {{ antsT('秒') }}
        </ants-form-item>
        <ants-form-item label="URL频率列表" prop="pri_waf_url_strings">
          <ants-input
            v-model="form.pri_waf_url_strings"
            placeholder="请输入URL频率列表，一行一个"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 10 }"
          />
        </ants-form-item>

        <ants-form-item>
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            :loading="btnLoading"
            @click="submitForm"
            text="保存配置"
          />
        </ants-form-item>
      </ants-form>
    </template>
  </ants-form-card>
</template>

<script>
export default {
  data() {
    return {
      keyStr: 'pri_waf_uri',
      // 开关，[bool]
      status: 0,

      form: {
        // uri频率的周期 | int
        pri_waf_url_cycle: 5,
        // uri频率的URL列表 | l_text
        pri_waf_url_strings: ''
      },
      formRules: {
        pri_waf_url_cycle: [
          {
            required: true,
            message: '请输入URL频率周期',
            trigger: ['change', 'blur']
          }
        ]
        // pri_waf_url_strings: [
        //   {
        //     required: true,
        //     message: '请输入URL频率列表，一行一个',
        //     trigger: ['change', 'blur']
        //   }
        // ]
      },
      btnLoading: false
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData() {
      const { data: res } = await this.$listeners.getSiteDetail('pri_waf_uri')
      if (!res.attr.length) return
      console.log(res)
      res.attr.forEach(item => {
        if (item.pkey === 'pri_waf_url_cycle') {
          this.form.pri_waf_url_cycle = +item.pvalue
        }
        if (item.pkey === 'pri_waf_url_strings') {
          this.form.pri_waf_url_strings = (item.pvalue || '').replace(
            /,/g,
            '\n'
          )
        }
      })
    },

    // 表单提交
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const res = this.$listeners.saveSiteAttr({
          pri_waf_url_cycle: this.form.pri_waf_url_cycle,
          pri_waf_url_strings: this.form.pri_waf_url_strings
            .trim()
            .replace(/[\r\n]+/g, ',')
        })
        this.btnLoading = false
      })
    }
  }
}
</script>
