<template>
  <div class="content-box animated fadeIn" style="margin-top: 0">
    <ants-tab-card :tab-arr="tabArr" @change="changeCode" :active="activeCode">
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        space-class="space-y-8"
      >
        <div class="ants-tips_box">
          <span class="el-icon-info"></span>
          建议使用系统默认的自定义代码。如果需要更改请保持JS代码和系统默认的一致，只更改样式即可。
        </div>

        <div v-loading="$root.loading" class="space-y-8">
          <ants-form-item prop="html">
            <ants-input
              v-model="form.html"
              size="small"
              type="textarea"
              :autosize="{ minRows: 16, maxRows: 25 }"
              placeholder="请输入自定义HTML代码，代码中不能包含 JS"
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
              icon="el-icon-refresh-left"
              text="恢复默认"
              :disabled="btnLoading"
              @click="reset()"
            />
            <ants-button
              size="small"
              type="success"
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
import { $mode, debug } from '@/utils/env'

// [text], err_page
const tabArr = [
  {
    label: '无感验证',
    value: '212'
  },
  {
    label: '数字验证',
    value: '202'
  },
  {
    label: '点击验证',
    value: '210'
  },
  {
    label: '滑动验证',
    value: '206'
  },
  {
    label: '字母验证',
    value: '207'
  },
  {
    label: '5秒验证',
    value: '208'
  },
  {
    label: '验证码验证',
    value: '209'
  }
]

const defaultPage = {}

const defaultPath = $mode['179'] ? 'default2' : 'default1'

if ($mode['179']) {
  tabArr[2] = {
    label: '点击验证一',
    value: '210'
  }
  tabArr.splice(3, 0, {
    label: '点击验证二',
    value: '211'
  })
}

tabArr.forEach((item) => {
  defaultPage[item.value] = require(`./${defaultPath}/${item.value}`).default
})

export default {
  components: {
    PreviewDialog
  },
  mixins: [mixins],
  data() {
    return {
      tabArr,
      activeCode: this.$route.query.code || '212',

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
      const { data: res } = await this.getGlobalKeyDetail(
        `verify_${this.activeCode}`
      )
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
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        const data = await this.saveGlobalAttr({
          [`verify_${this.activeCode}`]: this.form.html
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

    // 恢复默认
    reset() {
      this.form.html = defaultPage[this.activeCode]
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
