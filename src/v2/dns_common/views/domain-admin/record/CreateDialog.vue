<template>
  <ants-dialog
    :title="`${form.id ? '修改' : '添加'}发起域名授权`"
    v-model="dialogVisible"
    @closed="resetForm"
    @submit="submitForm"
    ref="dialogRef"
    width="500px"
  >
    <template #right-btn>
      <!-- 这里放置你想要显示在右按钮区域的内容 -->
      <span @click="$router.push('/dns/account/domainLicense/initiate')"
        >详情</span
      >
    </template>
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
      @keyup.enter.native="submitForm"
    >
      <ants-form-item prop="domain" label="域名">
        <ants-select
          v-model="form.domain"
          filterable
          placeholder="请选择域名"
          disabled
        >
          <ants-option
            v-for="item in domainList"
            :key="item.domain"
            :label="item.domain"
            :value="item.domain"
          />
        </ants-select>
      </ants-form-item>

      <ants-form-item prop="permission" label="权限">
        <ants-select
          v-model="form.permission"
          size="small"
          placeholder="请选择权限"
        >
          <ants-option label="只读" value="w" />
          <ants-option label="读写" value="w:r" />
        </ants-select>
      </ants-form-item>

      <ants-form-item prop="top" label="主机记录">
        <ants-input v-model="form.top" placeholder="www" disabled></ants-input>
      </ants-form-item>

      <ants-form-item prop="timeValue" label="起止时间">
        <el-date-picker
          v-model="form.timeValue"
          type="daterange"
          value-format="timestamp"
          :range-separator="antsT('至')"
          :start-placeholder="antsT('开始日期')"
          :end-placeholder="antsT('结束日期')"
          align="center"
          unlink-panels
          :picker-options="pickerOptions"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// 管理端：查询用户列表
import { getUserListNav } from '@/v2/dns_admin/api/account/user'

const PROCESS_NAME = process.env.VUE_APP_NAME
// API
const { addOutRdata } = require(`@/v2/${PROCESS_NAME}/api/dns/rdata`)
const { getList } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

const defaultForm = {
  id: null,
  domain: '',
  domainId: 0,
  notAfter: 0,
  notBefore: 0,
  permission: 'w:r',
  shareHash: '',
  status: 1,
  top: '',
  userId: 0,
  timeValue: null
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
        domain: [
          {
            required: true,
            message: '请输入主域名，格式如：domain.com',
            trigger: ['blur', 'change']
          }
        ],
        permission: [
          {
            required: true,
            message: '请选择权限',
            trigger: 'change'
          }
        ],
        top: [
          {
            required: true,
            message: '请输入主机记录',
            trigger: 'change'
          }
        ],
        timeValue: [
          {
            required: true,
            message: '请选择起止时间',
            trigger: 'change'
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
          const { domain, permission, top } = this.form
          // 构造时间范围
          const { notBefore, notAfter } = this.makeTime(this.form.timeValue)
          // 1735660800000

          const { data: res } = await addOutRdata({
            ...defaultForm,
            recordId: this.form.record_id,
            domain,
            top,
            permission,
            notBefore,
            notAfter
          })

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
