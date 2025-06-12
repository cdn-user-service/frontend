<template>
  <div>
    <ul class="space-y-12">
      <li v-for="(item, idx) in form.templateIds" :key="idx">
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
            space-class="space-y-6"
            size="medium"
          >
            <ants-form-item prop="id" style="margin:0">
              <span slot="label">
                <strong>短信模板ID</strong>
                <el-tooltip class="item" effect="dark" placement="right">
                  <div slot="content">
                    <div class="mb-sm">
                      请在腾讯后台配置模板如下：
                    </div>
                    <div>
                      {{ nameObj[item.name] && nameObj[item.name].template }}
                    </div>
                  </div>
                  <span class="el-icon-info ants-icon_info"></span>
                </el-tooltip>
              </span>

              <ants-input
                v-model="item.id"
                placeholder="请输入短信模板ID"
              ></ants-input>
            </ants-form-item>
          </ants-form>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
const baseTemplates = [
  // 用于注册登录、找回密码、绑定手机号
  {
    name: 'code',
    title: '',
    id: '',
    status: 0
  },
  // CDN套餐已到期
  {
    name: 'meal_out',
    title: '',
    id: '',
    status: 0
  },
  // CDN套餐即将到期
  {
    name: 'meal_expire',
    title: '',
    id: '',
    status: 0
  },
  // 流量超限
  {
    name: 'flow_out',
    title: '',
    id: '',
    status: 0
  },
  // 流量即将超限
  {
    name: 'flow_expire',
    title: '',
    id: '',
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
      paramsId: 0,

      switchLoading: false,
      btnLoading: false,
      form: {
        sdkappId: '',
        secretid: '',
        secretkey: '',
        signname: '',

        // 模板数据
        templateIds: [...baseTemplates]
      },

      nameObj: Object.freeze({
        code: {
          title: '用于安全验证',
          template: '您的验证码为：{1}，{2}分钟内有效！',
          info: '可以用于 注册登录、找回密码、绑定手机号等邮件安全验证。'
        },
        meal_out: {
          title: '套餐已过期',
          template:
            '您的套餐（ID: {1}，名称:{2}）已过期，系统已暂停您的服务。您可随时续费恢复服务。'
        },
        meal_expire: {
          title: '套餐即将过期',
          template:
            '您的套餐（ID: {1}，名称:{2}）即期过期，为避免影响您的服务，请及时续费。'
        },
        flow_out: {
          title: '流量已超限',
          template:
            '您的套餐流量（ID: {1}，名称:{2}）已用尽，系统已暂停您的服务。请及时购买升级包服务'
        },
        flow_expire: {
          title: '流量即将超限',
          template:
            '您的套餐流量（ID: {1}，名称:{2}）余量不足，为避免影响您的服务，请及时购买升级包。'
        }
      }),

      formRules: {
        id: [
          {
            required: true,
            message: '请输入短信模板ID',
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
      const { data } = await this.$root.getSystemConfigByParamKey(
        this.params.key
      )
      this.paramsId = data.id

      const arr = baseTemplates.map(item => {
        let obj = item
        if (Array.isArray(data.templateIds)) {
          data.templateIds.some(item2 => {
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
        templateIds: arr
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
