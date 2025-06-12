
<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('短信配置') }}</strong>
      <div class="text-ants-text-4 text-sm mt-sm">
        注意：不同的短信服务商需要的短信模板不同，需要分别配置服务商对应的短信模板。
      </div> 

      <!-- <a
        href="https://www.cdn.com/doc/100"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm ml-lg"
        >查看短信配置文档 <span class="el-icon-paperclip"></span
      ></a>

      <div class="text-ants-text-4 text-sm mt-sm">
        注意：在邮件发送配置之前，请前往
        <a
          href="https://cloud.tencent.com/act/pro/csms"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm"
          >腾讯云短信 <span class="el-icon-paperclip"></span>
        </a>
        申请基础配置数据。
      </div> -->
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-6"
      size="medium"
    >
      <ants-form-item prop="选择短信服务商">
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
      </ants-form-item>

      <ants-form-item prop="sdkappId">
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
        <ants-input
          v-model="form.sdkappId"
          placeholder="请输入sdkAppId"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="secretid">
        <span slot="label">
          <strong>secretid</strong>
        </span>
        <ants-input
          v-model="form.secretid"
          placeholder="请输入secretid"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="secretkey">
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
        <ants-input
          show-password
          v-model="form.secretkey"
          placeholder="请输入secretkey"
          type="password"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="signname">
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
        <ants-input
          v-model="form.signname"
          placeholder="请输入短信签名"
        ></ants-input>
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
import { getConfigList } from '@/v2/cdn_admin/api/system/config'
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
      },

      smsType: {
        SMS_CONFIG_KEY: {
          name: '腾讯云短信配置',
          id: 26,
          form: {
            sdkappId: '',
            secretid: '',
            secretkey: '',
            signname: ''
          }
        },
        ALIYUN_SMS_CONFIG_KEY: {
          name: '阿里云短信配置',
          id: 45,
          form: {
            sdkappId: '',
            secretid: '',
            secretkey: '',
            signname: ''
          }
        },
        SMS_BAO: {
          name: '短信宝短信配置',
          id: 46,
          form: {
            api_addr: '',
            username: '',
            api_key: ''
          }
        }
      }
    }
  },
  created() {
    this.getConfig()
    this.getTableData()
  },
  methods: {
    // 获取所有
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getConfigList({
          page: '1',
          limit: '50'
        })
        if (res.code !== 1) return
        const arr = (res.page || {}).arr || []
        // 获取短信配置的数据
        arr.forEach(item => {
          const { paramKey, paramValue, id } = item
          const paramObj = JSON.parse(paramValue || '{}')
          if (this.smsType[paramKey]) {
            this.smsType[paramKey].id = id
            this.smsType[paramKey].form = {
              ...this.smsType[paramKey].form,
              ...paramObj
            }
          }
        })
      } finally {
        this.$root.loading = false
      }
    },

    // 获取配置信息
    async getConfig() {
      const { data, status } = await this.$root.getSystemConfigByParamKey(
        this.params.key
      )
      this.paramsId = data.id
      this.form = {
        ...this.form,
        ...data
      }
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
          id: this.paramsId,
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
