<template>

  <ants-form
    :model="form"
    :rules="rules"
    ref="formRef"
    label-width="120px"
    class="pt-df"
    style="max-width:600px;"
  >
    <ants-form-item
      label="证书绑定域名"
      prop="domain"
    >
      <div class="flex items-center">
        <ants-input
          v-model="form.domain"
          placeholder="请输入域名"
          class="mr-df"
        />
        <ants-button
          size="mini"
          type="primary"
          icon="el-icon-plus"
          text="新增"
        />
      </div>
    </ants-form-item>
    <ants-form-item
      label="域名验证方式"
      prop="domainType"
    >
      <ants-select
        v-model="form.domainType"
        placeholder="请选择验证方式"
      >
        <ants-option
          v-for="item in ['DNS验证', '文件验证', '文件验证（HTTPS）']"
          :key="item"
          :value="item"
          :label="item"
        />
      </ants-select>
    </ants-form-item>
    <ants-form-item
      label="联系信息"
      prop="contact"
    >
      <ants-select
        v-model="form.contact"
        placeholder="请选择联系信息"
      >
        <ants-option
          v-for="item in ['系统默认信息']"
          :key="item"
          :value="item"
          :label="item"
        />
      </ants-select>
    </ants-form-item>
    <ants-form-item
      label="CSR生成方式"
      prop="csrType"
    >
      <ants-radio-group v-model="form.csrType">
        <ants-radio
          v-for="item in ['系统生成', '手动填写']"
          :key="item"
          :label="item"
          :text="item"
        />
      </ants-radio-group>
      <div class="ants-tips_box mt-sm">
        <div>
          <i class="el-icon-info text-primary"></i>
          <strong> 为了保障您的证书顺利申请，建议您使用默认生成CSR的方式：</strong>
        </div>
        <div class="my-2">
          1、建议您使用系统创建的CSR，避免因内容不正确而导致的审核失败。
        </div>
        <div>
          2、使用已创建的CSR申请证书，请不要在证书签发完成前删除CSR。
        </div>
      </div>
    </ants-form-item>

    <ants-form-item
      label="密码（选填）"
      prop="password"
    >
      <ants-input
        v-model="form.password"
        placeholder="可用于下载证书文件和加密私钥"
      />
    </ants-form-item>

    <ants-form-item>
      <ants-button
        size="small"
        type="primary"
        text="提 交"
        icon="el-icon-check"
        @click="submit"
        :loading="btnLoading"
      />
      <ants-button
        size="small"
        type="danger"
        text="暂 停"
        icon="el-icon-video-pause"
      />
      <ants-button
        size="small"
        type="info"
        text="取 消"
        icon="el-icon-close"
      />
    </ants-form-item>
  </ants-form>
</template>

<script>
const defaultForm = {
  domain: '',
  domainType: '',
  contact: '',
  csrType: '系统生成',
  password: ''
}
const rules = {}

export default {
  data() {
    return {
      form: {
        ...defaultForm
      },
      rules,
      btnLoading: false
    }
  },
  methods: {
    submit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.btnLoading = true
          setTimeout(() => {
            this.btnLoading = false
            this.$emit('changeStep', 1)
          }, 500)
        }
      })
    }
  }
}
</script>
