<template>
  <div class="content-box animated fadeIn" style="margin-top:0;">
    <ants-tab-card :tab-arr="tabArr" @change="changeCode" :active="activeCode">
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        space-class="space-y-8"
      >
        <div class="ants-tips_box">
          <span class="el-icon-info"></span>
          当启用自定义 HTML 模式，可以通过编辑 HTML 代码自定义 {{ activeCode }}
          页面，代码中不能包含 JS。
        </div>
        
        <div v-loading="$root.loading" class="space-y-8">
          <ants-form-item prop="html">
            <ants-input
              v-model="form.html"
              size="small"
              type="textarea"
              :autosize="{ minRows: 16, maxRows: 25 }"
              :placeholder="`<h1>${activeCode} code</h1>`"
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
            <ants-button
              size="small"
              type="info"
              icon="el-icon-view"
              text="预 览"
              :disabled="btnLoading"
              @click="showPreviewDialog"
            />
          </ants-form-item>
        </div>
      </ants-form>
    </ants-tab-card>
    <PreviewDialog ref="PreviewDialogRef" />
  </div>
</template>

<script>
import PreviewDialog from '@/v2/cdn_common/components/PreviewDialog'
import mixins from '../mixins'

// [text], err_page
const tabArr = [
  {
    label: '默认页',
    value: 'default_index_html'
  },
  {
    label: '400',
    value: 'error_400'
  },
  {
    label: '403',
    value: 'error_403'
  },
  {
    label: '404',
    value: 'error_404'
  },
  {
    label: '410',
    value: 'error_410'
  },
  {
    label: '500',
    value: 'error_500'
  },
  {
    label: '502',
    value: 'error_502'
  },
  {
    label: '503',
    value: 'error_503'
  },
  {
    label: '504',
    value: 'error_504'
  },
  {
    label: '套餐过期页',
    value: 'site_suit_exp_html'
  }
]

export default {
  components: {
    PreviewDialog
  },
  mixins: [mixins],
  data() {
    return {
      tabArr,
      activeCode: this.$route.query.code || 'default_index_html',

      form: {
        html: ''
      },
      formRules: {
        html: [
          {
            required: true,
            message: '请输入HTML',
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
    /**
     * @description: 获取配置数据
     */

    async getDetailByKey() {
      const { data: res } = await this.getGlobalKeyDetail(this.activeCode)
      if (!res) {
        this.form.html = ''
        return
      }
      this.form.html = res.pvalue || ''
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        const data = await this.saveGlobalAttr({
          [this.activeCode]: this.form.html
        })
        console.log(data)
      })
    },

    /**
     * @description: 切换页面
     * @param {*} val
     */

    changeCode(val) {
      this.activeCode = val
      this.$router.replace({ query: { code: val } })
      this.getDetailByKey()
    },

    /**
     * @description: 点击预览
     */

    showPreviewDialog() {
      this.$refs.PreviewDialogRef.showDialog(this.form.html)
    }
  }
}
</script>
