<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '用户'"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >
      <ants-form-item label="用户账号" prop="username">
        <ants-input
          :disabled="!!form.userId"
          v-model.trim="form.username"
          placeholder="请输入用户账号"
          maxlength="32"
        ></ants-input>
      </ants-form-item>

      <!-- <ants-form-item label="邮箱地址" :prop="!form.userId ? 'mail' : ''">
        <ants-input
          :disabled="!!form.userId"
          v-model.trim="form.mail"
          placeholder="请输入邮箱地址"
          maxlength="32"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label=" 手 机 号" :prop="!form.userId ? 'mobile' : ''">
        <ants-input
          :disabled="!!form.userId"
          v-model.trim="form.mobile"
          maxlength="50"
          placeholder="请输入手机号"
        ></ants-input>
      </ants-form-item> -->

      <ants-form-item label="用户密码" prop="password1">
        <ants-input
          v-model.trim="form.password1"
          type="password"
          placeholder="请输入用户密码"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="确认密码" prop="password">
        <ants-input
          v-model.trim="form.password"
          type="password"
          placeholder="请输入确认密码"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="备注信息">
        <ants-input
          v-model="form.note"
          placeholder="请输入备注信息"
          maxlength="100"
        ></ants-input>
      </ants-form-item>
      <!-- <ants-form-item label="启用状态">
        <el-switch
          v-model="form.status"
          :active-value="1"
          :inactive-value="0"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="启用"
          inactive-text="冻结"
        />
      </ants-form-item> -->
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateUser, doUpdateUser } from '@/v2/cdn_admin/api/account/users'

// 验证规则
import { isDomain } from '@/utils/validate'

const defaultForm = {
  // 添加对话框的表单数据
  userId: null,
  username: '',
  mail: '',
  mobile: '',
  password1: '',
  password: '',
  // 备注信息
  note: '',
  // 状态，默认为启用
  status: 1
}
export default {
  data() {
    // 验证两次密码是否一致
    const checkPassWord = (rule, value, callback) => {
      if (value === this.form.password1) return callback()
      callback(new Error('两次输入的密码不一致'))
    }

    // 验证规则
    const { isName, isEmail, isTel, isPassword } = this.$validator

    return {
      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        // 添加用户对话框的规则
        username: [
          {
            required: true,
            message: '请输入用户账号',
            trigger: ['change', 'blur']
          },
          {
            validator: isName(),
            trigger: 'blur'
          }
        ],
        mail: [
          {
            required: true,
            message: '请输入邮箱地址',
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
            message: '请输入手机号',
            trigger: ['change', 'blur']
          },
          {
            validator: isTel(),
            trigger: 'blur'
          }
        ],
        password1: [
          {
            required: true,
            message: '请输入用户密码',
            trigger: ['change', 'blur']
          },
          {
            validator: isPassword(),
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入确认密码',
            trigger: ['change', 'blur']
          },
          {
            validator: checkPassWord,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 修改展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = '添加'
      if (row.userId) {
        this.title = '修改'
        this.form = {
          ...defaultForm,
          ...row,
          password: ''
        }
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        
        const { userId, username, mobile, mail, password, note } = this.form
        const createObj = {
          userId,
          username,
          password,
          note,
          mobile: mobile || '',
          mail: mail || ''
        }

        // 现在的逻辑传了哪些参数就修改哪些，手机号、邮箱、用户账号都可以修改，暂时只让修改密码
        const updateObj = {
          userId,
          password,
          note
        }

        const { data: res } = await (this.form.userId ? doUpdateUser(updateObj) : doCreateUser(createObj))

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '成功')
      })
    },

    // 添加用户表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
