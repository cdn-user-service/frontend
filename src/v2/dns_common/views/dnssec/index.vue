<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form :queryInfo="queryInfo" @changeInput="getTableData">
        <template slot="buttons">
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-plus"
            :disabled="loading || btnLoading"
            @click="toAdd()"
            text="添加 DNSSEC"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-s-promotion"
            :loading="btnLoading"
            :disabled="loading"
            @click="toSync()"
            text="同步DNSSEC"
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

        <ants-table-column min-width="150" label="关键标签" prop="groupName">
          <template #header>
            <el-tooltip
              content="用于标识域名的 DNSSEC 记录，0 ~ 65536 的整数值"
              placement="top-start"
            >
              <span>
                关键标签
                <i class="el-icon-info text-primary text-df"></i>
              </span>
            </el-tooltip>
          </template>
        </ants-table-column>

        <ants-table-column min-width="150" label="加密算法" prop="status">
          <template #header>
            <el-tooltip content="生成签名的加密算法" placement="top-start">
              <span>
                加密算法
                <i class="el-icon-info text-primary text-df"></i>
              </span>
            </el-tooltip>
          </template>
        </ants-table-column>

        <ants-table-column min-width="80" label="摘要类型" prop="childCount">
          <template #header>
            <el-tooltip content="构建摘要的算法类型" placement="top-start">
              <span>
                摘要类型
                <i class="el-icon-info text-primary text-df"></i>
              </span>
            </el-tooltip>
          </template>
        </ants-table-column>

        <ants-table-column min-width="140" label="摘要" prop="createTime">
          <template #header>
            <el-tooltip
              content="域名解析商处获取到的摘要内容"
              placement="top-start"
            >
              <span>
                摘要
                <i class="el-icon-info text-primary text-df"></i>
              </span>
            </el-tooltip>
          </template>
        </ants-table-column>

        <ants-table-column
          min-width="140"
          label="用户"
          prop="userInfo"
          v-if="isAdmin"
        ></ants-table-column>

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              size="mini"
              type="primary"
              :disabled="btnLoading"
              @click="toEdit(row)"
              text="修改"
            />
            <ants-button
              size="mini"
              type="danger"
              :disabled="btnLoading"
              @click="toDel(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <FormDialog ref="FormDialogRef" @refresh="getTableData" />
  </div>
</template>

<script>
import FormDialog from './FormDialog.vue'

const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getSecList,
  doSaveSec,
  doDeleteSec,
  doSyncSec
} = require(`@/v2/${PROCESS_NAME}/api/dns/dnssec`)

export default {
  components: {
    FormDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      loading: false,
      btnLoading: false,
      total: 0,
      queryInfo: {
        user: '', // 搜索框内容
        key: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      selectArr: []
    }
  },
  created() {
    // this.getTableData()
  },
  methods: {
    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getSecList(this.queryInfo)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.loading = false
      }
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 启动添加
    toAdd() {
      this.$refs.FormDialogRef.show({})
    },

    toEdit(row) {},

    // 同步
    async toSync() {
      this.btnLoading = true
      try {
        const { data: res } = await doSyncSec()
        if (res.code !== 1) return
        this.$msg.success('同步成功')
        this.getTableData()
      } finally {
        this.btnLoading = false
      }
    },

    // 删除
    async toDel(row) {
      const result = await this.$doDelete({
        tag: 'DNSSEC'
      })
      if (!result) return
      this.btnLoading = true
      try {
        const { data: res } = await doDeleteSec({
          ids: row.id
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
