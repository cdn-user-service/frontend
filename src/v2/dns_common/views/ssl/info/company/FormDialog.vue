<template>
  <ants-dialog
    title="添加公司"
    width="900px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
      label-position="right"
      inline
      class="-mt-lg"
    >
      <ants-form-item label="公司名称" prop="organizationName" class="mt-10">
        <ants-input
          v-model="form.organizationName"
          placeholder="请输入公司名称"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="公司电话" prop="organizationMobile">
        <ants-input
          v-model="form.organizationMobile"
          placeholder="请输入公司电话"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="证件号码" prop="organizationRegNumber">
        <ants-input
          v-model="form.organizationRegNumber"
          placeholder="请输入公司证件号码"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="所在国家" prop="organizationCountry">
        <ants-select
          v-model="form.organizationCountry"
          placeholder="请选择国家/地区"
          style="width:187px;"
        >
          <el-option
            v-for="item in country"
            :key="item.id"
            :label="item.name"
            :value="item.code"
          />
        </ants-select>
      </ants-form-item>
      <ants-form-item label="所在城市" prop="organizationCity">
        <ants-input
          v-model="form.organizationCity"
          placeholder="请输入公司所在城市"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="公司地址" prop="organizationAddress">
        <ants-input
          v-model="form.organizationAddress"
          placeholder="请输入公司地址"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="邮编" prop="organizationPostCode">
        <ants-input
          v-model="form.organizationPostCode"
          placeholder="请输入所在地邮编"
        />
      </ants-form-item>

      <ants-form-item label="选择用户" prop="userId" v-if="isAdmin">
        <UsersPopover
          v-model="form.userId"
          ref="UsersPopoverRef"
          @change="changeUser"
          size="small"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import UsersPopover from '@/v2/dns_admin/components/UsersPopover'
import country from '../contact/country.json'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSaveOrganization } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const defaultForm = {
  id: 0,
  userId: '',
  // 公司名称
  organizationName: '',
  // 公司电话
  organizationMobile: '',
  // 证件号码
  organizationRegNumber: '',

  // 所在国家
  organizationCountry: '',
  // 所在城市
  organizationCity: '',
  // 公司地址
  organizationAddress: '',
  // 邮编
  organizationPostCode: '',
  idType: 'Y'
}

export default {
  components: {
    UsersPopover
  },
  data() {
    const { isTel, isEmail } = this.$validator

    const rules = {
      userId: [
        {
          required: true,
          message: '请选择用户',
          trigger: 'change'
        }
      ],
      organizationName: [
        {
          required: true,
          message: '请输入公司名称',
          trigger: ['change', 'blur']
        }
      ],
      organizationMobile: [
        {
          required: true,
          message: '请输入公司电话',
          trigger: ['change', 'blur']
        }
      ],
      organizationRegNumber: [
        {
          required: true,
          message: '请输入公司证件号码',
          trigger: ['change', 'blur']
        }
      ],
      organizationCountry: [
        {
          required: true,
          message: '请输入所在国家',
          trigger: ['change', 'blur']
        }
      ],
      organizationCity: [
        {
          required: true,
          message: '请输入公司所在城市',
          trigger: ['change', 'blur']
        }
      ],
      organizationAddress: [
        {
          required: true,
          message: '请输入公司地址',
          trigger: ['change', 'blur']
        }
      ],
      organizationPostCode: [
        {
          required: true,
          message: '请输入所在地邮编',
          trigger: ['change', 'blur']
        }
      ]
    }

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      country,

      btnLoading: false,
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm,
        ...row
      }
    },

    // 表单提交
    submit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doSaveOrganization(this.form)
          if (res.code !== 1) return
          this.$emit('refresh')
          this.dialogVisible = false
          this.$msg.success('操作成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 选择用户
    changeUser(obj = {}) {
      console.log(obj)
      // 清除校验
      this.$refs.formRef.clearValidate('userId')
    },

    // 对话框关闭
    closed() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
