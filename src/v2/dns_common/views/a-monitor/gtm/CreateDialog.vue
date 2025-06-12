<template>
  <ants-dialog
    title="添加任务"
    v-model="dialogVisible"
    width="800px"
    ref="dialogRef"
    @closed="closed"
    top="5vh"
  >
    <div class="ants-tips_box mb-lg -mt-df">
      <span class="el-icon-info"></span>
      只显示 A 、AAAA 或 CNAME 记录
    </div>

    <div class="flex items-center pb-sm">
      <el-input
        class="ants-search_input"
        :placeholder="antsT('检索主机记录')"
        clearable
        v-model="query.top"
        size="small"
        @change="changeInput"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
          @click="changeInput"
        />
      </el-input>

      <el-input
        class="ants-search_input ml-df"
        :placeholder="antsT('检索域名')"
        clearable
        v-model="query.domain"
        size="small"
        @change="changeInput"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
          @click="changeInput"
        />
      </el-input>
    </div>
    <el-table
      size="mini"
      :data="tableData"
      @row-click="onRowClick"
      border
      row-key="id"
      v-loading="loading"
      highlight-current-row
      style="margin:0;line-height:1;"
    >
      <div slot="empty">
        <el-empty :description="antsT('暂无数据')">
          <ants-button
            type="primary"
            size="mini"
            @click="$router.push('/dns/domain/list')"
            text="前往添加"
          />
        </el-empty>
      </div>

      <ants-table-column min-width="150" label="主机记录" prop="top">
        <template #default="{ row }">
          <el-radio v-model="currentRow.id" :label="row.id">
            {{ row.top }}
          </el-radio>
        </template>
      </ants-table-column>

      <ants-table-column prop="domain" label="域名" min-width="150">
        <!-- <template #default="{ row }">
          <el-radio v-model="currentRow.id" :label="row.id">
            {{ row.domain }}
          </el-radio>
        </template> -->
      </ants-table-column>
      
      <ants-table-column width="110" label="记录类型" prop="recordType">
      </ants-table-column>
      <ants-table-column width="110" label="线路类型" prop="recordLineName">
      </ants-table-column>

      <ants-table-column width="70" label="ID" prop="id"></ants-table-column>

      <!-- <ants-table-column
        label="用户"
        prop="username"
        min-width="140"
        v-if="isAdmin"
      >
        <template #default="{ row }">
          {{
            row.userInfo &&
              (row.userInfo.username ||
                row.userInfo.mail ||
                row.userInfo.mobile)
          }}
        </template>
      </ants-table-column> -->
    </el-table>
    <el-pagination
      background
      style="margin-top:10px;margin-bottom:-20px;"
      layout="total, prev, pager, next"
      :total="total"
      small
      :page-size="query.limit"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="query.page"
    />

    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        @click="dialogVisible = false"
        icon="el-icon-close"
        text="取 消"
      />
      <ants-button
        size="small"
        type="primary"
        icon="el-icon-check"
        :loading="btnLoading"
        @click="doSave()"
        text="保 存"
      />
    </template>
  </ants-dialog>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doSaveGtmTask,
  getRecordTypeList
} = require(`@/v2/${PROCESS_NAME}/api/dns/gtm`)

const defaultForm = {
  // 选择的域名
  domain: '',
  domainId: null,
  userId: null,
  // 记录ID
  rdataId: null
}

export default {
  components: {},
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      loading: false,
      btnLoading: false,

      form: {
        ...defaultForm
      },

      // 选中记录的记录值
      rdata: '',

      currentRow: {},
      query: {
        page: 1,
        limit: 10,
        domainId: null,
        domain: null,
        top: null,
        key: null,
        user: null
      },
      total: 0,
      tableData: []
    }
  },
  computed: {},
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.getTableData()
    },

    // 获取所有的A、CNAME记录
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getRecordTypeList({
          ...this.query,
          domain: this.query.domain || null,
          top: this.query.top || null,
          key: this.query.key || null
        })
        if (res.code !== 1) return
        console.log(res)
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
        this.currentRow = {}
      } finally {
        this.loading = false
      }
    },

    // 保存
    async doSave() {
      if (!this.currentRow.id) {
        this.$msg.error('请选择记录')
        return
      }
      this.btnLoading = true
      try {
        const {
          userId,
          domain,
          domainId,
          top,
          recordLineName,
          recordType,
          rdata
        } = this.currentRow
        const { data: res } = await doSaveGtmTask({
          userId,
          domainId,
          domain,
          taskTopTypeLine: `${top}#${recordType}#${recordLineName}`,

          taskId: 0,
          id: 0,
          taskType: 0,
          status: 1,
          // 间隔时间
          intervalTime: 120,
          // 分组ID
          pollIds: '',
          // 开始时间
          start: '',
          // 结束时间
          end: ''
        })
        if (res.code !== 1) return
        this.$msg.success('保存成功')
        this.$emit('refresh')
        this.dialogVisible = false
      } finally {
        this.btnLoading = false
      }
    },

    // 检索
    changeInput() {
      if (this.query.domain) {
        this.query.domain = this.query.domain.trim()
      }
      if (this.query.top) {
        this.query.top = this.query.top.trim()
      }
      this.query.page = 1
      this.getTableData()
    },

    // 点击
    onRowClick(row) {
      this.currentRow = row
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
    },

    // 表单重置
    closed() {
      this.currentRow = {}
      this.form = {
        ...defaultForm
      }
    }
  }
}
</script>
