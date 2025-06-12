<template>
  <ants-form
    :model="form"
    :rules="formRules"
    ref="formRef"
    label-width="200px"
    class="animated fadeIn"
  >
    <div class="rounded-xl p-sm px-df bg-ants-bg-3">
      <TitleBorder title="配置限制" />
    </div>
    <ants-form-item label="相关配置限制不低于" prop="peizhi_1" required>
      <ants-input-number
        v-model="form.peizhi_1"
        :min="1"
        :precision="0"
        placeholder="50"
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

    <div class="rounded-xl p-sm px-df bg-ants-bg-3">
      <TitleBorder title="黑白名单" />
    </div>
    <ants-form-item label="黑名单IP数量限制" prop="heibai_1" required>
      <ants-input-number
        v-model="form.heibai_1"
        :min="1"
        :precision="0"
        placeholder="50"
      />
    </ants-form-item>
    <ants-form-item label="白名单IP数量限制" prop="heibai_2" required>
      <ants-input-number
        v-model="form.heibai_2"
        :min="1"
        :precision="0"
        placeholder="50"
      />
    </ants-form-item>

    <div class="rounded-xl p-sm px-df bg-ants-bg-3">
      <TitleBorder title="规则数限制" />
    </div>
    <ants-form-item label="单个cc规则组" prop="guize_1" required>
      <ants-input-number
        v-model="form.guize_1"
        :min="1"
        :precision="0"
        placeholder="5"
      />
    </ants-form-item>
    <ants-form-item label="单个ACL规则数限制" prop="guize_2" required>
      <ants-input-number
        v-model="form.guize_2"
        :min="1"
        :precision="0"
        placeholder="5"
      />
    </ants-form-item>

    <div class="rounded-xl p-sm px-df bg-ants-bg-3">
      <TitleBorder title="其他" />
    </div>
    <ants-form-item label="单个站点最大域名数限制" prop="other_1" required>
      <ants-input-number
        v-model="form.other_1"
        :min="1"
        :precision="0"
        placeholder="100"
      />
    </ants-form-item>
    <ants-form-item label="默认监听80端口" prop="other_2" required>
      <ants-checkbox v-model="form.other_2" :true-label="1" 
      :false-label="0" 
      text="开启"/>
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
  peizhi_1: 50,
  peizhi_2: 2,
  heibai_1: 50,
  heibai_2: 50,
  guize_1: 5,
  guize_2: 5,

  other_1: 100,
  other_2: 1
}

export default {
  data() {
    return {
      btnLoading: false,

      form: {
        ...defaultForm
      },

      formRules: {}
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
