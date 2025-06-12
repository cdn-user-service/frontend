<template>
  <el-card class="animated fadeIn content-box">
    <div class="flex items-center justify-between pb-df">
      <div>
        <ants-button
          type="success"
          size="small"
          text="刷新"
          :loading="loading"
          :disabled="btnLoading"
          icon="el-icon-refresh"
          @click="getTableData()"
        />

        <ants-button
          type="primary"
          size="small"
          :text="`添加${groupName}组`"
          icon="el-icon-plus"
          :loading="loading"
          :disabled="btnLoading"
          @click="
            toSave({
              taskId: query.taskId
            })
          "
        />

        <ants-button
          type="info"
          size="small"
          text="批量删除"
          :loading="btnLoading"
          :disabled="loading"
          icon="el-icon-delete"
          @click="toBulkDel()"
        />
      </div>

      <div>
        <el-input
          class="ants-search_input mr-sm"
          clearable
          placeholder="检索记录值"
          size="small"
          @change="toQuery()"
          v-model="query.rdata"
        >
          <i
            slot="prefix"
            class="el-input__icon aicon icon-sousuo"
            @click="toQuery()"
          ></i>
        </el-input>
      </div>
    </div>

    <el-table
      style="margin-top: 0"
      :data="tableData"
      v-loading="loading"
      size="small"
      ref="tableRef"
      row-key="id"
      max-height="600"
      :highlight-current-row="false"
      :tree-props="{
        children: 'children',
        hasChildren: 'hasChildren'
      }"
      @selection-change="handleSelectionChange"
      @select="handleSelect"
      @select-all="handleSelectAll"
      :row-class-name="rowClassName"
    >
      <el-empty slot="empty" />
      <!-- <el-table-column type="selection" width="45" align="center" /> -->

      <el-table-column width="45" align="center" type="">
        <template #header>
          <el-checkbox
            v-model="checkAll"
            @change="handleCheckAll"
            :indeterminate="
              selections.length > 0 && selections.length < allIds.length
            "
          >
            <i />
          </el-checkbox>
        </template>

        <template #default="{ row }">
          <el-checkbox-group
            v-model="selections"
            @change="(val) => handleCheck(val, row)"
          >
            <el-checkbox :label="row.id">
              <i />
            </el-checkbox>
          </el-checkbox-group>
        </template>
      </el-table-column>

      <ants-table-column min-width="80" prop="pollId" label="主/备">
        <template #default="{ row }">
          <el-tag size="mini" :type="row.top ? 'default' : 'info'">
            {{ row.top ? '主' : '备' }}
          </el-tag>
        </template>
      </ants-table-column>

      <ants-table-column min-width="100" label="主机记录">
        <template #default="{ row }">
          <span v-if="row.top">
            {{ taskData.top }}
          </span>
        </template>
      </ants-table-column>

      <ants-table-column min-width="140" label="域名">
        <template #default="{ row }">
          <span v-if="row.top">
            {{ taskData.domain }}
          </span>
        </template>
      </ants-table-column>
      <ants-table-column min-width="70" label="记录类型">
        <template #default="{ row }">
          <span v-if="row.top">
            {{ taskData.type }}
          </span>
        </template>
      </ants-table-column>

      <ants-table-column min-width="70" label="线路">
        <template #default="{ row }">
          <span v-if="row.top">
            {{ taskData.line }}
          </span>
        </template>
      </ants-table-column>

      <ants-table-column min-width="120" prop="rdata" label="记录值">
      </ants-table-column>

      <ants-table-column min-width="100" prop="count" label="IP数">
        <template #default="{ row }">
          <span v-if="row.top">
            {{ row.count }}
          </span>
        </template>
      </ants-table-column>

      <ants-table-column min-width="80" prop="status" label="状态">
        <template #default="{ row }">
          <span class="text-success" v-if="slaveLoading">
            <i class="el-icon-success"></i>
            在线
          </span>

          <template v-else>
            <span class="text-success" v-if="row.status">
              <i class="el-icon-success"></i>
              在线
            </span>

            <span class="text-error" v-else>
              <i class="el-icon-remove"></i>
              离线
            </span>
          </template>
        </template>
      </ants-table-column>

      <ants-table-column
        min-width="140"
        show-overflow-tooltip
        label="备注信息"
        prop="remark"
      >
        <template #default="{ row }">
          <span v-if="row.top">{{ row.remark || '-' }}</span>
        </template>
      </ants-table-column>

      <ants-table-column width="210" label="操作" align="right">
        <template #default="{ row }">
          <template v-if="row.top">
            <ants-button
              size="mini"
              type="primary"
              text="添加备IP"
              @click="toAddIps(row)"
            />
          </template>

          <template v-else>
            <el-button size="mini" type="info" disabled>
              {{ antsT('添加备IP') }}
            </el-button>
          </template>

          <ants-button
            size="mini"
            type="danger"
            text="删除"
            @click="toDel(row)"
          />
        </template>
      </ants-table-column>
    </el-table>

    <el-pagination
      class="ants-pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      small
      :page-sizes="[10, 20, 30, 40, 50, 100, 200]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-size="query.limit"
      :current-page="query.page"
    />

    <SaveDialog
      ref="SaveDialogRef"
      @refresh="getTableData"
      :groupName="groupName"
    />
  </el-card>
