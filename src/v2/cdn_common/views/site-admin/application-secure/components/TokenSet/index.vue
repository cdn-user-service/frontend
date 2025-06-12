<template>
  <ants-form-card v-loading="$root.loading">
    <template slot="title">{{ antsT('Token 鉴权') }}</template>
    <!-- <template slot="info">
      Token 鉴权
    </template> -->
    <template slot="content">
      <ants-switch
        v-model="status"
        active-text="ON"
        inactive-text="OFF"
        v-loading="$attrs.btnLoading"
        @change="changeStatus"
      />

      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
        class="mt-lg"
        :disabled="status != 1"
      >
        <ants-form-item label="鉴权类型" prop="mode">
          <ants-radio-group v-model="form.mode">
            <ants-radio :label="1" text="URL" />
            <ants-radio :label="2" text="HEADER" />
          </ants-radio-group>
        </ants-form-item>
        <ants-form-item label="鉴权KEY" prop="key">
          <ants-input
            v-model.trim="form.key"
            placeholder="请输入鉴权KEY，不能有空格"
          />
        </ants-form-item>
        <ants-form-item label="鉴权密钥" prop="secret">
          <ants-input
            v-model.trim="form.secret"
            placeholder="请输入鉴权密钥，不能有空格"
            maxlength="6"
          />
          <div class="text-sm text-ants-text-4 -mb-sm">
            {{ antsT('输入6位大小写字母、数字构成的密钥') }}
            <span class="cursor-pointer text-primary" @click="createSecret">{{
              antsT('随机生成')
            }}</span>
          </div>
        </ants-form-item>
        <ants-form-item label="超时时间" prop="time">
          <ants-input-number
            size="small"
            v-model="form.time"
            :step="1"
            :min="1"
            :max="10000"
            :precision="0"
            placeholder="超时时间"
          />
          {{ antsT('秒') }}
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
    </template>
  </ants-form-card>
</template>

<script>
export default {
  data() {
    // 鉴权密钥验证
    const checkSecret = (rule, value, callback) => {
      const reg = /^[a-zA-Z0-9]{6}$/
      if (reg.test(value)) return callback()
      return callback(new Error('输入6位大小写字母、数字构成的密钥'))
    }

    return {
      // [text] token 鉴权：[模式1=url;2=head][超时时间(秒)][鉴权key][鉴权密钥[6个字符]]
      keyStr: 'ants_waf_token_set',
      // 开关，[bool]
      status: 0,

      form: {
        // 模式 1 = url, 2 = head
        mode: 1,
        // 超时时间 秒
        time: 3600,
        // 鉴权 key
        key: '',
        // 鉴权密钥【6个字符】
        secret: ''
      },
      formRules: {
        mode: [
          {
            required: true,
            message: '请选择鉴权类型',
            trigger: 'change'
          }
        ],
        time: [
          {
            required: true,
            message: '请输入超时时间',
            trigger: ['change', 'blur']
          }
        ],
        key: [
          {
            required: true,
            message: '请输入鉴权KEY，不能有空格',
            trigger: ['change', 'blur']
          }
        ],
        secret: [
          {
            required: true,
            message: '请输入鉴权密钥，不能有空格',
            trigger: ['change', 'blur']
          },
          {
            validator: checkSecret,
            trigger: 'change'
          }
        ]
      },
      btnLoading: false
    }
  },
  created() {
    this.getTokenSetData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     * @return {*}
     */

    async getTokenSetData() {
      const { data: res } = await this.$listeners.getSiteDetail('', this.keyStr)
      if (!res.attr.length) return
      res.attr.some(item => {
        if (item.pkey === this.keyStr) {
          this.status = item.status ? 1 : 0

          const pvalueArr = item.pvalue && item.pvalue.split(' ')
          this.form.mode = +pvalueArr[0]
          this.form.time = pvalueArr[1]
          this.form.key = pvalueArr[2]
          this.form.secret = pvalueArr[3]
          return true
        }
      })
    },

    /**
     * @description: 随机生成密钥
     */
    createSecret() {
      // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
      const len = 6
      const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      const maxPos = $chars.length
      let pwd = ''
      for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
      }
      this.form.secret = pwd
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        console.log(this.form)
        this.btnLoading = true
        const { mode, time, key, secret } = this.form
        const res = this.$listeners.saveSiteAttr({
          [this.keyStr]: `${mode} ${time} ${key} ${secret}`
        })
        this.btnLoading = false
      })
    },

    /**
     * @description: 开关
     */

    async changeStatus(val) {
      const res = await this.$listeners.changeSiteAttrStatus({
        pkey: this.keyStr,
        status: val
      })
      // 复位
      if (!res) {
        val = val ? 0 : 1
      }
    }
  }
}
</script>
