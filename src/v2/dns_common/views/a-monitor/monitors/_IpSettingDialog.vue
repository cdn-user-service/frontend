<template>
  <ants-dialog
    v-model="dialogVisible"
    width="800px"
    ref="dialogRef"
    @closed="closed"
    title="管理备用IP"
    @submit="doSave"
    top="5vh"
    submitBtnText="保 存"
  >
    <div class="flex items-center justify-between -mt-sm">
      <div>
        <ants-button
          size="small"
          type="primary"
          text="设为主用"
          @click="setMode(1)"
        />
        <ants-button
          size="small"
          type="primary"
          text="设为备用"
          @click="setMode(2)"
        />
        <ants-button
          size="small"
          type="info"
          text="取消设置"
          @click="setMode(3)"
        />
      </div>

      <ants-input
        class="ants-search_input"
        placeholder="检索记录值"
        clearable
        v-model="query.rdata"
        size="small"
        @change="toQuery"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
          @click="toQuery"
        />
      </ants-input>
    </div>

    <virtual-scroll
      class="border-ants-border-3 border mt-df"
      :data="allTableData"
      :item-size="30"
      :dynamic="false"
      key-prop="id"
      @change="(renderData) => (tableData = renderData)"
    >
      <el-table
        style="margin-top: 0"
        :data="tableData"
        size="mini"
        ref="tableRef"
        @selection-change="handleSelectionChange"
        height="341px"
        row-key="id"
        v-loading="loading"
      >
        <el-empty
          slot="empty"
          description="暂无数据"
          style="transform: scale(0.8)"
        />
        <ants-table-column type="selection" align="center" width="45" />

        <ants-table-column width="80" prop="rdata" label="主/备">
          <template #default="{ row }">
            <span v-if="!row.mode">-</span>
            <el-tag
              v-else
              size="mini"
              :type="row.mode === 1 ? 'default' : 'info'"
            >
              {{ row.mode === 1 ? '主' : '备' }}
            </el-tag>
          </template>
        </ants-table-column>

        <ants-table-column min-width="100" prop="top" label="主机记录">
        </ants-table-column>

        <ants-table-column min-width="100" prop="recordType" label="记录类型">
        </ants-table-column>

        <ants-table-column
          min-width="100"
          prop="recordLineName"
          label="线路类型"
        >
        </ants-table-column>

        <ants-table-column min-width="200" prop="rdata" label="记录值">
        </ants-table-column>
      </el-table>
    </virtual-scroll>
  </ants-dialog>
</template>

<script>
import VirtualScroll from 'el-table-virtual-scroll'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getDomainOrRecordList
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

export default {
  components: {
    VirtualScroll
  },

  data() {
    return {
      dialogVisible: false,
      loading: false,

      query: {
        rdata: ''
      },

      sourceData: [],
      tableData: [],
      // 选择的域名数据
      selectArr: [],

      // 默认记录列表
      defaultList: [],
      // 备用记录列表
      otherList: [],
      domain: null,
      userId: null
    }
  },
  computed: {
    allTableData() {
      // 排序，默认的放在前面
      const defaultData = []
      const otherListData = []
      const oldListData = []
      this.sourceData.forEach((item) => {
        if (this.defaultList.includes(item.id)) {
          item.mode = 1
          defaultData.push(item)
          return
        }
        if (this.otherList.includes(item.id)) {
          item.mode = 2
          otherListData.push(item)
          return
        }
        item.mode = null
        oldListData.push(item)
      })
      return [...defaultData, ...otherListData, ...oldListData]
    }
  },
  created() {},
  methods: {
    /**
     * 对话框显示
     * @param {*} defaultList 默认记录
     * @param {*} otherList 备用记录
     * @param {*} domain 域名
     * @param {*} userId 备用记录
     */
    show({ defaultList = [], otherList = [], domain = '', userId = '' }) {
      this.dialogVisible = true

      this.defaultList = defaultList.map((it) => it.id)
      this.otherList = otherList.map((it) => it.id)

      // 如果查询过数据就不再查询
      if (this.domain) return
      this.domain = domain
      this.userId = userId
      this.getTableData()
    },

    toQuery() {},

    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getDomainOrRecordList({
          limit: 500,
          page: 1,
          // 查询域名
          domain: this.domain,
          // 0 = 查询域名列表 | 1 = 查询记录
          type: 1,
          // 后台需要传递用户ID
          userId: this.userId,
          username: ''
        })
        if (res.code !== 1) return
        this.sourceData = res.data || []
      } finally {
        this.loading = false
      }
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 批量设置
    async setMode(mode = 1) {
      if (!this.selectArr.length) {
        return this.$msg.info('请勾选需要操作的数据')
      }

      const ids = this.selectArr.map((it) => it.id)

      // 取消设置
      if (mode === 3) {
        const defaultIds = []
        const otherIds = []
        ids.forEach((id) => {
          if (this.defaultList.includes(id)) {
            defaultIds.push(id)
            return
          }
          if (this.otherList.includes(id)) {
            otherIds.push(id)
          }
        })

        this.defaultList = this.defaultList.filter(
          (id) => !defaultIds.includes(id)
        )
        this.otherList = this.otherList.filter((id) => !otherIds.includes(id))
      }

      // 设为主用
      if (mode === 1) {
        this.defaultList = ids
        // 清除原来的 otherList
        this.otherList = this.otherList.filter((id) => !ids.includes(id))
      }

      // 设为备用
      if (mode === 2) {
        this.otherList = ids
        // 清除原来的 defaultList
        this.defaultList = this.defaultList.filter((id) => !ids.includes(id))
      }

      console.log('----', this.defaultList, this.otherList)

      this.selectArr = []
      this.$msg.success(mode === 3 ? '取消设置成功' : '设置成功')
    },

    // 保存
    doSave() {
      const defaultList = []
      const otherList = []
      this.allTableData.forEach((item) => {
        // 主用
        if (item.mode === 1) {
          defaultList.push(item)
        }

        // 备用
        if (item.mode === 2) {
          otherList.push(item)
        }
      })

      this.$emit('updateSelfDefine', {
        defaultList,
        otherList
      })

      this.$msg.success('保存成功')
      this.dialogVisible = false
    },

    // 表单重置
    closed() {}
  }
}
</script>
