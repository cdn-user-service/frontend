
<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('腾讯短信配置') }}</strong>
      <div class="text-sm text-ants-text-4 mt-xs">
        注意：在短信发送配置之前，请前往
        <a
          href="https://cloud.tencent.com/act/pro/csms"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm"
          >腾讯云短信 <span class="el-icon-paperclip"></span>
        </a>
        申请基础配置数据。
      </div>
    </div>

    <el-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      status-icon
      label-position="top"
    >
      <el-form-item prop="sdkappId">
        <span slot="label">
          <strong>sdkAppId</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="是短信应用的唯一标识，请在腾讯后台查看"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <el-input
          v-model="form.sdkappId"
          placeholder="请输入sdkAppId"
        ></el-input>
      </el-form-item>

      <el-form-item prop="secretid">
        <span slot="label">
          <strong>secretid</strong>
        </span>
        <el-input
          v-model="form.secretid"
          placeholder="请输入secretid"
        ></el-input>
      </el-form-item>

      <el-form-item prop="secretkey">
        <span slot="label">
          <strong>secretkey</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="secretkey是用来校验短信发送请求合法性的密码，请务必高度保密。"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <el-input
          show-password
          v-model="form.secretkey"
          placeholder="请输入secretkey"
          type="password"
        ></el-input>
      </el-form-item>

      <el-form-item prop="signname">
        <span slot="label">
          <strong>短信签名</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="请在腾讯后台查看短信签名sign"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <el-input
          v-model="form.signname"
          placeholder="请输入短信签名"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          size="small"
          :loading="btnLoading"
          type="primary"
          @click="submitForm"
          icon="el-icon-check"
          >保存配置</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
export default {
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      btnLoading: false,
      form: {
        sdkappId: '',
        secretid: '',
        secretkey: '',
        signname: ''
      },

      formRules: {
        sdkappId: [
          {
            required: true,
            message: 'sdkAppId不能为空',
            trigger: ['change', 'blur']
          }
        ],
        secretid: [
          {
            required: true,
            message: 'secretId不能为空',
            trigger: ['change', 'blur']
          }
        ],
        secretkey: [
          {
            required: true,
            message: 'secretKey不能为空',
            trigger: ['change', 'blur']
          }
        ],
        signname: [
          {
            required: true,
            message: '短信签名不能为空',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getConfig()
  },
  methods: {
    /**
     * @description: 获取配置信息
     */

    async getConfig() {
      // const { data, status } = await this.$root.getSystemConfigById(
      //   this.params.id
      // )

      const { data, status } = await this.$root.getSystemConfigByKey(
        this.params.key
      )
      console.log(data)
      this.form = data || {}
    },

    /**
     * @description: 点击保存配置
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        const paramValueJSON = JSON.stringify(this.form)

        const { data: res } = await this.$root.updateSystemConfig({
          id: this.params.id,
          paramKey: this.params.key,
          remark: this.params.remark,
          paramValue: paramValueJSON
        })
        this.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success('保存配置成功')
      })
    }
  }
}
</script>
