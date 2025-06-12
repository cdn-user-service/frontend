<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('联系方式配置') }}</strong>
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      size="medium"
      space-class="space-y-6"
    >
      <ants-form-item prop="company">
        <div slot="label">
          <span class="el-icon-s-home"></span>

          <strong> {{ antsT('公司名称') }}</strong>
        </div>

        <ants-input v-model="form.company" placeholder="请输入您的公司名称" />
      </ants-form-item>

      <ants-form-item prop="mobile">
        <div slot="label">
          <span class="el-icon-phone"></span>
          <strong> {{ antsT('联系电话') }}</strong>
        </div>
        <ants-input v-model="form.mobile" placeholder="请输入您的联系电话" />
      </ants-form-item>

      <ants-form-item prop="email">
        <div slot="label">
          <span class="el-icon-message"></span>

          <strong> {{ antsT('联系邮箱') }}</strong>
        </div>

        <ants-input v-model="form.email" placeholder="请输入您的联系邮箱" />
      </ants-form-item>

      <ants-form-item prop="qq">
        <div slot="label">
          <span class="aicon icon-icon text-2xl"></span>

          <strong> {{ antsT('联系QQ') }}</strong>
        </div>

        <ants-input v-model="form.qq" placeholder="请输入您的联系QQ" />
      </ants-form-item>

      <ants-form-item prop="telegram">
        <div slot="label">
          <span class="el-icon-s-promotion text-2xl"></span>

          <strong>Telegram</strong>
        </div>

        <ants-input v-model="form.telegram" placeholder="请输入Telegram" maxlength="30"/>
      </ants-form-item>

      <ants-form-item prop="skype">
        <div slot="label">
          <span class="el-icon-s-promotion text-2xl"></span>

          <strong>Skype</strong>
        </div>

        <ants-input v-model="form.skype" placeholder="请输入Skype" maxlength="30"/>
      </ants-form-item>

      <ants-form-item>
        <ants-button
          class="mt-sm"
          type="primary"
          :loading="btnLoading"
          @click="submitForm"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      btnLoading: false,
      form: {
        mobile: '',
        email: '',
        qq: '',
        company: '',
        telegram: '',
        skype: ''
      },
      formRules: {}
    }
  },
  created() {
    this.getData()
  },
  methods: {
    /**
     * @description: 获取数据
     */

    async getData() {
      const { contact } = await this.$listeners.getBasicConfig()
      this.form = contact || {}
    },

    /**
     * @description: 提交数据
     */

    async submitForm() {
      this.btnLoading = true

      const res = await this.$listeners.updateBasicConfig({
        contact: this.form
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.$msg.success(this.antsT('保存配置成功'))
    }
  }
}
</script>
