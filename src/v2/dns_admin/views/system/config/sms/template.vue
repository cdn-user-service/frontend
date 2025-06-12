
<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('短信模板配置') }}</strong>
    </div>

    <ul>
      <li v-for="(item, idx) in form.templateIds" :key="idx">
        <div class="mb-xs">
          <strong>{{ nameObj[item.name] }}</strong>
          <span
            class="text-sm text-ants-text-4 ml-xs"
            v-if="item.name === 'code'"
          >
            可以用于 注册登录、找回密码、绑定手机号等短信安全验证。
          </span>
        </div>

        <div class="p-lg bg-ants-bg-3 rounded-2xl mb-lg">
          <div class="mb-sm">
            <strong class="mr-lg text-ants-text-3">启用短信通知</strong>
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
            <el-form-item prop="id" style="margin:0">
              <span slot="label">
                <strong>短信模板ID</strong>
                <el-tooltip
                  v-if="item.example"
                  class="item"
                  effect="dark"
                  placement="right"
                >
                  <div slot="content">
                    <div class="margin-bottom-sm">
                      请在腾讯后台配置模板如下：
                    </div>
                    <div>{{ item.example }}</div>
                  </div>
                  <span class="el-icon-info span_icon"></span>
                </el-tooltip>
              </span>

              <el-input
                v-model="item.id"
                placeholder="请输入短信模板ID"
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
        sdkappId: '',
        secretid: '',
        secretkey: '',
        signname: '',

        // 模板数据
        templateIds: [
          // 用于注册登录、找回密码、绑定手机号
          {
            id: '',
            name: 'code',
            example: '',
            status: 0
          },

          // DNS 套餐即将过期
          {
            id: '',
            name: 'notice',
            example: '',
            status: 0
          }
        ]
      },

      nameObj: {
        code: '用于安全验证',
        notice: 'DNS套餐即将过期'
      },

      formRules: {
        id: [
          {
            required: true,
            message: '短信模板ID不能为空',
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

<style lang="less" scoped>
.switch-wrap {
  > li {
    &:last-child {
      margin-bottom: 0;
    }
  }

  @media screen and (max-width: 767px) {
    padding: 10px;
    > li {
      margin-bottom: 10px;
    }
  }
}
</style>
