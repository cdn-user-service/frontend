<template>
  <el-dropdown
    placement="bottom"
    trigger="click"
    class="max-w-full"
    ref="dropdownRef"
  >
    <ants-button
      size="small"
      icon="el-icon-plus"
      :loading="loading"
      :text="buttonText"
    />
    <el-dropdown-menu slot="dropdown">
      <li style="width:300px;height:500px;" class="px-df relative">
        <ants-input
          class="ants-search_input"
          style="width:100%;"
          placeholder="检索节点"
          clearable
          v-model="queryInfo.ip"
          size="small"
          @change="searchNode"
        >
          <el-button
            slot="append"
            icon="aicon icon-sousuo"
            @click="searchNode"
          ></el-button>

          <!-- <i
            slot="prefix"
            class="el-input__icon aicon icon-sousuo"
            @click="searchNode"
          ></i> -->
        </ants-input>

        <div class="mt-lg" v-loading="loading">
          <div
            class="flex items-center justify-between pb-sm border-b border-ants-border-4"
          >
            <ants-checkbox
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="changeCheckAll"
              text="全选"
            />
            <span class="text-sm">
              <strong>{{ checkNode.length }}</strong> /
              {{ total }}
            </span>
          </div>
          <div class="overflow-y-auto" style="max-height:340px;">
            <el-empty
              description="暂无数据"
              v-if="total == 0"
              style="transform: scale(0.8)"
            ></el-empty>
            <ants-checkbox-group
              v-else
              v-model="checkNode"
              @change="changeCheckNode"
            >
              <ants-checkbox
                v-for="item in nodeData"
                :label="item.clientIp"
                :key="item.id"
                class="block my-sm"
                :text="item.clientIp"
              />
            </ants-checkbox-group>
          </div>

          <div class="text-center">
            <el-pagination
              background
              layout="prev, pager, next"
              small
              :page-size="queryInfo.limit"
              :current-page="queryInfo.page"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :total="total"
              :hide-on-single-page="total === 0"
              style="margin-top:5px;margin-left: -10px;"
            />
          </div>
        </div>

        <div
          class="absolute bottom-0 left-0 right-0 
          text-center pt-sm border-t 
          bg-ants-bg-1 border-ants-border-4"
        >
          <ants-button
            size="small"
            type="info"
            @click="hideDropdown"
            text="取 消"
          />
          <ants-button
            size="small"
            type="primary"
            @click="querySubmit"
            :loading="loading"
            text="查 询"
          />
        </div>
      </li>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
import { getNodeList } from '@/v2/cdn_admin/api/cdn/node'

export default {
  data() {
    return {
      loading: false,
      // 总共多少条
      total: 0,
      // 当前有多少条
      nowPageTotal: 0,
      queryInfo: {
        ip: '',
        page: 1,
        limit: 10
      },
      // 是否全选
      checkAll: false,
      // 是否半选
      isIndeterminate: false,
      // 列表数据
      nodeData: [],
      // 选中节点
      checkNode: [],
      // 选中全部节点
      nodeAllArr: []
    }
  },
  computed: {
    buttonText() {
      let txt = '请选择节点'
      const checkSum = this.checkNode.length
      if (checkSum === 0) {
        txt = '请选择节点'
      }
      if (checkSum > 0) {
        txt = `已选择 ${checkSum} / ${this.total} 个节点`
      }
      // if (checkSum === this.total) {
      //   txt = '全部节点'
      // }
      return txt
    }
  },
  created() {},
  mounted() {
    this.getNodeData(true)
  },
  methods: {
    // 点击全选
    changeCheckAll(checked) {
      this.checkNode = checked ? this.nodeAllArr : []
      this.isIndeterminate = false
    },

    // 勾选
    changeCheckNode(val) {
      const checkedCount = val.length
      this.checkAll = checkedCount === this.nowPageTotal
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.nowPageTotal
    },

    /**
     * @description: 分页获取节点列表数据
     */

    async getNodeData(isGetChart = false) {
      this.loading = true
      const { data: res } = await getNodeList(this.queryInfo)
      this.loading = false
      if (res.code !== 1) return
      if (!res.data) return
      this.nodeData = res.data.list || []
      this.total = res.data.totalCount
      this.nowPageTotal = this.nodeData.length

      this.nodeAllArr = this.nodeData.map(item => item.clientIp)

      // 赋值给默认全选
      if (isGetChart && this.nodeData.length > 0) {
        // 默认选中当前页的全部节点
        this.checkNode = this.nodeAllArr
        this.checkAll = true
        // 如果有节点则查询所有节点
        this.$listeners.getChart()
      }
    },

    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getNodeData()
    },

    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      // this.checkAll = false
      // 获取数据，并自动查询数据
      this.getNodeData(true)
    },

    // 检索节点
    async searchNode() {
      this.queryInfo.page = 1
      this.nodeAllArr = []
      this.checkNode = []
      this.checkAll = false
      this.getNodeData()
    },

    /**
     * @description: 点击查询
     */

    querySubmit() {
      if (!this.checkNode.length) return this.$msg.error('请选择节点')
      this.hideDropdown()
      this.$listeners.getChart()
    },

    // 隐藏 dropdown
    hideDropdown() {
      this.$refs.dropdownRef.hide()
    }
  }
}
</script>

<style lang="scss">
.el-input-group__append {
  padding: 0 15px;
}
</style>
