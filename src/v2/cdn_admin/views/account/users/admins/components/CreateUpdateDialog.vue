<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '管理员'"
    width="700px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
    >
      <ants-form-item label="管理账号" prop="username">
        <ants-input
          v-model.trim="form.username"
          placeholder="请输入管理账号"
          maxlength="30"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="手机号" prop="mobile">
        <ants-input
          v-model.trim="form.mobile"
          placeholder="请输入手机号"
          maxlength="50"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="邮箱地址" prop="email">
        <ants-input
          v-model.trim="form.email"
          placeholder="请输入邮箱地址"
          maxlength="50"
        ></ants-input>
      </ants-form-item>

      <!-- 添加管理才有 -->
      <div v-if="!form.userId" class="space-y-10">
        <ants-form-item label="管理密码" prop="password1">
          <ants-input
            v-model.trim="form.password1"
            type="password"
            placeholder="请输入管理密码"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="确认密码" prop="password">
          <ants-input
            v-model.trim="form.password"
            type="password"
            placeholder="请输入确认密码"
          ></ants-input>
        </ants-form-item>
      </div>

      <ants-form-item label="选择角色" prop="roleIdList">
        <ants-select
          v-model="form.roleIdList"
          multiple
          placeholder="请选择角色"
        >
          <ants-option
            v-for="item in roleList"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          />
        </ants-select>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doCreateAdmin, doUpdateAdmin } from '@/v2/cdn_admin/api/account/admins'

const defaultForm = {
  // 为 0 表示添加
  userId: 0,
  username: '',
  mobile: '',
  email: '',
  password1: '',
  password: '',
  status: 1,
  roleIdList: []
}

export default {
  props: {
    // 角色列表
    roleList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 添加管理，验证密码
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
        username: [
          {
            required: true,
            message: '请输入管理账号',
            trigger: ['change', 'blur']
          },
          {
            validator: isName(),
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
        email: [
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
        password1: [
          {
            required: true,
            message: '请输入管理密码',
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
        ],
        roleIdList: [
          {
            required: true,
            message: '请选择角色',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = '添加'
      if (row.userId) {
        this.title = '修改'
        this.form = {
          ...this.form,
          ...row,
          roleIdList: row.roleIdList || []
        }
      }
    },

    /**
     * @description: 添加管理提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const {
          userId,
          username,
          mobile,
          email,
          roleIdList,
          status
        } = this.form

        const { data: res } = await (this.form.userId
          ? doUpdateAdmin({
              userId,
              username,
              mobile,
              email,
              roleIdList,
              status
            })
          : doCreateAdmin(this.form))

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.$parent.getTableData()
        this.dialogVisible = false
        this.$msg.success(this.title + '管理成功')
      })
    },

    // 添加表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
