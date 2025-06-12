<template>
  <ants-select
    v-model="selectValue"
    :multiple="multiple"
    filterable
    remote
    reserve-keyword
    clearable
    :placeholder="placeholder"
    :remote-method="userRemoteMethod"
    :loading="loading"
    :size="size"
    v-bind="$attrs"
    class="query-user-select"
    :class="{ 'el-icon-user-solid ants-select-bgc': isBgc }"
  >
    <ants-option
      v-for="item in userList"
      :key="item.userId"
      :label="
        `ID[${item.userId}] 用户名[${item.username}] 手机[${item.mobile}] 邮箱[${item.mail}]`
      "
      :value="item[valueStr]"
    >
    </ants-option>
  </ants-select>
</template>

<script>
// API
import { getUserList } from '@/v2/cdn_admin/api/account/users'

export default {
  name: 'QueryUserSelect',
  props: {
    value: [String, Number, Boolean, Array],
    // 所期望的输出值，可为 user 或者 user ID
    valueStr: {
      type: String,
      default: 'userId'
    },
    // 是否为多选
    multiple: Boolean,
    // 大小
    size: {
      type: String,
      default: 'medium'
    },
    // 是否为背景选择框
    isBgc: Boolean,
    // 检索的用户名
    username: String,

    placeholder: {
      type: String,
      default: '检索用户名'
    }
  },
  data() {
    return {
      loading: false,
      userList: []
    }
  },
  watch: {
    // 监听username变化，看是否主动调用远程搜索
    username: function (newVal, oldVal) {
      if (newVal) {
        this.userRemoteMethod(newVal)
      }
    }
  },
  model: {
    event: 'updateValue'
  },
  computed: {
    selectValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('updateValue', val)
      }
    }
  },
  methods: {
    /**
     * @description: 远程搜索用户
     * @param {*} queryString
     */

    async userRemoteMethod(queryString) {
      this.loading = true
      const { data: res } = await getUserList({
        user: queryString.trim(),
        page: 1,
        limit: 50
      })
      this.loading = false
      if (res.code !== 1) return
      this.userList = res.data && res.data.list
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
