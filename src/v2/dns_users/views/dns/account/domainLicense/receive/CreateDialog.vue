<template>
  <ants-dialog
    :title="`${form.id ? '修改' : '添加'}接收域名授权`"
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
      label-width="80px"
      @keyup.enter.native="submitForm"
    >
      <ants-form-item prop="shareHash" label="共享哈希">
        <ants-input
          v-model="form.shareHash"
          placeholder="请输入共享哈希"
        ></ants-input>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 管理端：查询用户列表
import { getUserListNav } from '@/v2/dns_admin/api/account/user'

const PROCESS_NAME = process.env.VUE_APP_NAME
// API
const { addReceiveRdata } = require(`@/v2/${PROCESS_NAME}/api/dns/rdata`)
const { getList } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

const defaultForm = {
  shareHash: ''
}
export default {
  components: {
    // QueryPlanSelect: (resolve) =>
    //   require([`@/v2/${PROCESS_NAME}/components/QueryPlanSelect`], resolve)
  },
  data() {
    return {
      pickerOptions: {
        // disabledDate(time) {
        //   return time.getTime() > Date.now()
        // }
      },
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      loading: false,
      btnLoading: false,
      userList: [],
      domainList: [],

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
        shareHash: [
          {
            required: true,
            message: '请输入共享哈希',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    // 获取域名列表
    async getDomainList() {
      const { data: res } = await getList({
        page: 1,
        limit: 1000
      })
      if (res.code !== 1) return
      console.log('域名列表', res.data.list)
      this.domainList = res.data.list
    },
    showDialog(row = {}) {
      this.getDomainList()
      if (row.id) {
        this.form = {
          ...defaultForm,
          ...row,
          timeValue: [
            row.notBefore && new Date(row.notBefore * 1000),
            row.notAfter && new Date(row.notAfter * 1000)
          ]
        }
      } else {
        this.form = {
          ...defaultForm
        }
      }

      this.dialogVisible = true
    },

    /**
     * @description: 构造时间范围格式
     * @param {*} val
     */

    makeTime(val) {
      return {
        notBefore: val && val[0] / 1000,
        notAfter: val && val[1] / 1000
      }
    },

    // 添加域名提交
    submitForm() {
      // 防止重复提交
      if (this.$refs.dialogRef.btnLoading) return
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          // 构造时间范围
          const { data: res } = await addReceiveRdata(this.form)
          if (res.code !== 1) return
          this.$emit('refresh')
          this.$msg.success('添加域名授权成功')
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
