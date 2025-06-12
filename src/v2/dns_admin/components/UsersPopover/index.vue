<template>
  <el-popover
    placement="bottom-start"
    width="360"
    trigger="click"
    ref="usersPopoverRef"
  >
    <span
      slot="reference"
      class="block cursor-color text-center py-sm pl-df pr-lg border border-ants-border-1 rounded-xl leading-none truncate"
      :style="{ width }"
    >
      {{
        currentRow.username ||
          currentRow.mobile ||
          currentRow.mail ||
          currentRow.userId ||
          '请选择用户'
      }}
      <i
        style="margin-right:-10px;margin-top:2px;"
        class="el-icon-plus float-right"
      ></i>
    </span>

    <div class="">
      <el-table
        style="margin-top:0;"
        size="mini"
        :data="tableData"
        height="340px"
        @row-click="onRowClick"
        @selection-change="onSelectionChange"
        border
        row-key="userId"
        v-loading="loading"
        class="users-popover-table"
      >
        <div slot="empty">
          <el-empty :description="antsT('还没有用户')">
            <ants-button
              type="primary"
              size="mini"
              @click="$router.push('/account/users/users')"
              text="前往添加用户"
            />
          </el-empty>
        </div>
        <!-- 多选 -->
        <ants-table-column
          width="45"
          align="center"
          type="selection"
          v-if="multiple"
        />
        <ants-table-column prop="username" label="用户" min-width="250">
          <template #header>
            <el-input
              class="ants-search_input"
              :placeholder="antsT('检索用户名')"
              clearable
              v-model="query.username"
              size="small"
              @change="toQuery"
              style="width:100%;"
            >
              <i
                slot="prefix"
                class="el-input__icon aicon icon-sousuo"
                @click="toQuery"
              />
            </el-input>
          </template>

          <template #default="{ row }">
            <span v-if="multiple">{{
              row.username || row.mobile || row.mail
            }}</span>
            <el-radio v-model="currentRow.userId" :label="row.userId" v-else>
              {{ row.username || row.mobile || row.mail }}
            </el-radio>
          </template>
        </ants-table-column>
        <ants-table-column prop="userId" label="ID" width="70">
        </ants-table-column>
      </el-table>
      <el-pagination
        style="margin-top:5px;"
        background
        layout="total, prev, pager, next"
        :total="total"
        small
        :page-sizes="[10, 20, 50]"
        :page-size="query.limit"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="query.page"
      />
    </div>
  </el-popover>
</template>

<script>
// API
import { getUserList } from '@/v2/dns_admin/api/account/user'

export default {
  props: {
    // 双向绑定的值
    value: [String, Number],
    // 双向绑定的值为 userId 还是 username
    valueType: {
      type: String,
      default: 'userId'
    },
    // 是否为多选
    multiple: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '260px'
    }
  },
  model: {
    prop: 'value',
    event: 'updateValue'
  },
  data() {
    return {
      loading: false,
      total: 0,
      query: {
        username: '',
        page: 1,
        limit: 10
      },
      // 表格数据
      tableData: [],
      // 多选用户
      selectArr: [],
      // 单选用户
      currentRow: {
        [this.valueType]: this.value
      }
    }
  },
  watch: {
    value: function(newVal) {
      if (this.currentRow[this.valueType] != newVal) {
        this.currentRow = {
          [this.valueType]: newVal
        }
      }
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getUserList(this.query)
        this.loading = false
        if (res.code !== 1) return
        const obj = res.page || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 查询
    toQuery() {
      this.query.page = 1
      this.getTableData()
    },

    /**
     * @description: 值改变
     */

    changeUser(val) {
      console.log(val)
      console.log(this.value)
    },

    // 多选用户
    onSelectionChange(val) {
      this.selectArr = val
    },

    // 单选点击行
    onRowClick(row) {
      this.currentRow = row
      // 设置绑定值
      this.$emit('updateValue', row[this.valueType])
      // 隐藏popover
      this.$refs.usersPopoverRef.doClose()
      this.$emit('change', row)
    },

    // 重置选中数据
    reset() {
      this.currentRow = {}
      this.$emit('updateValue', '')
      this.$emit('change', {})
    },

    // 监听limit 改变事件
    handleSizeChange(newSize) {
      this.query.limit = newSize
      this.getTableData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.query.page = newPage
      this.getTableData()
    }
  }
}
</script>
<style lang="scss">
.users-popover-table {
  .el-table__cell {
    padding: 3px 0;
  }
}
</style>
