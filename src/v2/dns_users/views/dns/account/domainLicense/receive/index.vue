<template>
  <el-card class="content-box animated fadeIn">
    <table-query-form :queryInfo="queryInfo" @changeInput="getTableData">
      <template slot="buttons">
        <ants-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          :disabled="$root.loading || btnLoading"
          @click="saveRdata()"
          text="添加授权"
        />
        <ants-button
          type="info"
          icon="el-icon-delete"
          size="small"
          :disabled="$root.loading || btnLoading"
          @click="deleteRdata()"
          text="批量删除"
        />
      </template>
    </table-query-form>

    <ants-table
      :data="tableData"
      @getTableData="getTableData"
      :total="total"
      :queryInfo="queryInfo"
      @selection-change="handleSelectionChange"
    >
      <ants-table-column type="selection" width="45" align="center">
      </ants-table-column>

      <ants-table-column prop="id" label="ID" min-width="50">
      </ants-table-column>
      <ants-table-column prop="domain" label="域名" min-width="100">
      </ants-table-column>
      <ants-table-column prop="permission" label="权限" min-width="80">
        <template #default="{ row }">
          {{ permissionObj[row.permission] || '--' }}
        </template>
      </ants-table-column>
      <ants-table-column prop="top" label="主机记录" min-width="80">
      </ants-table-column>

      <ants-table-column prop="shareHash" label="共享哈希" min-width="180">
        <template #default="{ row }">
          <ants-copy :text="row.shareHash" />
        </template>
      </ants-table-column>
      <ants-table-column prop="notBefore" label="起始时间" min-width="100">
        <template #default="{ row }">
          {{ timestampToDate(row.notBefore) }}
        </template>
      </ants-table-column>

      <ants-table-column prop="notAfter" label="截止时间" min-width="100">
        <template #default="{ row }">
          {{ timestampToDate(row.notAfter) }}
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="100">
        <template #default="{ row }">
          <!-- <ants-button
            size="mini"
            type="primary"
            text="修改"
            icon="el-icon-edit"
            @click="saveRdata(row)"
          /> -->

          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="delRdata(row.id)"
            text="删除"
          />
        </template>
      </ants-table-column>
    </ants-table>
    <!-- 添加接收域名授权对话框 -->
    <CreateDialog ref="CreateDialogRef" @refresh="getTableData" />
  </el-card>
</template>

<script>
// 组件
import CreateDialog from './CreateDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getReceiveList,
  addReceiveRdata,
  deleteReceiveRdata
} = require(`@/v2/${PROCESS_NAME}/api/dns/rdata`)

const permissionObj = {
  w: '只读',
  r: '只写',
  'w:r': '读写'
}

export default {
  components: {
    CreateDialog
  },
  props: {},
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      permissionObj,
      queryInfo: {
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      tableData: [],
      total: 0,
      selectArr: []
    }
  },
  created() {},
  mounted() {},
  watch: {
    // 监听路由地址参数的改变
    '$route.params.path': {
      handler(newVal, oldVal) {
        console.log('object', newVal)
        this.getTableData()
      },
      // 立即触发
      immediate: true
    }
  },
  methods: {
    handleSelectionChange(val) {
      this.selectArr = val
    },
    // 封装一个方法  将 时间戳 转换成 日期 格式为 2020-01-01
    timestampToDate(timestamp) {
      if (!timestamp) return
      const time = timestamp * 1000
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用发起域名授权',
          content: '此操作将禁用该发起域名授权，是否继续？'
        })
        if (!result) {
          row.status = 1
          return
        }
      }

      this.$refs[switchRef].loading = true
      const { data: res } = await addReceiveRdata(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }

      this.$msg.success('操作成功')
    },
    // 查询订单列表
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getReceiveList(this.queryInfo)
        if (res.code !== 1) return
        console.log('发起域名授权', res.data)
        this.tableData =
          res.data.records?.map((item) => {
            return {
              ...item.data,
              ...item
            }
          }) || []
        this.total = res.data.total || 0
      } finally {
        this.$root.loading = false
      }
    },
    // 修改|添加
    saveRdata(row = {}) {
      this.$refs.CreateDialogRef.showDialog(row)
    },
    // 删除
    async delRdata(id) {
      const result = await this.$doDelete({
        tag: '域名授权'
      })
      if (!result) return
      const { data: res } = await deleteReceiveRdata({ ids: id })
      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.getTableData()
    },
    // 批量删除
    async deleteRdata() {
      if (!this.selectArr.length) {
        this.$msg.warning('请选择要删除的数据')
        return
      }
      const result = await this.$batchDelete(this.selectArr.length, {
        tag: '域名授权'
      })
      if (!result) return

      const ids = this.selectArr.map((item) => item.id).join(',')
      const { data: res } = await deleteReceiveRdata({ ids })
      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.getTableData()
    }
  }
}
</script>
