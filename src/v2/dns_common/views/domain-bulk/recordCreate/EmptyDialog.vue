<template>
  <ants-dialog
    title="批量清空解析"
    width="600px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submit"
    submit-btn-text="清 空"
  >
    <div class="ants-tips_box mb-lg -mt-sm">
      <span class="el-icon-info"></span>
      批量清空解析功能，是将域名解析记录全部删除，只针本站默认DNS的解析记录。
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      :status-icon="false"
      space-class="space-y-6"
    >
      <!-- <ants-form-item
        prop="userId"
        v-if="isAdmin"
        label="选择用户"
        required
      >
        <UsersPopover
          v-model="form.userId"
          ref="UsersPopoverRef"
          @change="changeUser"
          width="100%"
        />
      </ants-form-item>
      <ants-form-item
        label="导入分组域名"
        prop="group"
      >
        <ants-select
          placeholder="请选择分组域名"
          v-model="form.group"
        >
          <ants-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ants-select>
      </ants-form-item> -->
      <ants-form-item
        label="域名列表"
        prop="domains"
      >
        <div class="relative">
          <ants-input
            type="textarea"
            rows="10"
            placeholder="输入一级域名，每行一个，最多可输入1000个域名。例如：
  domain1.com
  domain2.com"
            v-model="form.domains"
          />
          <span class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs">
            已输入(<span class="text-primary">{{ domainRows }}</span>)行
          </span>
        </div>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// import UsersPopover from '@/v2/dns_admin/components/UsersPopover'
const PROCESS_NAME = process.env.VUE_APP_NAME
const { batchDeleteRecords } = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

const defaultForm = {
  group: '',
  domains: '',
  userId: ''
}

const formRules = {
  group: [
    {
      required: true,
      message: '请选择分组域名',
      trigger: 'change'
    }
  ],
  domains: [
    {
      required: true,
      message: '请输入域名列表，一行一个',
      trigger: ['blur', 'change']
    }
  ],
  userId: [
    {
      required: true,
      message: '请选择用户',
      trigger: 'change'
    }
  ]
}

export default {
  components: {
    // UsersPopover
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      groupList: [],
      form: {
        ...defaultForm
      },
      formRules
    }
  },
  computed: {
    // 已输入多少行域名
    domainRows() {
      if (this.form.domains === '') return 0
      return this.form.domains.trim().split(/[\r\n]+/).length
    }
  },
  methods: {
    // 打开弹窗
    show() {
      this.dialogVisible = true
    },

    // 批量清空解析
    submit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await batchDeleteRecords({
            domain: this.form.domains.trim().split(/[\r\n]+/)
          })
          this.$refs.dialogRef.btnLoading = false
          if (res.code !== 1) return
          this.$msg.success(`已成功清空 ${res.success || 0} 条解析记录`)
          this.dialogVisible = false
        } catch (error) {
          this.$refs.dialogRef.btnLoading = false
          throw error
        }
      })
    },

    // 选择用户
    changeUser(obj = {}) {
      console.log(obj)
      // 清除校验
      // this.$refs.formRef.clearValidate('userId')
    },

    // 添加分组表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
