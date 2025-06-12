<template>
  <div>
    <ants-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="110px"
      space-class="space-y-6"
    >
      <ants-form-item
        label="操作解析"
        prop="records"
      >
        <div class="flex flex-col sm:flex-row">
          <div
            class="relative flex-1"
            style="max-width:400px;"
          >
            <ants-input
              type="textarea"
              rows="10"
              placeholder="请按右侧格式输入"
              v-model="form.records"
            />
            <span class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs">
              已输入(<span class="text-primary">{{ recordRows }}</span>)行
            </span>
          </div>
          <ul class="space-y-6 leading-none pl-df align-top text-sm text-ants-text-4 sm:pt-0 pt-lg">
            <li class="font-bold text-ants-text-3">
              格式：域名|主机记录|记录类型|记录值
            </li>
            <li>例如1：abc.com|@|A|123.123.123.123</li>
            <li>例如2：abc.com|*|CNAME|www.abc.com</li>
            <li>例如3：abc.com|www|A|45.45.45.45</li>
            <li>
              <span
                class="cursor-pointer text-primary text-lg"
                @click="showTools()"
              >
                批量解析格式生成工具
                <i class="el-icon-s-promotion"></i>
              </span>
            </li>
          </ul>
        </div>

      </ants-form-item>
    </ants-form>

    <ToolsDialog ref="ToolsDialogRef" />
  </div>
</template>

<script>
import ToolsDialog from './ToolsDialog.vue'

const defaultForm = {
  // 操作解析列表
  records: ''
}

const formRules = {
  records: [
    {
      required: true,
      message: '请按右侧格式输入操作解析内容',
      trigger: ['blur', 'change']
    }
  ]
}

export default {
  components: {
    ToolsDialog
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
    // 已输入多少行记录
    recordRows() {
      if (this.form.records === '') return 0
      return this.form.records.trim().split(/[\r\n]+/).length
    }
  },
  created() {},
  methods: {
    // 提交表单
    submit() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        this.$emit('submit', {
          form: {
            // 解析记录数组
            records: this.form.records.trim().split(/[\r\n]+/)
          },
          // 执行成功后的回调
          success: this.resetForm
        })
      })
    },

    // 批量解析格式生成工具
    showTools() {
      this.$refs.ToolsDialogRef.show()
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
