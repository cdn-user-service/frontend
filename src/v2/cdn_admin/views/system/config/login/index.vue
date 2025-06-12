<template>
  <div>
    <ul class="ants-tips_box content-box space-y-5">
      <li>
        <span class="el-icon-info"></span>
      注意：请至少开启一个配置项，开启对应配置项之前，请前往配置相关信息。
      </li>
    </ul>

    <el-card class="animated fadeIn" v-loading="$root.loading">
      <div slot="header">
        <strong>{{ antsT('是否开启注册功能') }}</strong>
        <div class="text-error text-sm mt-sm">
          特别提醒：关闭注册功能后，用户将不能进行账号注册！
        </div>
      </div>

      <div class="p-lg bg-ants-bg-5 rounded-2xl mb-sm ants-switch-loading">
        <strong class="text-ants-text-3 mr-lg">开启注册功能</strong>
        <el-switch
          v-model="form.status"
          active-color="#02B340"
          :active-value="1"
          :inactive-value="0"
          @change="changeStatus"
          v-loading="switchLoading"
          element-loading-spinner="el-icon-loading"
        >
        </el-switch>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      switchLoading: false,
      params: {
        id: null,
        key: '',
        remark: ''
      },

      btnLoading: false,
      form: {
        status: 1, // 开关
        secretId: '',
        secretKey: '',
        RuleId: '',
        cost: '' // 费用
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
  created() {},
  methods: {
    /**
     * @description: 点击保存配置
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        this.btnLoading = false
      })
    },

    /**
     * @description: 开关
     * @param {*} val
     */
    async changeStatus(val) {
     
    }
  }
}
</script>
