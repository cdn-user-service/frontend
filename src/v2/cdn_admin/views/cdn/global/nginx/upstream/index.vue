<template>
  <ants-form
    :model="form"
    :rules="formRules"
    ref="formRef"
    label-width="200px"
    class="animated fadeIn"
  >
    <div class="rounded-xl p-sm px-df bg-ants-bg-3">
      <TitleBorder title="转发配置" />
    </div>

    <ants-form-item
      label="禁用的端口"
      prop="disabled_port"
      required
    >
      <ants-input v-model="form.disabled_port" placeholder="80 443" />
    </ants-form-item>
    <ants-form-item label="相关配置限制不低于" prop="peizhi_1" required>
      <ants-input-number
        v-model="form.peizhi_1"
        :min="1"
        :precision="0"
        placeholder="10"
      />
    </ants-form-item>
    <ants-form-item label="相关配置限制的最大倍数" prop="peizhi_2" required>
      <ants-input-number
        v-model="form.peizhi_2"
        :min="1"
        :precision="0"
        placeholder="2"
      />
    </ants-form-item>
    <ants-form-item label="ACL规则数限制" prop="peizhi_3" required>
      <ants-input-number
        v-model="form.peizhi_3"
        :min="1"
        :precision="0"
        placeholder="10"
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
        icon="el-icon-refresh-right"
        :loading="btnLoading"
        @click="resetDefault"
        text="恢复默认"
      />
    </ants-form-item>
  </ants-form>
</template>

<script>
const defaultForm = {
  disabled_port: '80 443',
  peizhi_1: 10,
  peizhi_2: 2,
  peizhi_3: 10
}

export default {
  data() {
    return {
      btnLoading: false,

      form: {
        ...defaultForm
      },

      formRules: {
        name: [
          {
            required: true,
            message: '请输入规则集名称',
            trigger: ['change', 'blur']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        console.log('first')
      })
    },

    resetDefault() {}
  }
}
</script>
