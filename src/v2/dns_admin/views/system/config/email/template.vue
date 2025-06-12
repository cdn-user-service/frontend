<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('邮件模板配置') }}</strong>
    </div>

    <ul>
      <li v-for="(item, idx) in form.templates" :key="idx">
        <div class="mb-sm">
          <strong>{{ nameObj[item.name].title }}</strong>
          <span
            class="text-sm text-ants-text-4 ml-xs"
            v-if="item.name === 'code'"
          >
            可以用于 注册登录、找回密码、绑定手机号等邮件安全验证。
          </span>
        </div>

        <div class="p-lg bg-ants-bg-3 rounded-2xl mb-lg">
          <div class="mb-xs">
            <strong class="mr-lg text-ants-text-3">启用邮件通知</strong>
            <el-switch
              v-model="item.status"
              active-color="#02B340"
              :active-value="'1'"
              :inactive-value="'0'"
            >
            </el-switch>
          </div>

          <el-form
            :model="item"
            :rules="formRules"
            :ref="`formRef${idx}`"
            label-width="100px"
            status-icon
            label-position="top"
          >
            <el-form-item prop="title" style="margin-bottom:10px;">
              <span slot="label">
                <strong class="text-sm">邮件通知标题</strong>
              </span>

              <el-input
                v-model="item.title"
                placeholder="请输入邮件通知标题"
              ></el-input>
            </el-form-item>

            <el-form-item prop="content" style="margin:0">
              <span slot="label">
                <strong class="text-sm">邮件通知正文</strong>
                <el-tooltip class="item" effect="dark" placement="right">
                  <div slot="content">
                    <div class="mb-sm">
                      请配置邮件模板如下：
                    </div>
                    <div>{{ nameObj[item.name].template }}</div>
                  </div>
                  <span class="el-icon-info ants-icon_info"></span>
                </el-tooltip>
              </span>

              <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 10 }"
                v-model="item.content"
                placeholder="请输入邮件通知正文"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </li>
    </ul>

    <div>
      <el-button
        size="small"
        type="primary"
        :loading="btnLoading"
        @click="submitForm"
        icon="el-icon-check"
        >保存配置</el-button
      >
    </div>
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
        protocol: 'smtp',
        host: '',
        username: '',
        password: '',
        port: '',
        templates: [
          // 用于注册登录、找回密码、绑定手机号
          {
            name: 'code',
            title: '',
            content: ''
          },

          // DNS套餐即将到期
          {
            name: 'notice',
            title: '',
            content: ''
          }
        ]
      },

      nameObj: {
        code: {
          title: '用于安全验证',
          template: '【网站名称】您的动态验证码为 #code#'
        },
        notice: {
          title: 'DNS套餐即将过期',
          template:
            '【网站名称】您的域名 #domain#，套餐 #product# 即将到期，到期后将暂停相关业务，请及时续费！'
        }
      },

      formRules: {
        title: [
          {
            required: true,
            message: '邮件标题不能为空',
            trigger: ['change', 'blur']
          }
        ],
        content: [
          {
            required: true,
            message: '邮件内容不能为空',
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
      // const { data } = await this.$root.getSystemConfigById(this.params.id)
      const { data } = await this.$root.getSystemConfigByKey(this.params.key)

      this.form = {
        ...this.form,
        ...data
      }
    },

    /**
     * @description: 点击保存配置
     */

    async submitForm() {
      let flag = false
      Object.keys(this.$refs).forEach(item => {
        this.$refs[item][0].validate(valid => {
          if (!valid) flag = true
        })
      })

      if (flag) return

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
    }
  }
}
</script>
