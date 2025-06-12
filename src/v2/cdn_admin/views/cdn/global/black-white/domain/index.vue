<template>
  <div class="animated fadeIn">
    <table-query-form
      :search-arr="[
        {
          name: '检索域名',
          key: 'host',
          value: queryInfo.host
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          :disabled="$root.loading"
          :text="`添加${activeTitle}`"
          @click="showCreateDialog()"
        />
        <ants-button
          type="info"
          size="small"
          icon="el-icon-delete"
          :disabled="$root.loading"
          :loading="btnLoading"
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
        width="45"
        align="center"
      ></ants-table-column>

      <ants-table-column prop="host" label="域名" min-width="140">
      </ants-table-column>
      <ants-table-column label="类型" prop="type" min-width="100">
        <template>
          <el-tag size="mini" type="success" v-if="keyStr == 'white_host'"
            >白名单</el-tag
          >
          <el-tag size="mini" type="info" v-else>黑名单</el-tag>
        </template>
      </ants-table-column>

      <ants-table-column
        label="备注信息"
        prop="remark"
        min-width="140"
      ></ants-table-column>

      <ants-table-column prop="updateTime" label="更新时间" min-width="140">
      </ants-table-column>

      <ants-table-column label="操作" width="150" auto-fixed>
        <template #default="{ row }">
          <ants-button
            size="mini"
            type="primary"
            :disabled="btnLoading"
            @click="showUpdateDialog(row)"
            text="修改"
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

    <!-- 添加域名对话框 -->
    <CreateDialog
      ref="CreateDialogRef"
      :active-title="activeTitle"
      :key-str="keyStr"
    />

    <!-- 修改域名对话框 -->
    <UpdateDialog
      ref="UpdateDialogRef"
      :active-title="activeTitle"
      :key-str="keyStr"
    />
  </div>
</template>

<script> 
import CreateDialog from './components/CreateDialog'
import UpdateDialog from './components/UpdateDialog'

import mixins from '../../mixins'

export default {
  components: {
    CreateDialog,
    UpdateDialog
  },
  mixins: [mixins],
  props: {
  },
  data() {
    return {
    // 标识， [m_text]
      keyStr: this.$route.query.type || 'white_host',

      total: 0,
      queryInfo: {
        host: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: []
    }
  },
  computed: {
    activeTitle({ $route }) {
      return $route.query.type === 'white_host' ? '白名单' : '黑名单'
    }
  },
  watch: {
    '$route.query.type': function(newVal, oldVal) {
      this.keyStr = newVal || 'white_host'
      this.queryInfo.host = ''
      this.queryInfo.page = 1
      this.total = 0
      this.tableData = []
      this.getTableData()
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      const { data: res } = await this.getGlobalKeyDetail(this.keyStr)
      if (!res) return
      const arr = res.map(item => {
        const obj = JSON.parse(item.pvalue)
        return {
          ...item,
          ...obj
        }
      })
      this.tableData = arr.reverse()
      this.total = arr.length
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 点击添加
     */

    showCreateDialog() {
      this.$refs.CreateDialogRef.showDialog()
    },

    /**
     * @description: 点击修改
     * @param {*} row
     */

    showUpdateDialog(row = {}) {
      this.$refs.UpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const idsArr = this.selectArr.map(e => {
        return e.id
      })

      const data = await this.deleteGlobalAttr(
        idsArr + '',
        '域名',
        this.selectArr.length
      )
      if (!data) return
      this.getTableData()
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除产品参数
     * @param {*} row
     */

    async singleDelete({ id }) {
      const data = await this.deleteGlobalAttr(id, '域名')
      if (!data) return
      this.getTableData()
    }
  }
}
</script>
