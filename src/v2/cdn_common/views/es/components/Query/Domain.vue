<template>
  <el-popover
    placement="bottom-start"
    width="300"
    trigger="click"
    ref="popoverRef"
    popper-class="select-domain-popover"
  >
    <ants-button
      slot="reference"
      size="small"
      type="default"
      icon="el-icon-plus"
      :text="selectValue || '请选择域名'"
      :loading="loading || $root.loading"
      class="align-middle"
    />

    <ants-input
      class="ants-search_input"
      style="width:100%;"
      placeholder="检索域名"
      clearable
      v-model="query.mainServerName"
      size="small"
      @change="toQuery"
    >
      <el-button
        slot="append"
        icon="aicon icon-sousuo"
        :loading="loading"
        @click="toQuery"
      />
    </ants-input>

    <virtual-scroll
      :data="allData"
      :item-size="30"
      :dynamic="false"
      key-prop="id"
      @change="renderData => (tableData = renderData)"
    >
      <el-table
        style="margin-top:5px;"
        :data="tableData"
        size="mini"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        height="341px"
        row-key="id"
        @row-click="rowClick"
        v-loading="queryLoading"
        v-el-table-infinite-scroll="loadMore"
      >
        <el-empty
          slot="empty"
          description="暂无数据"
          style="transform: scale(0.8)"
        />
        <!-- <ants-table-column type="selection" align="center" width="45" /> -->
        <ants-table-column
          min-width="150"
          prop="domain"
          label="域名"
          show-overflow-tooltip
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span>{{ antsT('域名') }}</span>
              <!-- <span>{{ selectArr.length }} / {{ total }}</span> -->
              <span>{{ total }}</span>
            </div>
          </template>
          <template #default="{ row }">
            <el-radio v-model="selectValue" :label="row.domain">
              <span>{{ row.domain }}</span>
            </el-radio>
          </template>
        </ants-table-column>
        <div slot="append" class="py-xs" v-show="tableData.length > 10">
          <span v-if="allData.length >= total">{{ antsT('没有更多了') }}</span>
          <div v-else class="flex items-center justify-center text-primary">
            <span class="el-icon-loading"></span>
            <span class="ml-xs">{{ antsT('加载中') }}</span>
          </div>
        </div>
      </el-table>
    </virtual-scroll>
    <div style="height:5px;"></div>

    <!-- <div class="text-center">
      <el-pagination
        background
        layout="prev, pager, next"
        small
        :page-size="query.limit"
        :current-page="query.page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :total="total"
        :hide-on-single-page="total === 0"
        style="margin-top:5px;margin-left: -10px;"
      />
    </div>
    <div style="height:20px;"></div> -->
    <!-- <div class="absolute bottom-0 left-0 right-0 text-center pb-df">
      <ants-button size="mini" type="info" @click="hidePopover" text="取 消" />
      <ants-button size="mini" type="success" @click="submitAll" text="全 选" />
      <ants-button
        size="mini"
        type="primary"
        @click="submit"
        :text="`查 询(${selectArr.length})`"
      />
    </div> -->
  </el-popover>
</template>

<script>
import VirtualScroll from 'el-table-virtual-scroll'
import ElTableInfiniteScroll from 'el-table-infinite-scroll'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getSiteList } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  components: {
    VirtualScroll
  },
  directives: {
    ElTableInfiniteScroll
  },
  data() {
    return {
      loading: false,
      queryLoading: false,
      query: {
        user: '',
        group: 0,
        mainServerName: '', // 搜索框内容
        page: 0, // 当前的页数
        limit: 20 // 当前每页显示多少条数据
      },
      total: 0,
      // 虚拟滚动的总数据
      allData: [],
      // 域名列表
      tableData: [],
      // 选择的域名数据
      selectArr: [],
      // 已经选择的域名
      selectValues: [],
      selectValue: ''
    }
  },
  computed: {
    buttonText() {
      let text = '选择域名'
      if (this.selectValues.length) {
        text = `已选择 ${this.selectValues.length} 个域名`
      }
      return text
    }
  },
  created() {
    // 初始化的时候，勾选当前页全部域名，并查询图表数据
    // this.getTableData(true)
    this.toQuery()
  },
  methods: {
    rowClick(row) {
      if (this.selectValue === row.domain) return
      this.selectValue = row.domain
      this.$emit('change', {
        ids: [row.id],
        value: [row.domain]
      })
      this.hidePopover()
    },

    // 记载更多
    async loadMore() {
      if (this.loading) return
      if (this.total != 0 && this.allData.length >= this.total) return
      this.loading = true
      try {
        this.query.page++
        const { data: res } = await getSiteList(this.query)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.total = obj.totalCount || 0
        const arr = (obj.list || []).map(item => {
          return {
            id: item.id,
            domain: item.mainServerName
          }
        })
        if (this.query.page === 1) {
          this.allData = arr
          // 默认勾选第一个域名
          if (!arr.length) {
            return this.$msg.error('暂无域名')
          }
          this.rowClick(arr[0])
          return
        }
        this.allData.push(...arr)
      } finally {
        this.loading = false
        this.queryLoading = false
        this.$root.loading = false
      }
    },

    // 查询域名
    toQuery() {
      this.query.page = 0
      this.queryLoading = true
      this.$root.loading = true
      this.allData = []
      this.tableData = []
      this.loadMore()
    },

    // 获取域名列表
    async getTableData(init = false) {
      this.loading = true
      try {
        const { data: res } = await getSiteList(this.query)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.total = obj.totalCount || 0
        this.tableData = (obj.list || []).map(item => {
          return {
            id: item.id,
            domain: item.mainServerName
          }
        })
        // 初始化时，勾选当前页全部域名，并查询数据
        if (init) {
          if (!this.tableData.length) {
            return this.$msg.error('暂无域名')
          }
          this.rowClick(this.tableData[0])
          // this.submitAll()
        }
      } finally {
        this.loading = false
        this.$root.loading = false
      }
    },

    // 勾选表格
    handleSelectionChange(val) {
      this.selectArr = val
    },

    handleSizeChange(newSize) {
      this.query.limit = newSize
      this.getTableData()
    },

    handleCurrentChange(newPage) {
      this.query.page = newPage
      this.getTableData()
    },

    // 选择域名提交
    submit() {
      if (!this.selectArr.length) {
        this.$msg.error('请选择域名')
        return
      }
      const domains = this.selectArr.map(item => item.domain)
      const ids = this.selectArr.map(item => item.id)
      this.selectValues = domains
      this.$emit('change', {
        ids,
        value: domains
      })
      this.hidePopover()
    },

    // 全选
    submitAll() {
      // 查询表格全选的勾选状态
      const { isAllSelected } = this.$refs.tableRef.store.states
      if (!isAllSelected) {
        // 表格勾选全部
        this.$refs.tableRef.toggleAllSelection(true)
      }
      // 选择当前页全部域名
      this.selectArr = this.tableData
      this.submit()
    },

    // 隐藏弹窗
    hidePopover() {
      this.$refs.popoverRef.doClose()
    }
  }
}
</script>

<style lang="scss">
.select-domain-popover {
  .el-input-group__append {
    padding: 0 15px;
  }
  .el-table--mini .el-table__cell {
    padding: 3px 0;
  }
}
</style>
