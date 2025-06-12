<template>
  <el-popover
    placement="bottom-start"
    width="350"
    trigger="click"
    ref="popoverRef"
    popper-class="select-node-popover"
  >
    <ants-button
      slot="reference"
      size="small"
      type="default"
      icon="el-icon-plus"
      :text="buttonText"
      :loading="loading || $root.loading"
    />

    <ants-input
      class="ants-search_input"
      style="width: 100%"
      placeholder="检索节点"
      clearable
      v-model="query.key"
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

    <el-table
      style="margin-top: 5px"
      :data="nodeList"
      size="mini"
      ref="tableRef"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      height="341px"
      row-key="id"
    >
      <el-empty
        slot="empty"
        description="暂无数据"
        style="transform: scale(0.8)"
      />
      <ants-table-column type="selection" align="center" width="45" />
      <ants-table-column
        min-width="140"
        prop="ip"
        label="节点IP"
      ></ants-table-column>
    </el-table>

    <div class="text-center">
      <el-pagination
        background
        layout="total,sizes, prev, pager, next"
        small
        :page-size="query.limit"
        :current-page="query.page"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :total="total"
        :hide-on-single-page="total === 0"
        style="margin-top: 5px; margin-left: -10px"
        :page-sizes="[10, 20, 50, 100, 500, 1000]"
        pager-count="5"
      />
    </div>
    <div style="height: 40px"></div>
    <div class="absolute bottom-0 left-0 right-0 text-center pb-df">
      <ants-button size="mini" type="info" @click="hidePopover" text="取 消" />
      <ants-button size="mini" type="success" @click="submitAll" text="全 选" />
      <ants-button
        size="mini"
        type="primary"
        @click="submit"
        :text="`查 询(${selectArr.length})`"
      />
    </div>
  </el-popover>
</template>

<script>
// API
import { getServerList } from '@/v2/dns_admin/api/dns/serve'

export default {
  data() {
    return {
      loading: false,
      query: {
        key: '', // 搜索框内容
        groupId: '', // 分组ID
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        page: 1, // 当前的页数
        limit: 20 // 当前每页显示多少条数据
      },
      total: 0,
      // 节点列表
      nodeList: [],
      // 选择的节点数据
      selectArr: [],
      // 已经选择的节点IP
      selectNodes: []
    }
  },
  computed: {
    buttonText() {
      let text = '选择节点'
      if (this.selectNodes.length) {
        text = `已选择 ${this.selectNodes.length} 个节点`
      }
      return text
    }
  },
  created() {
    this.$root.loading = true
    // 初始化的时候，勾选当前页全部节点，并查询图表数据
    this.getNodeList(true)
  },
  methods: {
    // 获取节点列表
    async getNodeList(init = false) {
      this.loading = true
      try {
        const { data: res } = await getServerList(this.query)
        this.loading = false
        this.$root.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        this.total = obj.totalCount || 0
        this.nodeList = obj.list || []
        // 初始化时，勾选当前页全部节点，并查询数据
        if (init) {
          if (!this.nodeList.length) {
            return this.$msg.error('暂无节点')
          }
          this.submitAll()
        }
      } catch (error) {
        this.loading = false
        this.$root.loading = false
        throw error
      }
    },

    // 勾选表格
    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 查询节点
    toQuery() {
      this.query.page = 1
      this.getNodeList()
    },

    handleSizeChange(newSize) {
      this.query.limit = newSize
      this.getNodeList()
    },

    handleCurrentChange(newPage) {
      this.query.page = newPage
      this.getNodeList()
    },

    // 选择节点提交
    submit() {
      if (!this.selectArr.length) {
        this.$msg.error('请选择节点')
        return
      }
      const ips = this.selectArr.map((item) => item.ip)
      this.selectNodes = ips
      this.$emit('submit', ips)
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
      // 选择当前页全部节点
      this.selectArr = this.nodeList
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
.select-node-popover {
  .el-input-group__append {
    padding: 0 15px;
  }
  .el-table--mini .el-table__cell {
    padding: 3px 0;
  }
}
</style>
