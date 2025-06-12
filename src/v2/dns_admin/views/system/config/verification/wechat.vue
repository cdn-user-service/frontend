<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('腾讯人脸核身配置') }}</strong>
      <a
        :href="`${$root.antsWebSite}/doc/109`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm ml-lg"
        >查看配置文档 <span class="el-icon-paperclip"></span
      ></a>

      <div class="text-ants-text-4 text-sm mt-xs">
        注意：开启腾讯人脸核身之前，需要先开启
        <router-link to="/system/config/payment/wechat">支付配置</router-link>
      </div>
    </div>

    <div class="p-lg bg-ants-bg-3 rounded-2xl mb-xs switch-loading">
      <strong class="mr-lg text-ants-text-3">开启腾讯人脸核身</strong>
      <el-switch
        v-model="status"
        active-color="#02B340"
        :active-value="1"
        :inactive-value="0"
        @change="changeStatus"
        v-loading="switchLoading"
        element-loading-spinner="el-icon-loading"
      >
      </el-switch>
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      status-icon
      label-position="top"
      space-class="space-y-6"
      size="medium"
      :disabled="!status"
    >
      <ants-form-item prop="secretId">
        <span slot="label">
          <strong>SecretId</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="用于标识 API 调用者身份，可以简单类比为用户名"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input v-model="form.secretId" placeholder="请输入SecretId" />
      </ants-form-item>

      <ants-form-item prop="secretKey">
        <span slot="label">
          <strong>SecretKey</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="用于验证 API 调用者的身份，可以简单类比为密码"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input v-model="form.secretKey" placeholder="请输入SecretKey" />
      </ants-form-item>

      <ants-form-item prop="RuleId">
        <span slot="label">
          <strong>RuleId</strong>
          <el-tooltip
            class="item"
            effect="dark"
            content="RuleId 为自动接入人脸核身的业务RuleId"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input v-model="form.RuleId" placeholder="请输入RuleId" />
      </ants-form-item>

      <ants-form-item prop="cost">
        <span slot="label">
          <strong>认证费用</strong>
        </span>

        <ants-radio-group v-model="form.isCost" size="mini">
          <ants-radio :label="0" text="免费" />
          <ants-radio :label="1" text="收费" />
        </ants-radio-group>

        <template v-if="form.isCost">
          <ants-input-number
            class="ml-lg"
            size="small"
            v-model="form.cost"
            :precision="2"
            :step="1"
            :min="0"
            placeholder="认证费用"
          >
          </ants-input-number>
          <span class="ml-sm">{{ $root.priceUnit }}</span>
        </template>
      </ants-form-item>

      <ants-form-item>
        <ants-button
          :loading="btnLoading"
          type="primary"
          @click="submitForm"
          icon="el-icon-check"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
const defaultForm = {
  secretId: '',
  secretKey: '',
  RuleId: '',
  cost: 0, // 费用
  // 费用可设置为0，表示免费
  isCost: 1
}

export default {
  data() {
    return {
      params: {
        id: 12,
        key: 'TENCENTUSERCERTIFY_CONFIG_KEY',
        remark: '腾讯人脸核身配置'
      },

      btnLoading: false,
      switchLoading: false,
      status: 0, // 开关

      form: {
        ...defaultForm
      },

      formRules: {
        secretId: [
          {
            required: true,
            message: 'secretId不能为空',
            trigger: ['change', 'blur']
          }
        ],
        secretKey: [
          {
            required: true,
            message: 'secretKey不能为空',
            trigger: ['change', 'blur']
          }
        ],
        RuleId: [
          {
            required: true,
            message: 'RuleId不能为空',
            trigger: ['change', 'blur']
          }
        ],
        cost: [
          {
            required: true,
            message: '认证费用不能为空',
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
    // 获取配置信息
    async getConfig() {
      const { data, status } = await this.$root.getSystemConfigByKey(
        this.params.key
      )
      const cost = data.cost || 0
      this.form = {
        ...defaultForm,
        ...data,
        // 默认以分为单位，转化为
        cost: cost / 100,
        isCost: cost == 0 ? 0 : 1
      }
      this.status = status
    },

    // 点击保存配置
    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        try {
          const { isCost, cost } = this.form
          const paramValueJSON = JSON.stringify({
            ...this.form,
            // 金额转换成分
            cost: isCost ? cost * 100 + '' : '0'
          })

          const { data: res } = await this.$root.updateSystemConfig({
            id: this.params.id,
            paramKey: this.params.key,
            remark: this.params.remark,
            paramValue: paramValueJSON
          })

          if (res.code !== 1) return
          this.$msg.success('保存配置成功')
        } finally {
          this.btnLoading = false
        }
      })
    },

    /**
     * @description: 开关
     * @param {*} val
     */
    async changeStatus(val) {
      // 关闭
      if (!val) {
        const result = await this.$doDelete({
          title: '友情提示',
          content:
            '该操作将会关闭腾讯人脸核身功能，用户将不能通过微信进行实名认证。是否继续？',
          cancelInfo: '已取消关闭腾讯人脸核身功能'
        })

        if (!result) {
          this.status = 1
          return
        }
      }

      this.switchLoading = true
      try {
        const { data: res } = await this.$root.toggleSystemConfigStatus(
          this.params.id
        )
        if (res.code !== 1) return
        this.$msg.success(`${!val ? '关闭' : '开启'}腾讯人脸核身功能成功`)
      } finally {
        this.switchLoading = false
      }
    }
  }
}
</script>
