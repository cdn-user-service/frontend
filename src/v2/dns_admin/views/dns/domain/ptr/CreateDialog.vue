<template>
  <ants-dialog
    title="添加反向解析"
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
      <ants-form-item label="选择用户" prop="userId">
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
      <ants-form-item label="选择套餐" prop="planId">
        <ants-select
          v-model="form.planId"
          placeholder="请选择套餐"
        >
          <el-option
            v-for="item in planList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
          </el-option>
        </ants-select>
      </ants-form-item>
      <ants-form-item label="网段" prop="name">
        <ants-input v-model="form.name" placeholder="请输入网段" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doUpdateServerGroup } from '@/v2/dns_admin/api/dns/serve'
import { getUserListNav } from '@/v2/dns_admin/api/account/user'

// 组件

const defaultForm = {
  planId: '',
  name: ''
}
export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,

      form: {
        ...defaultForm
      },

      formRules: {
        name: [
          {
            required: true,
            message: '请输入网段',
            trigger: ['change', 'blur']
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
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
    },

    /**
     * @description: 远程搜索域名
     */

    async userRemoteMethod(queryString) {
      this.loading = true
      const { data: res } = await getUserListNav({
        username: queryString.trim(),
        page: 1,
        limit: 50
      })
      this.loading = false
      if (res.code !== 1) return
      this.userList = res.page && res.page.list
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
     * @description: 添加编辑参数提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        // this.$refs.dialogRef.btnLoading = true
        // const { data: res } = await doUpdateServerGroup(this.form)
        // this.$refs.dialogRef.btnLoading = false
        // if (res.code !== 1) return
        // this.$parent.getTableData()
        // this.$msg.success('添加成功')
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
