<template>
  <ants-dialog
    title="添加主域名"
    v-model="dialogVisible"
    @closed="resetForm"
    @submit="doSave"
    ref="dialogRef"
    width="500px"
  >
    <div class="ants-tips_box mb-xl">
      <span class="el-icon-info text-primary"></span>
      {{ antsT('只需输入主域名，例如输入domain.com后，test.domain.com也将生效') }}
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
      label-position="left"
      :status-icon="false"
    >

      <ants-form-item
        prop="userid"
        v-if="isAdmin"
        label="选择用户"
      >
        <UsersPopover
          width="100%"
          v-model="form.userid"
          ref="UsersPopoverRef"
          @change="changeUser"
        />
      </ants-form-item>

      <ants-form-item
        prop="domain"
        label="主域名"
      >
        <ants-input
          v-model="form.domain"
          placeholder="请输入主域名"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 组件
import UsersPopover from '@/v2/dns_admin/components/UsersPopover'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doCreateDomain } = require(`@/v2/${PROCESS_NAME}/api/dns/httpdns`)

const defaultForm = {
  userid: '',
  domain: ''
}
export default {
  components: {
    UsersPopover
  },
  data() {
    // 验证域名的验证规则
    const checkDomain = (rule, value, callback) => {
      // 验证域名的正则表达式
      const domain = value.trim()
      /**
       *  1、域名中的标号都由英文字母和数字组成，每一个标号不超过63个字符，也不区分大小写字母；
       *  2、标号中除连字符（-）外不能使用其他的标点符号；
       *  3、级别最低的域名写在最左边，而级别最高的域名写在最右边；
       *  4、由多个标号组成的完整域名总共不超过255个字符
       *
       *  (?=^.{3,255}$)： 匹配 数字字母后面紧跟 .  的字符串，且长度区间 3 ~ 255
       *   (?<!www)  匹配 ？的位置的左边不符合表达式的条件，匹配非 www 开头的
       */
      const regDomain =
        /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?<!www)(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
      if (!regDomain.test(domain)) {
        callback(new Error('格式错误，请输入主域名，如：domain.com'))
      } else {
        return callback()
      }
    }

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',

      dialogVisible: false,
      loading: false,
      btnLoading: false,
      userList: [],

      form: {
        ...defaultForm
      },
      formRules: {
        userid: [
          {
            required: true,
            message: '请选择用户',
            trigger: ['change', 'blur']
          }
        ],
        domain: [
          {
            required: true,
            message: '请输入主域名，格式如：domain.com',
            trigger: ['blur', 'change']
          },
          {
            validator: checkDomain,
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    // 对话框显示
    show() {
      this.dialogVisible = true
    },

    // 选择用户，清除校验
    changeUser(obj = {}) {
      this.$refs.formRef.clearValidate('userid')
    },

    // 表单提交
    doSave() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doCreateDomain(this.form)
          this.$refs.dialogRef.btnLoading = false
          if (res.code !== 1) return
          this.$emit('refresh')
          this.$msg.success('添加成功')
          this.dialogVisible = false
        } catch (error) {
          this.$refs.dialogRef.btnLoading = false
          throw error
        }
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }

      this.$refs.formRef.resetFields()
      if (this.$refs.UsersPopoverRef) {
        this.$refs.UsersPopoverRef.reset()
      }
    }
  }
}
</script>

<style lang="scss">
.query-user-select {
  width: 100%;
  .el-input {
    width: 100% !important;
  }
}
.query-user-select.ants-select-bgc {
  .el-input__inner {
    border: 2px solid theme('colors.ants-bg-5');
    background-color: theme('colors.ants-bg-5');
    border-radius: 6px;
    line-height: 56px;
    height: 56px;
    padding-left: 45px;
  }
  .el-input__inner:focus {
    border-color: theme('colors.primary');
  }

  &::before {
    position: absolute;
    left: 20px;
    top: 18px;
    z-index: 1;
    font-size: 16px;
    color: #c0c4cc;
  }
}
</style>