</template>

<script>
import SaveDialog from './SaveDialog.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
// const {
//   doDeleteIps,
//   getIpsPage,
//   getCallbackInfo,
//   getMonitorDetail
// } = require(`@/v2/${PROCESS_NAME}/api/dns/gtm`)

const taskTypeObj = {
  3: '定时轮询',
  4: '预设时间',
  2: '备用模式'
}

const taskTypeColor = {
  3: 'primary',
  4: 'success',
  2: 'info'
}

export default {
  components: {
    SaveDialog
  },
  data() {
    return {
      taskTypeObj,
      taskTypeColor,
      loading: false,
      btnLoading: false,

      pollObj: {},
      // 响应时间
      slaveObj: {},
      // 当前正在执行的目标，值为分组ID
      slaveRuning: null,
      slaveLoading: false,

      // 任务详情数据
      taskData: {
        type: 'A',
        top: 'www',
        domain: 'test.com',
        line: '默认'
      },
      query: {
        limit: 20,
        page: 1,
        taskId: this.$route.query.taskId,
        taskType: 3,
        rdata: ''
      },
      total: 0,
      tableData: [],
      // 勾选
      selectArr: [],

      // 自定义勾选
      checkAll: false,
      selections: [],
      // 所有的ID
      allIds: [],

      // 响应超时时间ms,用来判断是否在线，如果IP响应时间超过响应超时时间则判断为下线
      timeoutThreshold: 0
    }
  },
  computed: {
    // CNAME = 域名 | A，AAAA = IP
    groupName({ $route }) {
      const type = this.taskData.type || $route.query.type
      return type === 'CNAME' ? '域名' : 'IP'
    },
    onlineCount() {
      return (row) => {
        let online = 0
        row.allRdata.forEach((it) => {
          if (this.slaveObj[it]) {
            online++
          }
        })
        let className = 'text-warning'
        if (online === 0) {
          className = 'text-error'
        } else if (online === row.count) {
          className = 'text-success'
        }
        return `<span class="${className}">${online} / ${row.count}</span>`
      }
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 表格状态
    rowClassName({ row }) {
      if (row.top && row.pollId == this.slaveRuning) return 'gtm-slave-runing'
      return ''
    },

    // 获取表格数据
    async getTableData() {
      const mokeData = []
      for (let i = 0; i < 10; i++) {
        mokeData.push({
          id: i + 1,
          pollId: i + 1,
          top: true,
          remark: '备注信息',
          status: 1,
          count: 10,
          rdata: '23.3.3.3' + i,
          children: []
        })
        for (let j = 0; j < 10; j++) {
          mokeData[i].children.push({
            id: i + 1 + '_' + j,
            pollId: i + 1 + '_' + j,
            top: false,
            remark: '备注信息',
            status: 1,
            count: 10,
            rdata: '25.3.3.3' + i,
            children: []
          })
        }
      }
      this.tableData = mokeData
    },

    toQuery() {
      this.query.page = 1
      this.getTableData()
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    handleSelect(selection, row) {
      console.log(selection, row)
    },

    handleSelectAll(selection) {
      console.log('全选', selection)
      // 全部选中
    },

    // 全选
    handleCheckAll(val) {
      this.selections = val ? this.allIds : []
    },

    // 选择
    handleCheck(val = [], row = {}) {
      // 点击父，则勾选所有子
      if (row.top) {
        // 勾选
        if (this.selections.includes(row.id)) {
          this.selections = [...new Set([...this.selections, ...row.childIds])]
        } else {
          row.childIds.forEach((it) => {
            this.selections.splice(this.selections.indexOf(it), 1)
          })
        }
      }
    },

    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.query.limit = newSize
      this.getTableData()
    },

    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.query.page = newPage
      this.getTableData()
    },

    toSave(row = {}) {
      this.$refs.SaveDialogRef.show(row)
    },

    toAddIps(row) {
      this.$refs.SaveDialogRef.show(row)
    },

    // 批量删除
    async toBulkDel() {
      const result = await this.$batchDelete(this.selections.length, {
        tag: `${this.groupName}分组`
      })
      if (!result) return
      this.$msg.success('删除成功')
      //   this.btnLoading = true
      //   try {
      //     const { data: res } = await doDeleteIps({
      //       ids: this.selections + ''
      //     })
      //     this.btnLoading = false
      //     if (res.code !== 1) return
      //     this.$msg.success('删除成功')
      //     this.toQuery()
      //     this.selections = []
      //     this.checkAll = false
      //   } catch (error) {
      //     this.btnLoading = false
      //     throw error
      //   }
    },

    // 单个删除
    async toDel(row) {
      const result = await this.$doDelete({
        name: row.rdata,
        tag: '记录'
      })
      if (!result) return
      //   const { data: res } = await doDeleteIps({
      //     ids: row.id
      //   })
      //   if (res.code !== 1) return
      this.$msg.success('删除成功')
      //   this.toQuery()
    }
  }
}
</script>

<style lang="scss">
.gtm-slave-runing {
  // background-color: theme('colors.primary-light')!important;
  // color: theme('colors.primary')!important;
  background-color: #e6f7ec !important;
  color: theme('colors.success') !important;
  .el-table__cell {
    background-color: #e6f7ec !important;
  }
}
</style>
