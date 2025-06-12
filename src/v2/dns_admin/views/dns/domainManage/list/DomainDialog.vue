<template>
  <ants-dialog
    title="授权域名"
    v-model="dialogVisible"
    @closed="resetForm"
    @submit="submitForm"
    ref="dialogRef"
    width="500px"
  >
    <!-- <div class="font-semibold text-center mb-lg">
        {{ antsT('请输入您要解析的主域名') }}
      </div> -->

    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      @keyup.enter.native="submitForm"
      label-width="80px"
      :hide-required-asterisk="false"
    >
      <ants-form-item label="选择用户" prop="user" class="mb-lg">
        <el-select
          v-model="form.user"
          filterable
          remote
          reserve-keyword
          :placeholder="antsT('检索用户名')"
          :remote-method="userRemoteMethod"
          :loading="loading"
          @change="changeUser"
          style="width: 100%"
          value-key="userId"
          clearable
        >
          <el-option
            v-for="item in userList"
            :key="item.userId"
            :label="item.username"
            :value="{
              userId: item.userId,
              username: item.username
            }"
          />
        </el-select>
      </ants-form-item>
      <ants-form-item label="权限类型" prop="type">
        <el-select
          v-model="form.type"
          filterable
          reserve-keyword
          :placeholder="antsT('请选择权限类型')"
          style="width: 100%"
          value-key="value"
          clearable
        >
          <el-option
            v-for="item in [
              { value: 'read', label: '只读' },
              { value: 'write', label: '读写' }
            ]"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </ants-form-item>

      <!-- <ants-form-item prop="consumeId">
          <QueryPlanSelect
            :username="form.username"
            v-model="form.consumeId"
            ref="QueryPlanSelectRef"
            is-bgc
          />
        </ants-form-item> -->

      <!-- <ants-form-item prop="domain">
          <ants-input
            is-bgc
            v-model="form.domain"
            prefix-icon="aicon icon-wangluo"
            placeholder="请输入主域名"
            @keyup.enter.native="submitForm()"
          ></ants-input>
        </ants-form-item> -->
    </ants-form>
  </ants-dialog>
</template>

<script>
// 管理端：查询用户列表
import { getUserListNav } from '@/v2/dns_admin/api/account/user'

const PROCESS_NAME = process.env.VUE_APP_NAME
// API
const { doCreate } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

const defaultForm = {
  user: null,
  username: '',
  userid: '',

  domain: '',
  consumeId: 0
}
export default {
  components: {
    // QueryPlanSelect: (resolve) =>
    //   require([`@/v2/${PROCESS_NAME}/components/QueryPlanSelect`], resolve)
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
      rules: {
        user: [
          {
            required: true,
            message: '请选择用户',
            trigger: ['change', 'blur']
          }
        ],
        type: [
          {
            required: true,
            message: '请选择权限类型',
            trigger: 'change'
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
    showDialog() {
      this.dialogVisible = true
    },

    // 添加域名提交
    submitForm() {
      // 防止重复提交
      if (this.$refs.dialogRef.btnLoading) return
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doCreate({
            userid: this.form.userid,
            operation_type: 'add',
            domain: this.form.domain,
            consumeId: this.form.consumeId ? this.form.consumeId : undefined
          })

          if (res.code !== 1) {
            return this.$alert(res.msg, '添加域名失败', {
              center: true,
              type: 'error'
            }).catch((err) => err)
          }

          this.$emit('refresh')
          this.$msg.success('添加域名成功')
          this.dialogVisible = false
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
    },

    // 管理端：远程搜索用户
    async userRemoteMethod(queryString) {
      console.log(queryString)
      this.loading = true

      try {
        const { data: res } = await getUserListNav({
          username: queryString.trim(),
          page: 1,
          limit: 50
        })
        if (res.code !== 1) return
        this.userList = (res.page || {}).list || []
      } finally {
        this.loading = false
      }
    },

    // 管理端：选择用户
    changeUser(val = {}) {
      console.log(val)
      this.form.userid = val.userId
      this.form.username = val.username
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
