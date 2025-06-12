<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`${form.id ? '修改' : '添加'}缓存预取`"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
      :status-icon="false"
    >
      <ul class="ants-tips_box mb-lg space-y-4" v-if="!form.id">
        <li v-for="(item, idx) in tips" :key="idx">
          {{ antsT(item) }}
        </li>
      </ul>
      <ants-form-item label="站点" prop="siteServerName" v-if="form.id">
        <ants-input
          v-model="form.siteServerName"
          placeholder="请输入站点"
          :disabled="form.id"
        />
      </ants-form-item>

      <ants-form-item label="路径" prop="pfPath" v-if="form.id">
        <ants-input v-model="form.pfPath" placeholder="请输入Path" />
      </ants-form-item>

      <ants-form-item prop="pfPaths" v-if="!form.id">
        <span slot="label">
          <span>预取URL</span>
          <!-- <span
            ><el-tooltip
              class="item"
              effect="dark"
              content="绑定支付的APPID（必须配置，开户邮件中可查看）。"
              placement="right"
            >
              <span slot="content">
                <ul v-if="!form.id">
                  <li
                    v-for="(item, idx) in tips"
                    :key="idx"
                    style="line-height: 26px"
                  >
                    {{ antsT(item) }}
                  </li>
                </ul>
              </span>
              <span class="el-icon-info ants-icon_info"></span> </el-tooltip
          ></span> -->
        </span>
        <ants-input
          v-model="form.pfPaths"
          :placeholder="`请输入预取URL，以http(s)://开头，一行一个;
http://www.demo.com/index.js
https://www.demo.com/test.html`"
          type="textarea"
          :autosize="{ minRows: 5, maxRows: 20 }"
        />
      </ants-form-item>

      <ants-form-item label="预取频率" prop="frequency">
        <ants-input-number
          v-model="form.frequency"
          placeholder="请输入预取频率"
        />
        <span class="ml-5">秒</span>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doCacheSave } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 站点
  siteServerName: '',
  // path
  pfPath: '',
  // 预取频率
  frequency: 3600
}

export default {
  components: {},
  data() {
    // 验证规则
    const { isDomain, isDomains, isUrl } = this.$validator

    return {
      tips: [
        '1、请输入需要预取的URL，如：http(s)://www.demo.com/index.js，一行一个；',
        '2、非本账号下的域名将被忽略；'
      ],
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        siteServerName: [
          {
            required: true,
            message: '请输入站点',
            trigger: ['change', 'blur']
          }
          // {
          //   validator: isDomain(),
          //   trigger: 'blur'
          // }
        ],
        pfPath: {
          required: true,
          message: '请输入Path',
          trigger: ['change', 'blur']
        },
        pfPaths: {
          required: true,
          message: '请输入预取URL',
          trigger: ['change', 'blur']
        },

        frequency: [
          {
            required: true,
            message: '请输入预取频率',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    show(row = {}) {
      if (row.id) {
        this.form = {
          ...row
        }
      } else {
        this.form = {
          ...defaultForm
        }
      }
      this.dialogVisible = true
    },

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doCacheSave({
            ...this.form,
            pfPaths: this.form.pfPaths
              ? this.form.pfPaths.replace(/\n/g, ',')
              : ''
          })
          if (res.code !== 1) return
          this.dialogVisible = false
          this.$msg.success('保存成功')
          this.$emit('refresh')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
