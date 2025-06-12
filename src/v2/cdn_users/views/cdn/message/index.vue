<template>
  <el-card class="content-box animated fadeIn message-list">
    <table-query-form
      :search-arr="[
        {
          name: '检索消息标题',
          key: 'title',
          value: queryInfo.title
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="primary"
          size="small"
          icon="el-icon-finished"
          text="标记为已读"
        />
        <ants-button
          type="info"
          size="small"
          icon="el-icon-delete"
          @click="toBulkDel"
          :loading="btnLoading"
          :disabled="$root.loading"
          text="批量删除"
        />
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column type="selection" width="45" align="center" />

      <ants-table-column
        prop="title"
        label="消息标题"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <router-link
            :to="`./message/detail?id=${row.id}`"
            class="hover:underline"
            :class="{ 'font-semibold': !row.readStatus }"
          >
            <i
              class="mr-xs align-middle"
              style="font-size: 16px;margin-top:-3px;"
              :class="
                row.readStatus ? 'el-icon-folder-opened' : 'el-icon-folder'
              "
            />
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </ants-table-column>

      <ants-table-column
        prop="content"
        show-overflow-tooltip
        label="消息内容"
        min-width="200"
      >
        <template #default="{ row }">
          <div
            class="truncate"
            style="max-height:20px"
            v-html="row.content"
          ></div>
        </template>
      </ants-table-column>

      <ants-table-column
        prop="createtime"
        sortable
        label="接收时间"
        min-width="140"
      />

      <ants-table-column prop="type" label="消息类型" min-width="80">
        <template #default="{ row }">
          <el-tag size="mini" type="primary" v-if="row.type === 1">{{
            antsT('站内信')
          }}</el-tag>
          <el-tag size="mini" type="primary" v-else>{{
            antsT('公告消息')
          }}</el-tag>
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="150">
        <template #default="{ row }">
          <ants-button
            type="primary"
            size="mini"
            @click="goDetail(row.id)"
            :disabled="btnLoading"
            text="详情"
          />
          <ants-button
            type="danger"
            size="mini"
            @click="toDel(row)"
            :disabled="btnLoading"
            text="删除"
          />
        </template>
      </ants-table-column>
    </ants-table>
  </el-card>
</template>

<script>
// api
import {
  getNoticeList,
  getMsgList,
  doDelete
} from '@/v2/cdn_users/api/cdn/message'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        title: '', // 消息标题
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        pagenum: 1, // 当前的页数
        pagesize: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      btnLoading: false,
      selectArr: [],
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    // 状态设置
    tableRowClassName({ row, rowIndex }) {
      if (row.readStatus) {
        return 'delete-row'
      }
      return ''
    },

    // 获取消息列表数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getMsgList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 点击详情
    goDetail(id) {
      this.$router.push({ path: './message/detail', query: { id } })
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    // 批量删除
    async toBulkDel() {
      const selectLength = this.selectArr.length
      const result = await this.$toBulkDel(selectLength, {
        tag: '消息'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const idsArr = this.selectArr.map(e => e.id)
        const { data: res } = await doDelete({
          ids: idsArr + ''
        })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('已成功删除 ' + selectLength + ' 个消息')
        this.selectArr = [] // 释放
      } finally {
        this.btnLoading = false
      }
    },

    // 单个删除
    async toDel(row) {
      const result = await this.$doDelete({
        name: row.title,
        tag: '消息'
      })
      if (!result) return
      this.btnLoading = true
      try {
        const { data: res } = await doDelete({
          ids: row.id + ''
        })

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('删除成功')
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>

<style lang="scss">
.message-list {
  .delete-row {
    // background: theme('colors.ants-bg-4');
    color: theme('colors.ants-text-4');
    a {
      color: theme('colors.ants-text-4');
    }
  }
}
</style>
