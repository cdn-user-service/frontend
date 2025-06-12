<template>
  <el-row :gutter="20">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 12 }"
      :md="{ span: 12 }"
      :lg="{ span: 12 }"
      :xl="{ span: 12 }"
      v-if="$mode['176_179']"
    >
      <TitleBorder title="来源地址设置" class="mb-df" />

      <RefererUrl v-on="$listeners" v-bind="$attrs" ref="RefererUrlRef" />
    </el-col>

    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 12 }"
      :md="{ span: 12 }"
      :lg="{ span: 12 }"
      :xl="{ span: 12 }"
    >
      <TitleBorder title="接口设置" class="mb-df pt-xl md:pt-0" />
      <ants-form
        :model="form"
        :rules="rules"
        ref="formRef"
        space-class="space-y-1"
        label-width="80px"
        label-position="top"
        :disabled="$root.disabledCrud"
      >
        <ants-form-item
          style="display:flex;align-items: center;"
          label="请求周期"
          prop="pri_waf_url_cycle"
        >
          <div style="padding-left: 15px;">
            <ants-input-number
              size="small"
              v-model="form.pri_waf_url_cycle"
              :step="1"
              :min="1"
              :max="999999999"
              :precision="0"
              placeholder="周期"
            />
            <span class="text-sm text-ants-text-4">
              {{ antsT('秒') }}
            </span>
          </div>
        </ants-form-item>

        <ants-form-item label="URL列表（选填）">
          <ants-input
            v-model="form.pri_waf_url_strings"
            placeholder="请输入URL列表，一行一个"
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 5 }"
            style="max-width:350px;"
          />
        </ants-form-item>

        <div class="pt-df">
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            :loading="btnLoading || $root.loading"
            @click="submitForm"
            text="保存配置"
          />
        </div>
      </ants-form>
    </el-col>
  </el-row>
</template>

<script>
import RefererUrl from './RefererUrl'

export default {
  components: {
    RefererUrl
  },
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
      rules: {
        pri_waf_url_cycle: [
          {
            required: true,
            message: '请输入URL周期',
            trigger: ['change', 'blur']
          }
        ],
        pri_waf_url_strings: [
          {
            required: true,
            message: '请输入URL列表，一行一个',
            trigger: ['change', 'blur']
          }
        ]
      },
      btnLoading: false
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取数据
    async getData() {
      const { data: res } = await this.$listeners.getSiteDetail('pri_waf_uri')
      if (!res.attr.length) return
      res.attr.forEach(item => {
        const { pkey, pvalue } = item
        if (pkey === 'pri_waf_url_cycle') {
          this.form.pri_waf_url_cycle = +pvalue
        }
        if (pkey === 'pri_waf_url_strings') {
          this.form.pri_waf_url_strings = (pvalue || '').replace(/,/g, '\n')
        }
      })
    },

    // 表单提交
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const res = await this.$listeners.saveSiteAttr({
            pri_waf_url_cycle: this.form.pri_waf_url_cycle,
            pri_waf_url_strings: this.form.pri_waf_url_strings
              .trim()
              .replace(/[\r\n]+/g, ',')
          })
        } finally {
          this.btnLoading = false
        }
      })
    }
  }
}
</script>
