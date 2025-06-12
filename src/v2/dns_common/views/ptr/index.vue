<template>
  <div>
    <div class="content-box ants-tips_box">
      <span class="el-icon-info"></span>
      {{
        antsT(
          '注意：由于 PTR 反向解析需要向运行商服务器进行同步，记录添加或变更后需要 1 ~ 2 个工作日才可完全生效，请您耐心等待。'
        )
      }}
    </div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="
          isAdmin
            ? [
                {
                  name: '检索用户',
                  key: 'user',
                  value: queryInfo.user
                }
              ]
            : []
        "
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="$root.loading"
            @click="showCreateDialog()"
            text="添加 PTR 网段"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="batchDelete"
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
          align="center"
          width="45"
        ></ants-table-column>
        <ants-table-column
          width="80"
          label="ID"
          prop="id"
        />
        <ants-table-column
          width="300"
          label="网段"
          prop="groupName"
        >
          <template #default="{ row }">
            <span
              class="cursor-pointer text-primary mr-1"
              @click="goPtrRecordPage(row)"
            >
              {{ row.groupName }}
            </span>
            <span
              class="el-icon-edit-outline cursor-color text-2xl"
              @click="showUpdateDialog(row)"
            ></span>
          </template>
        </ants-table-column>
        <ants-table-column
          min-width="80"
          label="状态"
          prop="status"
        >
          <template #default="{ row }">
            <span
              class="text-success el-icon-success"
              v-if="row.status == 1"
            >
              正常</span>
            <span
              v-else
              class="text-error el-icon-error"
            > 异常</span>
          </template>
        </ants-table-column>
        <ants-table-column
          min-width="80"
          label="记录数"
          prop="childCount"
        >
          <template #default="{ row }"> {{ row.childCount || 0 }} 条 </template>
        </ants-table-column>
        <!-- <ants-table-column
          min-width="140"
          label="套餐"
          prop="plan"
        ></ants-table-column>
        <ants-table-column
          min-width="140"
          label="套餐到期时间"
          prop="planTime"
        ></ants-table-column> -->
        <ants-table-column
          min-width="140"
          label="创建时间"
          prop="createTime"
        ></ants-table-column>
        <ants-table-column
          min-width="140"
          label="用户"
          prop="userInfo"
          v-if="isAdmin"
        ></ants-table-column>

        <ants-table-column
          label="操作"
          width="150"
        >
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="goPtrRecordPage(row)"
              text="PTR"
            />
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <CreateDialog ref="CreateDialogRef" />
    <UpdateDialog ref="UpdateDialogRef" />
  </div>
</template>

<script>
import CreateDialog from './CreateDialog.vue'
import UpdateDialog from './UpdateDialog.vue'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getPtrList,
  doBatckDeletePtr
} = require(`@/v2/${PROCESS_NAME}/api/dns/ptr`)

export default {
  components: {
    CreateDialog,
    UpdateDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      total: 0,
      queryInfo: {
        parentId: 0,
        user: '', // 搜索框内容
        key: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      selectArr: [],
      btnLoading: false
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getPtrList(this.queryInfo)
        this.$root.loading = false
        if (res.code !== 1) return
        const obj = res.page || {}
        console.log(res)
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 添加修改
    showCreateDialog(row = {}) {
      this.$refs.CreateDialogRef.showDialog()
    },

    // 前往PTR记录页面
    goPtrRecordPage({ id, userId, groupName }) {
      this.$router.push({ name: 'PtrRecord', query: { id, userId, groupName } })
    },

    // 修改对话框显示
    showUpdateDialog(row = {}) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '网段'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((e) => e.id)
      const { data: res } = await doBatckDeletePtr({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     */

    async singleDelete({ groupName, id }) {
      const result = await this.$doDelete({
        name: groupName,
        tag: '网段'
      })
      if (!result) return
      this.btnLoading = true
      const { data: res } = await doBatckDeletePtr({
        ids: id
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除成功')
    }
  }
}
</script>
