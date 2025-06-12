<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('短信配置') }}</strong>
      <div class="text-ants-text-4 text-sm mt-sm">
        注意：不同的短信服务商需要的短信模板不同，需要分别配置服务商对应的短信模板。
      </div>
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="left"
      label-width="100px"
      space-class="space-y-6"
      size="medium"
    >
      <ants-form-item prop="type" label="短信服务商">
        <ants-radio-group v-model="form.type" @change="changeType">
          <ants-radio
            v-for="(item, key) in smsType"
            :key="key"
            :label="key"
            :text="item.name"
          >
          </ants-radio>
        </ants-radio-group>
      </ants-form-item>

      <!-- 短信宝 -->
      <template v-if="form.type === 'SMS_BAO'">
        <ants-form-item prop="api_addr" label="API ADDR">
          <ants-input v-model="form.api_addr" placeholder="请输入API ADDR" />
        </ants-form-item>

        <ants-form-item prop="username" label="用户名">
          <ants-input v-model="form.username" placeholder="请输入用户名" />
        </ants-form-item>

        <ants-form-item prop="api_key" label="API KEY">
          <ants-input
            show-password
            v-model="form.api_key"
            placeholder="请输入API KEY"
            type="password"
          />
        </ants-form-item>
      </template>

      <template v-else-if="form.type === 'SMS_CONFIG_KEY'">
        <ants-form-item prop="sdkappId" label="sdkAppId">
          <ants-input v-model="form.sdkappId" placeholder="请输入sdkAppId" />
        </ants-form-item>

        <ants-form-item prop="secretid" label="secretid">
          <ants-input v-model="form.secretid" placeholder="请输入secretid" />
        </ants-form-item>

        <ants-form-item prop="secretkey" label="secretkey">
          <ants-input
            show-password
            v-model="form.secretkey"
            placeholder="请输入secretkey"
            type="password"
          />
        </ants-form-item>

        <ants-form-item prop="signname" label="短信签名">
          <ants-input v-model="form.signname" placeholder="请输入短信签名" />
        </ants-form-item>
      </template>

      <template v-else-if="form.type === 'ALIYUN_SMS_CONFIG_KEY'">
        <ants-form-item prop="accessKeyId" label="KeyId">
          <ants-input v-model="form.accessKeyId" placeholder="请输入KeyId" />
        </ants-form-item>

        <ants-form-item prop="accessKeySecret" label="KeySecret">
          <ants-input
            v-model="form.accessKeySecret"
            placeholder="请输入KeySecret"
          />
        </ants-form-item>

        <ants-form-item prop="signname" label="短信签名">
          <ants-input
            show-password
            v-model="form.signname"
            placeholder="请输入短信签名"
          />
        </ants-form-item>
      </template>

      <ants-form-item label="短信模板">
        <ul class="space-y-df">
          <li
            v-for="(item, key) in templateTips"
            :key="key"
            class="px-lg pt-sm pb-lg bg-ants-bg-5 rounded-2xl"
          >
            <TitleBorder :title="item.title" class="pb-xs">
              <span class="text-sm text-ants-text-4 font-normal ml-df">
                {{ item.info }}
              </span>
            </TitleBorder>
            <div class="flex items-center">
              <span
                class="font-semibold text-ants-text-3 inline-block text-sm"
                style="width:80px;"
              >
                模板ID
                <el-tooltip effect="dark" placement="right">
                  <div slot="content">
                    <div class="mb-sm">
                      请在服务商后台配置模板如下：
                    </div>
                    <div>
                      {{ form.templateIds[key].example }}
                    </div>
                  </div>
                  <span
                    class="el-icon-info ants-icon_info"
                    style="font-size:16px;"
                  ></span>
                </el-tooltip>
              </span>
              <ants-input
                v-model="form.templateIds[key].id"
                placeholder="请输入短信模板ID"
              />
            </div>
            <div class="flex items-center mt-df" v-if="form.type === 'SMS_BAO'">
              <span
                class="font-semibold text-ants-text-3 inline-block text-sm"
                style="width:80px;"
              >
                模板内容
              </span>
              <ants-input
                v-model="form.templateIds[key].content"
                placeholder="请输入短信模板内容"
              />
            </div>
          </li>
        </ul>
      </ants-form-item>

      <ants-form-item>
        <ants-button
          class="mt-sm"
          :loading="btnLoading"
          type="primary"
          @click="submitForm"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
// api
import {
  getList,
  toggleConfStatus
} from '@/v2/dns_admin/api/system/config'

const rules = {
  type: [
    {
      required: true,
      message: '请选择短信服务商',
      trigger: ['change', 'blur']
    }
  ],
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
  ],
  api_addr: [
    {
      required: true,
      message: '请输入API ADDR',
      trigger: ['change', 'blur']
    }
  ],
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: ['change', 'blur']
    }
  ],
  api_key: [
    {
      required: true,
      message: '请输入API KEY',
      trigger: ['change', 'blur']
    }
  ],
  accessKeyId: [
    {
      required: true,
      message: '请输入KeyId',
      trigger: ['change', 'blur']
    }
  ],
  accessKeySecret: [
    {
      required: true,
      message: '请输入KeySecret',
      trigger: ['change', 'blur']
    }
  ]
}

