<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="变更套餐"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="ants-tips_box mb-xl">
      <span class="el-icon-info"></span>
      {{ antsT('注意：变更套餐后，相关配置也会随之改变，谨慎变更！') }}
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
    >
      <ants-form-item label="选择套餐" prop="serialNumber">
        <QueryPlanSelect
          :user-id="userId"
          v-model="form.serialNumber"
          ref="QueryPlanSelectRef"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doTogglePlan } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

// 组件
let QueryPlanSelect = {}
if (PROCESS_NAME.indexOf('cdn') != -1) {
  QueryPlanSelect = require(`@/v2/${PROCESS_NAME}/components/QueryPlanSelect`)
}

export default {
  components: {
    QueryPlanSelect: QueryPlanSelect.default
  },
  data() {
    return {
      // 是否为管理平台
      isAdmin: PROCESS_NAME === 'cdn_admin',

      dialogVisible: false,
      userId: null,
      form: {
        siteId: +this.$route.query.id,
        serialNumber: ''
      },

      formRules: {
        commonName: [
          {
            required: true,
            message: '请选择域名',
            trigger: ['change', 'blur']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ]
      },

      loading: false,
      domainList: []
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(userId = null, serialNumber = '') {
      this.dialogVisible = true
      this.userId = userId

      // 获取套餐列表
      this.$nextTick(() => {
        if (this.isAdmin) {
          this.$refs.QueryPlanSelectRef.getPlanListByUserId(serialNumber)
        } else {
          this.$refs.QueryPlanSelectRef.getPlanList(serialNumber)
        }
      })
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doTogglePlan(this.form)
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return
        this.dialogVisible = false
        this.$emit('refresh')
        this.$msg.success('变更套餐成功')
      })
    },

    // 表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
