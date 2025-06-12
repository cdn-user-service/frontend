<template>
  <el-select
    v-model="value"
    :multiple="multiple"
    filterable
    remote
    reserve-keyword
    :placeholder="antsT('检索用户名')"
    :remote-method="userRemoteMethod"
    :loading="loading"
    :size="size"
    @change="changeUser"
    class="query-user-select"
  >
    <el-option
      v-for="item in userList"
      :key="item.userId"
      :label="
        `ID：${item.userId} 用户名：${item.username}  手机：${item.mobile}  邮箱：${item.mail}`
      "
      :value="item[valueStr]"
    >
    </el-option>
  </el-select>
</template>

<script>
// API
import { getUserList } from '@/v2/dns_admin/api/account/user'

export default {
  name: 'QueryUserSelect',
  props: {
    // 所期望的输出值，可为 user 或者 user ID
    valueStr: {
      type: String,
      default: 'userId'
    },

    // 是否为多选
    multiple: {
      type: Boolean,
      default: false
    },

    // 大小
    size: {
      type: String,
      default: 'medium'
    }
  },
  data() {
    return {
      loading: false,
      userList: [],
      value: '' // 输入框的值
    }
  },
  methods: {
    /**
     * @description: 远程搜索域名
     * @param {*} queryString
     */

    async userRemoteMethod(queryString) {
      console.log(queryString)
      this.loading = true

      const { data: res } = await getUserList({
        username: queryString.trim(),
        page: 1,
        limit: 50
      })
      this.loading = false

      if (res.code !== 1) return
      this.userList = res.page && res.page.list
    },

    /**
     * @description: 值改变
     * @param {*} val
     */

    changeUser(val) {
      console.log(val)
      console.log(this.value)
    }
  }
}
</script>
<style lang="scss">
.query-user-select {
  .el-input {
    width: 100% !important;
  }
}
</style>
