<template>
  <el-card class="content-box animated fadeIn batch_card">
    <div slot="header">
      <TitleBorder title="修改套餐" />
    </div>

    <ants-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="0"
      label-position="top"
      :status-icon="false"
      space-class="space-y-4"
    >
      <ants-form-item label="选择用户" prop="userId" v-if="isAdmin">
        <UsersPopover
          v-model="form.userId"
          ref="UsersPopoverRef"
          @change="changeUser"
          width="450px"
        />
      </ants-form-item>

      <ants-form-item label="选择套餐" prop="consumeId">
        <QueryPlanSelect
          :username="form.username"
          v-model="form.consumeId"
          ref="QueryPlanSelectRef"
          style="max-width:450px;"
        />
      </ants-form-item>

      <ants-form-item label="选择域名" prop="ids">
        <SelectDomain
          v-model="form.ids"
          @change="changeSelectDomain"
          ref="SelectDomainRef"
          :multiple="true"
          layoutSizes
          :username="form.username"
          :disabledUser="isAdmin"
          size="medium"
          style="width:450px;"
        />
      </ants-form-item>

      <ants-form-item class="pt-lg">
        <ants-button
          type="primary"
          size="small"
          :loading="btnLoading"
          @click="submit()"
          icon="el-icon-check"
          text="批量修改"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
// import QueryUserSelect from '@/v2/dns_admin/components/QueryUserSelect'
import UsersPopover from '@/v2/dns_admin/components/UsersPopover'
import QueryPlanSelect from '@/v2/dns_users/components/QueryPlanSelect'
import QueryPlanSelectAdmin from '@/v2/dns_admin/components/QueryPlanSelect'
import SelectDomain from '@/v2/dns_common/components/SelectDomain'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { batckDomainUpdate } = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

const defaultForm = {
  // 用于后台查询域名
  username: '',

  userId: '',
  consumeId: 0,
  ids: ''
}

export default {
  components: {
    SelectDomain,
    UsersPopover,
    QueryPlanSelect:
      PROCESS_NAME === 'dns_admin' ? QueryPlanSelectAdmin : QueryPlanSelect
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      btnLoading: false,
      form: {
        ...defaultForm
      },
      formRules: {
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ],
        ids: [
          {
            required: true,
            message: '请选择域名',
            trigger: 'change'
          }
        ],
        consumeId: [
          {
            required: true,
            message: '请选择套餐',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    // 批量修改提交
    submit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        try {
          const { data: res } = await batckDomainUpdate({
            ...this.form,
            consumeId: this.form.consumeId ? this.form.consumeId : undefined
          })
          if (res.code !== 1) return
          this.$msg.success('修改成功')
        } finally {
          this.btnLoading = false
        }
      })
    },

    // 选择域名
    changeSelectDomain({ domains = [], domainIds }) {
      console.log(domains, domainIds)
      this.form.ids = domainIds + ''
      // 清除校验
      this.$refs.formRef.clearValidate('ids')
    },

    // 选择用户
    changeUser(obj = {}) {
      console.log(obj)
      this.form.username = obj.username
      // 清除校验
      this.$refs.formRef.clearValidate('userId')
    },

    // 表单重置
    resetForm() {
      this.btnLoading = false
      this.form = {
        ...defaultForm
      }
      if (this.$refs.UsersPopoverRef) {
        this.$refs.UsersPopoverRef.reset()
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
