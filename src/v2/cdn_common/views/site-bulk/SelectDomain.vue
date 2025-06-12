<template>
  <el-popover
    placement="bottom-start"
    width="320"
    trigger="click"
    ref="popoverRef"
    popper-class="select-domain-popover"
  >
    <ants-button
      slot="reference"
      :size="size"
      type="default"
      icon="el-icon-plus"
      :text="buttonText"
      :loading="loading"
      class="align-middle"
      :style="{ width: width }"
    />

    <div class="flex justify-between items-center">
      <ants-select
        v-model="query.groupId"
        size="small"
        placeholder="选择分组"
        :loading="groupLoading"
        @change="toQuery()"
      >
        <ants-option label="全部分组" value=" " />
        <ants-option
          v-for="item in groupList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </ants-select>

      <div class="ml-3">
        <ants-input
          style="width: 100%"
          class="ants-search_input"
          placeholder="检索用户"
          :clearable="false"
          v-model="query.user"
          size="small"
          @change="toQuery()"
        >
          <i
            slot="suffix"
            class="el-input__icon aicon icon-sousuo"
            @click="toQuery()"
          />
        </ants-input>
      </div>

      <!-- <ants-select
        v-if="isAdmin"
        v-model="query.user"
        size="small"
        placeholder="选择用户"
        :loading="userLoading"
        class="ml-sm"
      >
        <ants-option label="全部用户" value=" " />
        <ants-option
          v-for="item in userList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </ants-select> -->
    </div>

    <div class="pt-sm">
      <ants-input
        style="width: 100%"
        class="ants-search_input"
        placeholder="检索域名"
        :clearable="false"
        v-model.trim="query.mainServerName"
        size="small"
        @change="toQuery()"
      >
        <i
          slot="suffix"
          class="el-input__icon aicon icon-sousuo"
          @click="toQuery()"
        />
        <!-- <el-button
        slot="append"
        icon="aicon icon-sousuo"
        :disabled="loading"
        @click="toQuery()"
      /> -->
      </ants-input>
    </div>

    <virtual-scroll
      ref="virtualScrollRef"
      :data="allData"
      :item-size="30"
      :dynamic="false"
      key-prop="id"
      @change="(renderData) => (tableData = renderData)"
      @selection-change="handleSelectionChange"
    >
      <el-table
        style="margin-top: 10px"
        :data="tableData"
        size="mini"
        :border="false"
        ref="tableRef"
        highlight-selection-row
        height="360px"
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
        <virtual-column
          v-if="multiple"
          type="selection"
          align="center"
          width="45"
        />

        <virtual-column
          min-width="150"
          prop="domain"
          :label="antsT('域名')"
          show-overflow-tooltip
          class-name="cursor-pointer"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span>{{ antsT('域名') }}</span>
              <span>
                <span v-if="multiple">
                  {{ (selectValue || []).length }}
                  /</span
                >
                {{ total }}
              </span>
            </div>
          </template>

          <template #default="{ row }" v-if="!multiple">
            <el-radio v-model="selectValue" :label="row[valueKeyStr]">
              <span>{{ row.domain }}</span>
            </el-radio>
          </template>
        </virtual-column>

        <div
          slot="append"
          class="pb-xs text-center"
          :class="multiple ? 'pt-10' : 'pt-xs'"
          v-show="tableData.length > 10"
        >
          <span v-if="allData.length >= total" class="text-ants-text-4">{{
            antsT('没有更多了')
          }}</span>

          <div v-else class="flex items-center justify-center text-primary">
            <span class="el-icon-loading"></span>
            <span class="ml-xs">{{ antsT('加载中') }}</span>
          </div>
        </div>
      </el-table>
    </virtual-scroll>

    <template v-if="multiple && footer">
      <div style="height: 45px"></div>
      <div class="absolute bottom-0 left-0 right-0 text-center pb-df">
        <ants-button
          size="mini"
          type="info"
          @click="hidePopover()"
          text="取 消"
        />
        <!-- <ants-button size="mini" type="success" :disabled="loading" @click="submitAll()" text="全 选" /> -->
        <ants-button
          size="mini"
          type="primary"
          @click="submit()"
          :disabled="loading"
          :text="`选 择(${(selectValue || []).length})`"
        />
      </div>
    </template>
  </el-popover>
</template>

