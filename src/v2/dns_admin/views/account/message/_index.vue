<template>
  <div class="work_item_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入消息标题搜索',
            key: 'title',
            value: queryInfo.title
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getGoodsList"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="goAddMessage('add')"
            text="添加消息"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            @click="batchDelete"
            :loading="btnLoading"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getGoodsList"
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
              >站内信</el-tag
            >
            <el-tag size="mini" type="success" v-else>公告</el-tag>
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
              用户分组一
            </span>
            <span v-else>所有人</span>
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
        <ants-table-column prop="status" label="状态" min-width="60">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#F52443"
              active-color="#13ce66"
              :ref="`tableSwitchRef${$index}`"
              @change="toggleStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>
        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="goAddMessage(row.id)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="deleteWork(row)"
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
  doUpdate,
  doDelete
} from '@/v2/dns_admin/api/account/message'

export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        title: '', // 消息标题
        page: 1, // 当前的页数
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      dateSearch: '', // 搜索日期

      selectArr: [],
      tableData: [],
      btnLoading: false
    }
  },
  created() {
    this.getGoodsList()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取消息列表数据
     */

    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getMessageList(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return

      this.tableData = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    // 点击添加-修改消息
    goAddMessage(id) {
      this.$router.push({ name: 'UpdateMessage', query: { id: id } })
    },

    // 点击详情
    async checkDetail(row) {
      const { data } = await this.$http.post(
        '',
        this.$qs.stringify({ id: row.id })
      )
      console.log(data)
      // this.$router.push({ name: 'MessageDetail', params: { id } })
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
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

      const { data: res } = await doDelete(idsArr)

      if (res.code !== 1) return
      this.getGoodsList()
      this.$msg.success('已成功删除 ' + selectLength + ' 个消息')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteWork(row) {
      const result = await this.$doDelete({
        name: row.title,
        tag: '消息'
      })
      if (!result) return

      const { data: res } = await doDelete([row.id])

      if (res.code !== 1) return
      this.getGoodsList()
      this.$msg.success('删除消息成功')
    },

    /**
     * @description: 推送消息
     * @param {*} row
     */

    async toggleStatus(row, switchRef) {
      let txt = '开启'
      if (!row.status) {
        const confirmResult = await this.$confirm('关闭消息', {
          title: '关闭消息',
          message: '该操作将关闭消息 “' + row.title + '”，是否继续？',
          type: 'error',
          center: true
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          row.status = 1
          return this.$msg.info('已取消关闭消息')
        }
        txt = '关闭'
      }

      this.$refs[switchRef].loading = true

      const { data: res } = await doUpdate(row)

      this.$refs[switchRef].loading = false

      if (res.code !== 1) return
      this.getGoodsList()
      this.$msg.success(txt + '消息成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.check_type {
  color: theme('colors.primary') r;
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
