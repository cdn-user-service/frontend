<template>
  <div class="work_item_box">
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
            :disabled="$root.loading"
            @click="goCreateUpdatePage('add')"
            text="创建消息"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            @click="batchDelete"
            :disabled="$root.loading"
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
        <ants-table-column
          type="selection"
          width="45"
          align="center"
          key="0"
        ></ants-table-column>
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
            <el-tag size="mini" type="primary" v-if="row.type === 1"
              >{{antsT('站内信')}}</el-tag
            >
            <el-tag size="mini" type="primary" v-else>{{antsT('公告')}}</el-tag>
          </template>
        </ants-table-column>
        <ants-table-column
          prop="content"
          show-overflow-tooltip
          label="消息内容"
          min-width="160"
        >
        </ants-table-column>
        <ants-table-column prop="sendType" label="接收人" min-width="80">
          <template #default="{ row }">
            <span v-if="row.sendType === 0"> {{ row.sendObj }}</span>
            <span v-else-if="row.sendType === 1">
              {{antsT('用户分组一')}}
            </span>
            <span v-else>{{antsT('所有人')}}</span>
          </template>
        </ants-table-column>
        <ants-table-column prop="create_manager" label="发送人" min-width="80">
        </ants-table-column>
        <!-- <ants-table-column label="发送IP" min-width="100">
          --
        </ants-table-column> -->
        <ants-table-column
          prop="createtime"
          sortable
          label="发送时间"
          min-width="140"
        >
        </ants-table-column>
        <ants-table-column prop="status" label="状态" width="70">
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
              @click="goCreateUpdatePage(row.id)"
              text="编辑"
            />
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
// api
import {
  getMessageList,
  getMessageInfoById,
  doCreateUpdateMessage,
  doDeleteMessage
} from '@/v2/cdn_admin/api/account/message'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        title: '', // 消息标题
        user: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      selectArr: [],
      tableData: [],
      btnLoading: false
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取消息列表数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getMessageList(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return

      this.tableData = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    // 点击添加-修改消息
    goCreateUpdatePage(id) {
      this.$router.push({ path: './message/update', query: { id: id } })
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 启用禁用
     * @param {*} row
     */

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
      const { data: res } = await doCreateUpdateMessage(row)
      this.$refs[switchRef].loading = false
      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }
      this.$msg.success(this.antsT('操作成功'))
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '消息'
      })
      if (!result) return

      const idsArr = this.selectArr.map(e => {
        return e.id
      })
      this.btnLoading = true
      const { data: res } = await doDeleteMessage(idsArr)
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个消息')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete(row) {
      const result = await this.$doDelete({
        name: row.title,
        tag: '消息'
      })
      if (!result) return
      this.btnLoading = true

      const { data: res } = await doDeleteMessage([row.id])
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除消息成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.check_type {
  color: theme('colors.primary');
  cursor: pointer;
}
</style>
<style lang="scss">
.work_item_box {
  .btn_box {
    .el-select .el-input {
      width: 90px;
    }
  }

  .el-dialog--center .el-dialog__body {
    padding: 20px 60px;
  }
}
</style>
