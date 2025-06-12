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
      :text="selectValue || '请选择节点'"
      :loading="loading || $root.loading"
      class="align-middle"
    />

    <ants-input
      class="ants-search_input"
      style="width:100%;"
      placeholder="检索节点"
      clearable
      v-model="query.ip"
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
          prop="ip"
          label="节点"
          show-overflow-tooltip
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span>{{ antsT('节点') }}</span>
              <!-- <span>{{ selectArr.length }} / {{ total }}</span> -->
              <span>{{ total }}</span>
            </div>
          </template>
          <template #default="{ row }">
            <el-radio v-model="selectValue" :label="row.ip">
              <span>{{ row.ip }}</span>
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

  </el-popover>
</template>

<script>
import VirtualScroll from 'el-table-virtual-scroll'
import ElTableInfiniteScroll from 'el-table-infinite-scroll'
// API
import { getNodeList } from '@/v2/cdn_admin/api/cdn/node'

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
        ip: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: 50 // 当前每页显示多少条数据
      },
      total: 0,
      // 虚拟滚动的总数据
      allData: [],
      // 节点列表
      tableData: [],
      // 选择的节点数据
      selectArr: [],
      // 已经选择的节点
      selectValues: [],
      selectValue: ''
    }
  },
  computed: {
    buttonText() {
      let text = '选择节点'
      if (this.selectValues.length) {
        text = `已选择 ${this.selectValues.length} 个节点`
      }
      return text
    }
  },
  created() {
    this.toQuery()
  },
  methods: {
    // 加载更多
    async loadMore() {
      if (this.loading) return
      if (this.total != 0 && this.allData.length >= this.total) return
      this.loading = true
      try {
        this.query.page++
        const { data: res } = await getNodeList(this.query)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.total = obj.totalCount || 0
        const arr = (obj.list || []).map(item => {
          return {
            id: item.id,
            ip: item.clientIp
          }
        })
        if (this.query.page === 1) {
          this.allData = arr
          // 默认勾选第一个域名
          if (!arr.length) {
            return this.$msg.error('暂无节点')
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

    // 查询节点
    toQuery() {
      this.query.page = 0
      this.queryLoading = true
      this.$root.loading = true
      this.allData = []
      this.tableData = []
      this.loadMore()
    },

    rowClick(row) {
      if (this.selectValue === row.ip) return
      this.selectValue = row.ip
      this.$emit('change', {
        ids: [row.id],
        value: [row.ip]
      })
      this.hidePopover()
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