<script>
import VirtualScroll, { VirtualColumn } from 'el-table-virtual-scroll'
import ElTableInfiniteScroll from 'el-table-infinite-scroll'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getSiteList,
  getDomainGroupList
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  components: {
    VirtualScroll,
    VirtualColumn
  },
  directives: {
    ElTableInfiniteScroll
  },
  props: {
    // 双向绑定的值
    value: {
      type: [String, Number, Array]
    },
    // 所绑定的键 id | domain
    valueKey: {
      type: String,
      default: 'domain'
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 显示隐藏下方提交按钮
    footer: Boolean,
    width: String,
    size: {
      type: String,
      default: 'small'
    }
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      loading: false,
      queryLoading: false,
      query: {
        simpleFlag: 1,
        groupId: ' ',
        user: '',
        mainServerName: '', // 搜索框内容
        page: 0, // 当前的页数
        limit: 200 // 当前每页显示多少条数据
      },
      total: 0,
      // 虚拟滚动的总数据
      allData: [],
      // 域名列表
      tableData: [],
      // 勾选的数据，单选 = string | 多选 = [{}, {}]
      selectValue: null,
      // 用于回显: { id: domain }
      domainMap: {},

      groupLoading: false,
      groupList: [],

      userLoading: false,
      userList: []
    }
  },
  watch: {
    // 监听选择的值变化，更新双向绑定的值
    selectValue: {
      handler(val) {
        const newVal = this.buildValue(val)
        // 更新双向绑定的值
        this.$emit('input', newVal)
        // 暴露 select-change 方法
        this.$emit('select-change', newVal)
      },
      deep: true
    }
  },
  computed: {
    // 绑定的key
    valueKeyStr() {
      return this.valueKey === 'id' ? 'id' : 'domain'
    },

    // 显示的文字
    buttonText() {
      let text = ''
      if (this.multiple) {
        const len = (this.selectValue || []).length
        if (len) text = `已选择 ${len} 个域名`
      } else {
        text =
          this.valueKeyStr === 'id'
            ? this.domainMap[this.selectValue]
            : this.selectValue
      }
      return text || '请选择域名'
    }
  },
  created() {
    this.getGroupList()
    this.toQuery()
  },
  methods: {
    // 获取分组列表
    async getGroupList() {
      this.groupLoading = true
      try {
        const { data: res } = await getDomainGroupList({
          name: '',
          page: 1,
          limit: 50
        })
        if (res.code !== 1) return
        console.log(res)
        this.groupList = (res.data || {}).list || []
      } finally {
        this.groupLoading = false
      }
    },

    // 构造绑定的值
    buildValue(val) {
      if (!this.multiple) return val
      return val instanceof Array ? val.map((it) => it[this.valueKeyStr]) : []
    },

    // 点击表格行
    rowClick(row) {
      if (this.multiple) {
        // 切换勾选状态
        this.$refs.virtualScrollRef.toggleRowSelection(row)
      } else {
        if (this.selectValue === row[this.valueKeyStr]) return
        this.selectValue = row[this.valueKeyStr]
        // 提交
        this.handleChange()
      }
    },

    // 暴露change事件
    handleChange() {
      this.$emit('change', this.buildValue(this.selectValue))
      // 隐藏Popover
      this.hidePopover()
    },

    // 加载更多
    async loadMore() {
      if (this.loading) return
      if (this.total != 0 && this.allData.length >= this.total) return
      this.loading = true
      try {
        this.query.page++
        const { groupId } = this.query
        const { data: res } = await getSiteList({
          ...this.query,
          // 客户端：查询域名分组
          group_id: this.isAdmin ? null : groupId,
          // 管理端：查询节点分组
          groupId: this.isAdmin ? groupId : null
        })
        if (res.code !== 1) return

        const obj = res.data || {}
        this.total = obj.totalCount || 0
        const arr = (obj.list || []).map(({ id, mainServerName: domain }) => {
          this.domainMap[id] = domain
          return {
            id,
            domain
          }
        })

        if (this.query.page === 1) {
          this.allData = arr
          if (!arr.length) return
          // 默认勾选第一个域名
          // this.rowClick(arr[0])
        } else {
          this.allData.push(...arr)
        }
      } finally {
        this.loading = false
        this.queryLoading = false
      }
    },

    // 勾选表格
    handleSelectionChange(val) {
      this.selectValue = val
    },

    // 查询域名
    toQuery() {
      this.query.page = 0
      this.queryLoading = true
      this.allData = []
      this.tableData = []
      this.selectValue = null
      this.loadMore()
    },

    // 多选提交
    submit() {
      if (!(this.selectValue || []).length) {
        this.$msg.error('请选择域名')
        return
      }
      this.handleChange()
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
      this.selectValue = [...this.tableData]
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

  .el-input__validateIcon {
    display: none;
  }
}
</style>
