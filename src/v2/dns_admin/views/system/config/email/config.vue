<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('邮件发送服务器配置') }}</strong>

      <div class="text-sm text-ants-text-4 mt-xs">
        注意：在邮件发送配置之前，请前往
        <a
          href="https://cloud.tencent.com/product/exmail"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm"
          >腾讯云邮件 <span class="el-icon-paperclip"></span>
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
      <el-form-item prop="host">
        <span slot="label">
          <strong>SMTP服务器</strong>
        </span>
        <!-- <el-input
          v-model="form.host"
          placeholder="请输入SMTP服务器地址"
        ></el-input> -->
        <ants-select v-model="form.host">
          <el-option
            v-for="item in smtpList"
            :key="item.value"
            :value="item.value"
            :label="item.name"
          >
            <div class="flex items-center">
              <span class="mr-df">{{ item.name }}</span>
              <span class="text-sm">{{ item.value }}</span>
            </div>
          </el-option>
        </ants-select>
      </el-form-item>

      <el-form-item prop="username">
        <span slot="label">
          <strong>发件人邮箱</strong>
        </span>
        <el-input
          v-model="form.username"
          placeholder="请输入发件人邮箱地址"
        ></el-input>
      </el-form-item>

      <el-form-item prop="password">
        <span slot="label">
          <strong>授权密码</strong>
        </span>
        <el-input
          show-password
          type="password"
          v-model="form.password"
          placeholder="请输入授权密码"
        ></el-input>
      </el-form-item>

      <!-- <el-form-item prop="port">
        <span slot="label">
          <strong>PORT</strong>
        </span>
        <el-input
          v-model="form.port"
          placeholder="请输入PORT"
        ></el-input>
      </el-form-item> -->

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
const smtpList = [
  {
    name: '腾讯企业邮件',
    value: 'smtp.exmail.qq.com'
  },
  {
    name: '腾讯个人邮件',
    value: 'smtp.qq.com'
  },
  {
    name: '阿里企业邮件',
    value: 'smtp.qiye.aliyun.com'
  },
  {
    name: '阿里个人邮件',
    value: 'smtp.aliyun.com'
  },
  {
    name: '微软邮件',
    value: 'smtp.office365.com'
  },
  {
    name: '谷歌邮件',
    value: 'smtp.gmail.com'
  }
]

export default {
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      smtpList,
      
      btnLoading: false,
      form: {
        protocol: 'smtp',
        host: '',
        username: '',
        password: '',
        port: '',
        templates: []
      },

      formRules: {
        host: [
          {
            required: true,
            message: 'SMTP服务器不能为空',
            trigger: ['change', 'blur']
          }
        ],
        username: [
          {
            required: true,
            message: '发件人邮箱不能为空',
            trigger: ['change', 'blur']
          }
        ],
        password: [
          {
            required: true,
            message: '授权密码不能为空',
            trigger: ['change', 'blur']
          }
        ],
        port: [
          {
            required: true,
            message: 'port不能为空',
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
