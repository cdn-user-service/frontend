<template>
  <ants-dialog
    title="添加联系人"
    width="930px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="90px"
      label-position="right"
      inline
      class="-mt-lg"
    >
      <ants-form-item label="组织名称" prop="organation" class="mt-10">
        <ants-input
          v-model="form.organation"
          placeholder="请输入公司名或组织名"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="头衔" prop="job">
        <ants-input
          v-model="form.job"
          placeholder="请输入公司所在职位"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="名字" prop="firstName">
        <ants-input
          v-model="form.firstName"
          placeholder="请输入您的名字"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="姓氏" prop="lastName">
        <ants-input
          v-model="form.lastName"
          placeholder="请输入您的姓氏"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="邮箱" prop="email">
        <ants-input
          v-model="form.email"
          placeholder="请输入邮箱"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="手机" prop="mobile">
        <ants-input
          v-model="form.mobile"
          placeholder="请输入手机号"
          maxlength="200"
        />
      </ants-form-item>
      <ants-form-item label="国家/地区" prop="country">
        <div class="w-full">
          <ants-select
            v-model="form.country"
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
        </div>
      </ants-form-item>
      <ants-form-item label="省份" prop="state">
        <ants-input v-model="form.state" placeholder="请输入省份" />
      </ants-form-item>
      <ants-form-item label="城市" prop="city">
        <ants-input v-model="form.city" placeholder="请输入城市" />
      </ants-form-item>
      <ants-form-item label="地址" prop="address">
        <ants-input v-model="form.address" placeholder="请输入地址" />
      </ants-form-item>
      <ants-form-item label="邮编" prop="postCode">
        <ants-input v-model="form.postCode" placeholder="请输入邮编" />
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
import country from './country.json'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSaveSslContact } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const defaultForm = {
  id: 0,
  userId: '',
  // 组织名称
  organation: '',
  // 头衔，公司所在职位
  job: '',
  // 名字
  firstName: '',
  // 姓氏
  lastName: '',
  // 邮箱
  email: '',
  // 手机
  mobile: '',
  // 国家/地区
  country: 'CN',
  // 省份
  state: '',
  // 城市
  city: '',
  // 地址
  address: '',
  // 邮编
  postCode: '',

  idType: 'Y',
  idNumber: 'Y'
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
      organation: [
        {
          required: true,
          message: '请输入组织名称',
          trigger: ['change', 'blur']
        }
      ],
      job: [
        {
          required: true,
          message: '请输入公司所在职位',
          trigger: ['change', 'blur']
        }
      ],
      firstName: [
        {
          required: true,
          message: '请输入您的名称',
          trigger: ['change', 'blur']
        }
      ],
      lastName: [
        {
          required: true,
          message: '请输入您的姓氏',
          trigger: ['change', 'blur']
        }
      ],
      email: [
        {
          required: true,
          message: '请输入联系邮箱',
          trigger: ['change', 'blur']
        },
        {
          validator: isEmail(),
          trigger: 'blur'
        }
      ],
      mobile: [
        {
          required: true,
          message: '请输入联系手机号',
          trigger: ['change', 'blur']
        },
        {
          validator: isTel(),
          trigger: 'blur'
        }
      ],
      country: [
        {
          required: true,
          message: '请选择国家/地区',
          trigger: ['change', 'blur']
        }
      ],
      state: [
        {
          required: true,
          message: '请输入省份',
          trigger: ['change', 'blur']
        }
      ],
      city: [
        {
          required: true,
          message: '请输入城市',
          trigger: ['change', 'blur']
        }
      ],
      address: [
        {
          required: true,
          message: '请输入地址',
          trigger: ['change', 'blur']
        }
      ],
      postCode: [
        {
          required: true,
          message: '请输入邮编',
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
          const { data: res } = await doSaveSslContact(this.form)
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
