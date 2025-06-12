<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('邮件模板配置') }}</strong>
    </div>

    <ul class="space-y-12">
      <li v-for="(item, idx) in form.templates" :key="idx">
        <div class="mb-df">
          <strong>{{ nameObj[item.name] && nameObj[item.name].title }}</strong>
          <span class="text-sm text-ants-text-4 ml-sm">
            {{ nameObj[item.name] && nameObj[item.name].info }}
          </span>
        </div>

        <div class="p-lg bg-ants-bg-5 rounded-2xl mb-sm">
          <div class="mb-sm">
            <ants-switch
              v-model="item.status"
              :active-value="1"
              :inactive-value="0"
              active-text="ON"
              inactive-text="OFF"
              v-loading="switchLoading"
            />
          </div>

          <ants-form
            :model="item"
            :rules="formRules"
            :ref="`formRef${idx}`"
            label-position="top"
            size="medium"
          >
            <ants-form-item prop="title" style="margin-bottom:10px;">
              <span slot="label">
                <strong class="text-sm">邮件通知标题</strong>
              </span>

              <ants-input
                v-model="item.title"
                placeholder="请输入邮件通知标题"
              ></ants-input>
            </ants-form-item>

            <ants-form-item prop="content" style="margin:0">
              <span slot="label">
                <strong class="text-sm">邮件通知正文</strong>
                <el-tooltip class="item" effect="dark" placement="right">
                  <div slot="content">
                    <div class="mb-sm">
                      请配置邮件模板如下：
                    </div>
                    <div>{{ nameObj[item.name] && nameObj[item.name].template }}</div>
                  </div>
                  <span class="el-icon-info ants-icon_info"></span>
                </el-tooltip>
              </span>

              <ants-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 10 }"
                v-model="item.content"
                :placeholder="nameObj[item.name] && nameObj[item.name].template"
              ></ants-input>
            </ants-form-item>
          </ants-form>
        </div>
      </li>
    </ul>

    <div class="mt-lg">
      <ants-button
        class="mt-sm"
        type="primary"
        :loading="btnLoading"
        @click="submitForm"
        text="保存配置"
      />
    </div>
  </el-card>
</template>

<script>
const baseTemplates = [
  // 用于注册登录、找回密码、绑定手机号
  {
    name: 'code',
    title: '',
    content: '',
    status: 0
  },
  // CDN套餐已到期
  {
    name: 'meal_out',
    title: '',
    content: '',
    status: 0
  },
  // CDN套餐即将到期
  {
    name: 'meal_expire',
    title: '',
    content: '',
    status: 0
  },
  // 流量超限
  {
    name: 'flow_out',
    title: '',
    content: '',
    status: 0
  },
  // 流量即将超限
  {
    name: 'flow_expire',
    title: '',
    content: '',
    status: 0
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
      switchLoading: false,
      btnLoading: false,
      form: {
        protocol: 'smtp',
        host: '',
        username: '',
        password: '',
        port: '',
        templates: [...baseTemplates]
      },

      nameObj: Object.freeze({
        code: {
          title: '用于安全验证',
          template: '【网站名称】您的动态验证码为 #code#',
          info: '可以用于 注册登录、找回密码、绑定手机号等邮件安全验证。'
        },
        meal_out: {
          title: '套餐已过期',
          template:
            '【网站名称】您的域名 #domain#，套餐 #product# 已到期，系统已暂停您的服务。您可随时续费恢复服务！'
        },
        meal_expire: {
          title: '套餐即将过期',
          template:
            '【网站名称】您的域名 #domain#，套餐 #product# 即将到期，到期后将暂停相关业务，请及时续费！'
        },
        flow_out: {
          title: '流量已超限',
          template:
            '【网站名称】您的域名 #domain#，套餐 #product# 流量已用尽，系统已暂停您的服务。请购买流量包恢复服务！'
        },
        flow_expire: {
          title: '流量即将超限',
          template:
            '【网站名称】您的域名 #domain#，套餐 #product# 流量即将用尽，用尽后将暂停相关业务，请及时购买流量包！'
        }
      }),

      formRules: {
        title: [
          {
            required: true,
            message: '请输入邮件通知标题',
            trigger: ['change', 'blur']
          }
        ],
        content: [
          {
            required: true,
            message: '请输入邮件通知正文',
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
      const { data } = await this.$root.getSystemConfigByParamKey(this.params.key)
      this.paramsId = data.id

      const arr = baseTemplates.map(item => {
        let obj = item
        if (Array.isArray(data.templates)) {
          data.templates.some(item2 => {
            if (item2.name === item.name) {
              obj = {
                ...item,
                ...item2
              }
              return true
            }
          })
        }
        return obj
      })

      this.form = {
        ...this.form,
        ...data,
        templates: arr
      }
      console.log(this.form)
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
        id: this.paramsId,
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
