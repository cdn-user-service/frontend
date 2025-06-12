<template>
  <div class="flex-1 bg-ants-bg-1 rounded-2xl p-lg">
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      class="_ants-table_form_error flex-1"
      label-width="90px"
      :status-icon="false"
    >
      <el-row :gutter="20" class="">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 24 }"
          :md="{ span: 24 }"
          :lg="{ span: 12 }"
          :xl="{ span: 12 }"
        >
          <TitleBorder title="自定义选项" class="mb-2" />

          <el-row :gutter="20">
            <el-col
              :span="12"
              v-for="(item, key) in switchs"
              :key="key"
              class="mt-df"
            >
              <ants-form-item :label="item">
                <div style="margin-top:-2px;" class="whitespace-no-wrap">
                  <ants-switch
                    v-model="form[key]"
                    active-text="ON"
                    inactive-text="OFF"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handleChange()"
                    :loading="loading"
                    :disabled="$root.disabledCrud"
                  />
                  <el-tooltip
                    class="hidden-xs-only"
                    effect="dark"
                    :content="tips[key]"
                    placement="right"
                  >
                    <i
                      class="el-icon-info text-primary cursor-pointer pl-xs inline-block align-middle"
                      style="font-size:15px;"
                    />
                  </el-tooltip>
                </div>
              </ants-form-item>
            </el-col>
          </el-row>
        </el-col>

        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 24 }"
          :md="{ span: 24 }"
          :lg="{ span: 12 }"
          :xl="{ span: 12 }"
          class="h-full"
        >
          <el-divider class="hidden-lg-and-up" />
          <div class="lg:pl-10 lg:border-l border-ants-border-2">
            <WafUrlNew
              v-on="$listeners"
              v-bind="$attrs"
              @switchRefererUrl="handleChange"
              :refererUrl="form.refererUrl"
            />
          </div>
        </el-col>
      </el-row>
    </ants-form>
  </div>
</template>

<script>
import WafUrlNew from './WafUrlNew.vue'

const PROCESS_NAME = process.env.VUE_APP_NAME
// API
const { buildWafRule } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const tips = {
  // 异常拦截
  badRequest: '异常请求过滤拦截',
  // 高频拦截
  highLimit: '开启后将拦截拉黑高频请求IP',
  // 封禁海外
  forbidSeal: '根据业务需求选择开启封禁海外（只允许中国大陆、港澳台）',
  // POST防护
  postCheck: 'POST异常请求规则过滤',
  // 高频热U
  hotUrlCheck: '拦截高频率攻击热点URL',
  // 低频热U
  hotUrlCheckLow: '拦截回源攻击热点URL',
  // 随机验证
  randomCheck: '开启随机验证',
  // 人机验证
  botCheck: '开启人机验证',
  // 来源验证
  refererUrl: '开启来源验证（Referer），请填写右边【来源地址设置】',
  // 随机请求
  randomReq: '开启后将拦截拉黑随机URL请求',
  // 低频请求
  lowLimit: '开启后将拦截拉黑低频请求IP'
}

const defaultForm = {}

Object.keys(tips).forEach(key => {
  defaultForm[key] = 0
})

const switchs = {
  badRequest: '异常拦截',
  hotUrlCheckLow: '回源热U',

  highLimit: '高频拦截',
  postCheck: 'POST防护',

  randomCheck: '随机验证',
  forbidSeal: '封禁海外',

  hotUrlCheck: '高频热U',
  botCheck: '人机验证',

  lowLimit: '低频请求',
  randomReq: '随机请求'

  // refererUrl: $mode['176_179'] ? '来源验证' : ''
}

export default {
  components: {
    WafUrlNew
  },
  data() {
    // if (this.$mode['176_179']) {
    //   switchs.refererUrl = '来源验证'
    // }
    return {
      tips,
      switchs,
      // 生成WAF规则
      form: {
        siteId: this.$route.query.id,
        ...defaultForm
      },
      rules: {},
      loading: false,
      btnloading: false
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取开关数据
    async getData() {
      this.loading = true
      try {
        const { data: res } = await this.$listeners.getSiteDetail(
          '',
          'waf_sys_rule_config'
        )
        const { attr = [] } = res
        attr.forEach(item => {
          const { pkey, pvalue } = item
          if (pkey === 'waf_sys_rule_config') {
            const obj = JSON.parse(pvalue || '{}')
            this.form = { ...this.form, ...obj }
          }
        })
      } finally {
        this.loading = false
      }
    },

    async biuldWaf() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) {
          return this.$msg.error('请填写完整的数据')
        }
        this.btnloading = true
        try {
          const { data: res } = await buildWafRule({
            ...this.form
          })
          if (res.code !== 1) return
          this.$msg.success('规则生成成功')
          // 刷新列表
          this.$emit('refresh')
        } finally {
          this.btnloading = false
        }
      })
    },

    async handleChange(obj = {}) {
      this.loading = true
      try {
        // 来源验证要从子组件提交
        if ('refererUrl' in obj) {
          this.form.refererUrl = obj.refererUrl
        }

        const res = await this.$listeners.saveSiteAttr({
          waf_sys_rule_config: JSON.stringify(this.form)
        })
        if (!res) return
        this.$msg.success('规则生成成功')
        // 刷新列表
        this.$emit('refresh')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss">
.ants-table_form_error {
  .ants-form-item {
    padding: 0;
  }
}
</style>
