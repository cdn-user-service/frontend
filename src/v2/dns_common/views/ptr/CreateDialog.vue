<template>
  <ants-dialog
    title="添加 PTR 网段"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >
      <ants-form-item label="选择用户" prop="userId" v-if="isAdmin">
        <ants-select
          v-model="form.userId"
          filterable
          remote
          reserve-keyword
          placeholder="检索用户"
          :remote-method="userRemoteMethod"
          :loading="loading"
          @change="changeUser"
          class="query-user-select"
        >
          <el-option
            v-for="item in userList"
            :key="item.userId"
            :label="item.username"
            :value="item.userId"
          >
          </el-option>
        </ants-select>
      </ants-form-item>
      <!-- <ants-form-item label="选择套餐" prop="planId">
        <ants-select v-model="form.planId" placeholder="请选择套餐">
          <el-option
            v-for="item in planList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </ants-select>
      </ants-form-item> -->
      <ants-form-item label="网段" prop="groupName">
        <ants-input
          v-model="form.groupName"
          placeholder="请输入网段"
          maxlength="39"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { getUserList } from '@/v2/dns_admin/api/account/user'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSavePtr } = require(`@/v2/${PROCESS_NAME}/api/dns/ptr`)

const defaultForm = {
  parentId: 0,
  id: 0,
  // 用户ID
  userId: '',
  // 套餐ID , 暂时不用
  planId: '',
  // 网段
  groupName: '',
  status: 1
}
export default {
  data() {
    const isIp = (rule, value, callback) => {
      // const regIpv61 = /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
      const regIpv6 = /^[\da-fA-F:.]{1,39}$/
      const regIpv4 = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){0,3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/

      if (regIpv4.test(value) || regIpv6.test(value)) {
        return callback()
      }
      callback(new Error('网段格式错误'))
    }

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',

      dialogVisible: false,
      loading: false,

      form: {
        ...defaultForm
      },

      formRules: {
        groupName: [
          {
            required: true,
            message: '请输入网段',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp,
            trigger: 'blur'
          }
        ],
        planId: [
          {
            required: true,
            message: '请选择套餐',
            trigger: 'change'
          }
        ],
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ]
      },

      userList: [],
      planList: []
    }
  },
  methods: {
    /**
     * @description: 点击添加，编辑
     */

    showDialog(row = {}) {
      this.dialogVisible = true
    },

    /**
     * @description: 远程搜索域名
     */

    async userRemoteMethod(queryString) {
      this.loading = true
      const { data: res } = await getUserList({
        username: queryString.trim(),
        page: 1,
        limit: 50
      })
      this.loading = false
      if (res.code !== 1) return
      this.userList = (res.page || {}).list
    },

    /**
     * @description: 选择用户
     */

    changeUser(val) {
      console.log(val)
      const arr = []
      for (let i = 1; i < 5; i++) {
        arr.push({
          id: i,
          name: '反向解析套餐' + i
        })
      }
      this.planList = arr

      if (this.planList.length) {
        this.form.planId = this.planList[0].id
      }
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doSavePtr(this.form)
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return
        this.$parent.getTableData()
        this.$msg.success('添加成功')
        this.dialogVisible = false
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
