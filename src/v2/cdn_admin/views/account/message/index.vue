<template>
  <el-card class="content-box animated fadeIn">
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
          icon="el-icon-plus"
          :disabled="btnLoading || loading"
          @click="toSave()"
          text="发布消息"
        />

        <ants-button
          type="info"
          size="small"
          icon="el-icon-delete"
          @click="toBulkDel()"
          :disabled="btnLoading || loading"
          :loading="btnLoading"
          text="批量删除"
        />
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      @selection-change="handleSelectionChange"
      :total="total"
      :queryInfo="queryInfo"
    >
      <ants-table-column type="selection" width="45" align="center" />

      <ants-table-column
        prop="title"
        label="消息标题"
        min-width="140"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </ants-table-column>

      <ants-table-column prop="type" label="消息类型" min-width="80">
        <template #default="{ row }">
          <el-tag size="small" type="primary" v-if="row.type === 1">{{
            antsT('站内信')
          }}</el-tag>
          <el-tag size="small" type="success" v-else>{{
            antsT('公告')
          }}</el-tag>
        </template>
      </ants-table-column>

      <!-- <ants-table-column
          prop="content"
          show-overflow-tooltip
          label="消息内容"
          min-width="160"
        >
        </ants-table-column> -->

      <ants-table-column prop="sendType" label="接收人" min-width="80">
        <template #default="{ row }">
          <span v-if="row.sendType === 0">{{ antsT('指定用户') }}</span>
          <span v-else-if="row.sendType === 1">
            {{ antsT('指定分组') }}
          </span>
          <span v-else>{{ antsT('所有人') }}</span>
        </template>
      </ants-table-column>

      <ants-table-column
        prop="createtime"
        sortable
        label="发送时间"
        min-width="140"
      >
      </ants-table-column>

      <ants-table-column prop="status" label="状态" min-width="60">
        <template #default="{ row, $index }">
          <ants-table-switch
            v-model="row.status"
            :ref="`tableSwitchRef${$index}`"
            @change="changeStatus(row, `tableSwitchRef${$index}`)"
          />
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="160">
        <template #default="{ row }">
          <ants-button
            type="primary"
            size="mini"
            :disabled="btnLoading"
            @click="toSave(row)"
            text="详情"
          />
          <ants-button
            type="danger"
            size="mini"
            :disabled="btnLoading"
            @click="toDel(row)"
            text="删除"
          />
        </template>
      </ants-table-column>
    </ants-table>

    <FormDialog ref="FormDialogRef" @refresh="getTableData" />
  </el-card>
</template>

<script>
// api
import {
  getMessageList,
  getMessageInfoById,
  doCreateUpdateMessage,
  doDeleteMessage
} from '@/v2/cdn_admin/api/account/message'
// 组件
import FormDialog from './FormDialog'

export default {
  components: {
    FormDialog
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      total: 0,
      queryInfo: {
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        title: '', // 消息标题
        user: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getMessageList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = (obj.list || []).map(item => {
          const { sendObj, sendType } = item
          const sendArr = (sendObj || '').split(',')
          return {
            ...item,
            sendObj: sendType == 0 ? sendArr.filter(it => it !== '') : []
          }
        })
        console.log(this.tableData)
        this.total = obj.totalCount || 0
      } finally {
        this.loading = false
      }
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    toSave(row = {}) {
      this.$refs.FormDialogRef.show(row)
    },

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '关闭消息',
          content: `此操作将关闭消息“ <strong style="color: #F78989;">${row.title}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      try {
        const { data: res } = await doCreateUpdateMessage({
          ...row,
          sendObj: row.sendType == 0 ? row.sendObj + '' : null
        })
        if (res.code !== 1) {
          row.status = row.status ? 0 : 1
          return
        }
        this.$msg.success('操作成功')
      } finally {
        this.$refs[switchRef].loading = false
      }
    },

    async toBulkDel() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '消息'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await doDeleteMessage(
          this.selectArr.map(e => e.id)
        )
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('已成功删除 ' + selectLength + ' 个消息')
        this.selectArr = [] // 释放
      } finally {
        this.btnLoading = false
      }
    },

    async toDel(row) {
      const result = await this.$doDelete({
        name: row.title,
        tag: '消息'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await doDeleteMessage([row.id])
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('删除消息成功')
      } finally {
        this.btnLoading = false
      }
    }
  }
}
</script>
