<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="
          isAdmin
            ? [
                {
                  name: '检索域名',
                  key: 'serverName',
                  value: queryInfo.serverName
                },
                {
                  name: '检索用户',
                  key: 'user',
                  value: queryInfo.user
                }
              ]
            : [
                {
                  name: '检索域名',
                  key: 'serverName',
                  value: queryInfo.serverName
                }
              ]
        "
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons" v-if="!$root.disabledCrud">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            :disabled="$root.loading"
            @click="showCreateUpdateDialog()"
            text="添加URL转发"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="batchDelete()"
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
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>

        <ants-table-column width="60" prop="id" label="ID"> </ants-table-column>
        <ants-table-column prop="serverName" label="绑定域名" width="170">
          <template #default="{ row }">
            <ants-copy :text="row.serverName" />
            <!-- <div>
                <span>ssl：</span>
                <span v-if="!row.notAfter" class="text-warning"> 未配置</span>
                <span v-else>{{ row.notAfter }}</span>
            </div> -->
          </template>
        </ants-table-column>

        <ants-table-column prop="rewriteType" label="转发方式" width="110">
          <template #default="{ row }">
            <el-tag type="primary" size="mini">{{
              row.rewriteType === 1 ? 'REWRITE转发' : 'JS转发'
            }}</el-tag>
          </template>
        </ants-table-column>
        <ants-table-column prop="target" label="跳转地址" min-width="150">
          <template #default="{ row }">
            <div v-if="row.rewriteType === 1">
              <ants-copy :text="`${row.scheme}://${row.target}`" />
            </div>
          </template>
        </ants-table-column>
        <ants-table-column prop="followMode" label="参数设置" min-width="100">
          <template #default="{ row }">
            <div v-if="row.rewriteType === 1">
              <el-tag
                size="mini"
                type="success"
                v-if="row.followMode === 'follow'"
              >
                跟随URL
              </el-tag>
              <el-tag
                size="mini"
                type="warning"
                v-else-if="row.followMode === 'assign'"
              >
                指定URL
              </el-tag>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column prop="rewriteMode" label="跳转方式" min-width="80">
          <template #default="{ row }">
            <div v-if="row.rewriteType === 1">
              <el-tag size="mini">
                {{ row.rewriteMode }}
              </el-tag>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="CNAME" min-width="150">
          <template #default="{ row }">
            <ants-copy :text="(row.cname || '').split(',')[0] || '-'" />
          </template>
        </ants-table-column>

        <!-- <ants-table-column prop="alias" label="别名" min-width="80">
          <template #default="{ row }">
            <el-tag size="small">
              {{row.aliasLs && row.aliasLs.length}}
            </el-tag>
          </template>
        </ants-table-column> -->

        <!-- <ants-table-column label="跳转协议" min-width="80">
          <template #default="{ row }">
            <el-tag size="small">
              {{ row.scheme === '$scheme' ? antsT('协议跟随') : row.scheme }}
            </el-tag>
          </template>
        </ants-table-column> -->

        <ants-table-column prop="remark" label="备注" min-width="120">
        </ants-table-column>

        <ants-table-column prop="serialNumber" label="绑定套餐" min-width="140">
          <template #default="{ row }">
            <div>
              {{ row.plan.name }}
            </div>
            <div>{{ row.plan.endTime }}</div>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="userId"
          label="用户"
          min-width="140"
          v-if="isAdmin"
        >
          <template #default="{ row }">
            <div>ID：{{ row.userId }}</div>
            <ants-copy :text="row.username" />
          </template>
        </ants-table-column>

        <ants-table-column
          prop="gropuInfo"
          label="节点分组"
          min-width="100"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{
              (
                (((row.suitObj || {}).product || {}).client_group_list ||
                  [])[0] || {}
              ).areaName
            }}</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="启用" min-width="60">
          <template #default="{ row, $index }">
            <ants-table-switch
              :disabled="$root.disabledCrud"
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="150" v-if="!$root.disabledCrud">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加修改对话框 -->
    <CreateUpdateDialog ref="CreateUpdateDialogRef" />
  </div>
</template>

<script>
import CreateUpdateDialog from './FormDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME
// API
const {
  getRewriteList,
  doSaveRewrite,
  doDeleteRewrite
} = require(`@/v2/${PROCESS_NAME}/api/cdn/url-forwarding`)

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      btnLoading: false,
      total: 0,
      queryInfo: {
        user: '',
        serverName: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getRewriteList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return

      const obj = res.page || {}
      let arr = []
      if (typeof obj.list === 'object') {
        arr = obj.list.map(item => {
          const suitObj = item.suitObj || {}
          const planObj = {
            name: suitObj.productEntity && suitObj.productEntity.name,
            endTime: suitObj.endTime
          }
          return {
            ...item,
            username: item.user && item.user.username,
            plan: planObj,
            cname: suitObj.cname && suitObj.cname.replace('*', item.serverName)
          }
        })
      }

      this.tableData = arr
      this.total = obj.totalCount
    },

    // 勾选
    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 添加修改
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 启动禁用
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用URL转发',
          content: '此操作将禁用该URL转发，是否继续？'
        })
        if (!result) {
          row.status = 1
          return
        }
      }

      this.$refs[switchRef].loading = true
      const { data: res } = await doSaveRewrite(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }

      this.$msg.success('操作成功')
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete(row) {
      const result = await this.$doDelete({
        tag: 'URL转发'
      })
      if (!result) return
      this.btnLoading = true

      const { data: res } = await doDeleteRewrite({
        ids: row.id
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: 'URL转发'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map((item, index) => {
        return item.id
      })
      const { data: res } = await doDeleteRewrite({
        ids: idsArr + ''
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(selectLength + this.antsT('个URL转发已成功删除'))
      this.selectArr = [] // 释放
    }
  }
}
</script>
