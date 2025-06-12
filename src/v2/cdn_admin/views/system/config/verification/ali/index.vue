<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('支付宝实人认证配置') }}</strong>
      <a
        :href="`${$root.antsWebSite}/doc/110`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm ml-lg"
        >查看配置文档 <span class="el-icon-paperclip"></span
      ></a>

      <div class="text-ants-text-4 text-sm mt-sm">
        注意：开启支付宝实人认证之前，需要先开启
        <router-link to="/system/config/payment/alipay">支付配置</router-link>
      </div>
    </div>

    <div class="p-lg bg-ants-bg-5 rounded-2xl mb-sm">
      <ants-switch
        v-model="status"
        :active-value="1"
        :inactive-value="0"
        active-text="ON"
        inactive-text="OFF"
        v-loading="switchLoading"
        @change="changeStatus"
      />
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-6"
      size="medium"
      :disabled="!status"
    >
      <ants-form-item prop="appId">
        <span slot="label">
          <strong>appId</strong>
        </span>
        <ants-input v-model="form.appId" placeholder="请输入appId" />
      </ants-form-item>

      <ants-form-item prop="alipayPublicKey">
        <span slot="label">
          <strong>支付宝公钥（PublicKey）</strong>
        </span>
        <ants-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 10 }"
          v-model="form.alipayPublicKey"
          placeholder="请输入支付宝公钥"
        />
      </ants-form-item>

      <ants-form-item prop="privateKey">
        <span slot="label">
          <strong>应用私钥（PrivateKey）</strong>
        </span>
        <ants-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 10 }"
          v-model="form.privateKey"
          placeholder="请输入应用私钥"
        />
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
const defaultForm = {
  appId: '',
  privateKey: '',
  alipayPublicKey: '',
  cost: 0, // 费用
  // 费用可设置为0，表示免费
  isCost: 1
}
export default {
  data() {
    return {
      paramsId: 0,
      params: {
        id: 35,
        key: 'ALIPAYUSERCERTIFY_CONFIG_KEY',
        remark: '支付宝实人认证'
      },

      btnLoading: false,
      switchLoading: false,

      status: 0, // 开关
      form: {
        ...defaultForm
      },

      formRules: {
        appId: [
          {
            required: true,
            message: 'appId不能为空',
            trigger: ['change', 'blur']
          }
        ],
        privateKey: [
          {
            required: true,
            message: 'PrivateKey不能为空',
            trigger: ['change', 'blur']
          }
        ],
        alipayPublicKey: [
          {
            required: true,
            message: 'PublicKey不能为空',
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
      const { data, status } = await this.$root.getSystemConfigByParamKey(
        this.params.key
      )
      this.paramsId = data.id

      const cost = data.cost || 0

      this.form = {
        ...defaultForm,
        ...data,
        // 默认以分为单位，转化为
        cost: cost / 100,
        isCost: cost == 0 ? 0 : 1
      }
      this.status = status || 0
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
            // 默认以分为单位
            cost: isCost ? cost * 100 + '' : '0'
          })
          const { data: res } = await this.$root.updateSystemConfig({
            id: this.paramsId,
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
            '该操作将会关闭支付宝实人认证功能，用户将不能通过支付宝进行实名认证。是否继续？',
          cancelInfo: '已取消关闭支付宝实人认证功能'
        })

        if (!result) {
          this.status = 1
          return
        }
      }

      this.switchLoading = true
      try {
        const { data: res } = await this.$root.toggleSystemConfigStatus(
          this.paramsId
        )
        if (res.code !== 1) return
        this.$msg.success(`${!val ? '关闭' : '开启'}支付宝实人认证功能成功`)
      } finally {
        this.switchLoading = false
      }
    }
  }
}
</script>
