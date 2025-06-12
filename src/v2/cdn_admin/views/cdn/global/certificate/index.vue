<template>
  <el-card class="content-box animated fadeIn" v-loading="$root.loading">
    <ants-form :model="form" :rules="formRules" ref="formRef">
      <div class="ants-tips_box">
        <span class="el-icon-info"></span>
        自定义申请证书的来源地址。
      </div>
      <div class="p-lg rounded-2xl bg-ants-bg-5">
        <ants-switch
          v-model="form.status"
          active-text="ON"
          inactive-text="OFF"
          v-loading="btnLoading"
          @change="changeStatus"
        />
      </div>

      <ants-form-item prop="url" label="证书来源IP地址">
        <ants-input v-model="form.url" placeholder="8.8.8.8" />
      </ants-form-item>
      <ants-form-item>
        <ants-button
          size="small"
          type="primary"
          icon="el-icon-edit"
          :loading="btnLoading"
          @click="submitForm"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
import mixins from '../mixins'

export default {
  mixins: [mixins],
  data() {
    // 验证规则
    const { isIp } = this.$validator

    return {
      // 标识， [text]
      keyStr: 'ssl_server',
      switchLoading: false,
      form: {
        status: 0,
        url: ''
      },
      formRules: {
        url: [
          {
            required: true,
            message: '请输入证书来源IP地址',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp(),
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getDetailByKey()
  },
  methods: {
    /**
     * @description: 获取配置数据
     *    ssl_server [text]
     */

    async getDetailByKey() {
      const { data: res } = await this.getGlobalKeyDetail(this.keyStr)
      if (!res) {
        this.form.url = ''
        this.form.status = 0
        return
      }
      this.form.url = res.pvalue || ''
      this.form.status = res.status || 0
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        const data = await this.saveGlobalAttr({
          [this.keyStr]: this.form.url
        })
      })
    },

    /**
     * @description: 状态改变
     * @param {*} row
     */

    async changeStatus(val) {
      const data = await this.changeGlobalAttrStatus(val, this.keyStr)

      if (!data) {
        this.form.status = this.form.status ? 0 : 1
      }
    }
  }
}
</script>