const baseTemplates = {
  // 用于注册登录、找回密码、绑定手机号
  code: {
    name: 'code',
    title: '',
    id: '',
    status: 1,
    content: '',
    example: ''
  },
  notice: {
    name: 'notice',
    title: '',
    id: '',
    status: 1,
    content: '',
    example: ''
  }
}

const templateTips = {
  code: {
    title: '用于安全验证',
    template: '您的验证码为：{1}，{2}分钟内有效！',
    info: '可以用于 注册登录、找回密码、绑定手机号等邮件安全验证。'
  },
  notice: {
    title: '套餐即将过期',
    template:
      '您的套餐（ID: {1}，名称:{2}）已过期，系统已暂停您的服务。您可随时续费恢复服务。'
  }
}
export default {
  components: {},
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      paramsId: 0,
      btnLoading: false,
      templateTips,
      form: {
        type: 'SMS_CONFIG_KEY',
        sdkappId: '',
        secretid: '',
        secretkey: '',
        signname: '',
        // 模板数据
        templateIds: { ...baseTemplates }
      },

      formRules: rules,

      smsType: {
        SMS_CONFIG_KEY: {
          name: '腾讯云短信',
          id: 3,
          status: 0,
          form: {
            sdkappId: '',
            secretid: '',
            secretkey: '',
            signname: '',
            templateIds: {}
          }
        },
        ALIYUN_SMS_CONFIG_KEY: {
          name: '阿里云短信',
          id: 27,
          status: 0,
          form: {
            accessKeyId: '',
            accessKeySecret: '',
            signname: '',
            templateIds: {}
          }
        },
        SMS_BAO: {
          name: '短信宝短信',
          id: 28,
          status: 0,
          form: {
            api_addr: '',
            username: '',
            api_key: '',
            templateIds: {}
          }
        }
      }
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取所有
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getList({
          page: 1,
          limit: 50
        })
        if (res.code !== 1) return
        const arr = (res.page || {}).list || []
        // 获取短信配置的数据
        arr.forEach(item => {
          const { paramKey, paramValue, id, status } = item
          const paramObj = JSON.parse(paramValue || '{}')
          if (this.smsType[paramKey]) {
            this.smsType[paramKey].id = id
            this.smsType[paramKey].status = status

            const { templateIds = [] } = paramObj
            const templateObj = {}
            templateIds.forEach(item => {
              templateObj[item.name] = item
            })
            this.smsType[paramKey].form = {
              ...this.smsType[paramKey].form,
              ...paramObj,
              // 模板数据
              templateIds: {
                ...baseTemplates,
                ...templateObj
              }
            }
          }
        })
        
        // 防止 templateIds 为空，报错
        Object.keys(this.smsType).forEach(key => {
          this.smsType[key].form.templateIds = {
            ...baseTemplates,
            ...this.smsType[key].form.templateIds
          }
        })

        // 优先腾旭
        if (this.smsType.SMS_CONFIG_KEY.status) {
          this.form = {
            type: 'SMS_CONFIG_KEY',
            ...this.smsType.SMS_CONFIG_KEY.form
          }
          return
        }

        // 然后阿里
        if (this.smsType.ALIYUN_SMS_CONFIG_KEY.status) {
          this.form = {
            type: 'ALIYUN_SMS_CONFIG_KEY',
            ...this.smsType.ALIYUN_SMS_CONFIG_KEY.form
          }
          return
        }

        // 最后短信宝
        if (this.smsType.SMS_BAO.status) {
          this.form = {
            type: 'SMS_BAO',
            ...this.smsType.SMS_BAO.form
          }
          return
        }
      } finally {
        this.$root.loading = false
      }
    },

    // 切换服务商
    changeType(val) {
      this.form = {
        type: val,
        ...this.smsType[val].form
        // templateIds: {
        //   ...baseTemplates,
        //   ...this.smsType[val].form.templateIds
        // }
      }
      console.log(this.form)
      // this.$refs.formRef.resetFields()
    },

    // 点击保存配置
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const { id, status, name } = this.smsType[this.form.type]
          // templateIds 转换为数组
          const templateIdsArr = []
          Object.keys(this.form.templateIds).forEach(key => {
            templateIdsArr.push(this.form.templateIds[key])
          })
          const { data: res } = await this.$root.updateSystemConfig({
            id,
            paramKey: this.form.type,
            remark: name + '配置',
            status: 1,
            paramValue: JSON.stringify({
              ...this.form,
              templateIds: templateIdsArr
            })
          })
          if (res.code !== 1) return
          this.changeStatus()
          this.$msg.success('保存配置成功')
        } finally {
          this.btnLoading = false
        }
      })
    },

    // 关闭另外两个，只保持一个开启
    changeStatus() {
      Object.keys(this.smsType).forEach(async key => {
        if (key !== this.form.type) {
          await toggleConfStatus({
            id: this.smsType[key].id,
            status: 0
          })

          // this.$root.toggleSystemConfigStatus(this.smsType[key].id)
        }
      })
    }
  }
}
</script>
