<template>
  <div>
    <ants-form-card>
      <template slot="title">
        {{ antsT('DNS解析') }}
      </template>
      <template slot="info">
        {{ antsT('设置当前域名的DNS解析') }}
      </template>
      <template slot="content">
        <div class="mb-df flex justify-between">
          <div>
            <ants-button
              v-if="!$root.disabledCrud"
              size="mini"
              type="primary"
              icon="el-icon-plus"
              :disabled="$root.loading"
              @click="showCreateUpdateDialog({}, 'create')"
              text="添加解析记录"
            />
            <el-divider direction="vertical"></el-divider>
            <!-- <strong>{{ (cname || '').split(',')[0] || '-' }}</strong> -->
            <ants-select
              v-model="dnsApiId"
              placeholder="请选择DNS API"
              size="mini"
              clearable
              style="width: 200px"
              @change="changeDnsApiId"
            >
              <ants-option
                v-for="item in dnsApiData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ants-select>
          </div>
          <div>
            <!-- <ants-input
              v-model="form.top"
              placeholder="检索主机记录"
              size="mini"
              clearable
              style="width: 200px"
              v-if="total"
            /> -->
          </div>
        </div>

        <el-table
          :data="paginatedTableData"
          v-loading="$root.dnsLoading"
          border
          max-height="300"
        >
          <ants-table-column
            min-width="140"
            prop="recordId"
            label="记录ID"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="140"
            prop="top"
            label="主机记录"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="100"
            prop="recordType"
            label="记录类型"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="100"
            prop="line"
            label="线路"
            align="center"
          >
            <template #default="{ row }">
              {{ lineList[row.line] }}
            </template>
          </ants-table-column>
          <ants-table-column
            min-width="140"
            prop="value"
            label="记录值"
            align="center"
          >
          </ants-table-column>
          <ants-table-column
            min-width="100"
            prop="ttl"
            label="TTL"
            align="center"
          >
          </ants-table-column>

          <ants-table-column
            prop="domain"
            label="操作"
            width="160"
            align="center"
            v-if="!$root.disabledCrud"
          >
            <template #default="{ row }">
              <ants-button
                size="mini"
                type="primary"
                @click="showCreateUpdateDialog(row, 'update')"
                text="编辑"
              />
              <ants-button
                size="mini"
                type="danger"
                @click="deleteSingle(row)"
                text="删除"
              />
            </template>
          </ants-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-if="total"
        >
        </el-pagination>
      </template>
    </ants-form-card>

    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
      :cname="cname"
      :dns-config-id="dnsApiId"
      :ips-arr="ipsArr"
      :line-list="lineList"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'
import { getDnsApiData } from '@/global/certificateType'

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      dnsApiId: '',
      dnsApiData: [],

      form: {
        // 主机记录,
        top: ''
      },
      cname: '',
      dnsConfigId: '',
      ipsArr: [],

      // 线路
      lineList: {},
      tableData: [],
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页显示条目个数
      total: 0 // 总条目数
    }
  },
  async created() {
    this.dnsApiData = await getDnsApiData()
  },
  computed: {
    paginatedTableData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.tableData.slice(start, end)
    }
  },

  methods: {
    /**
     * @description: 获取自定义DNS解析列表
     */

    async getTableData(data) {
      this.tableData = data || []
      this.total = data.length
    },

    /**
     * 获取线路列表
     */
    async getlineList(params) {
      const res = await this.$listeners.getlineList(params)
      this.lineList = res.data || {}
    },
    /**
     * 获取DNS解析详情
     */
    async changeDnsApiId(id) {
      if (id) {
        this.getlineList({
          id,
          domain: this.$route.query.domain
        })
        const res = await this.$listeners.getRecordListV2({
          id,
          domain: this.$route.query.domain
        })
        this.getTableData(res.data || [])
      } else {
        this.getTableData([])
      }
    },

    /**
     * @description: 显示添加源站对话框
     */

    showCreateUpdateDialog(row = {}, handle = '') {
      if (!this.dnsApiId) {
        this.$message.error('请先选择DNS API')
        return false
      }
      this.$refs.CreateUpdateDialogRef.showDialog(row, handle)
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */
    async deleteSingle(row) {
      const result = await this.$doDelete({
        tag: '解析记录'
      })
      if (!result) return
      const res = await this.$listeners.doDeleteDns({
        id: this.dnsApiId,
        recordId: row.recordId,
        domain: this.$route.query.domain
      })
      if (res) this.changeDnsApiId(this.dnsApiId)
    },

    // 处理表格分页
    handleSizeChange(newPageSize) {
      this.pageSize = newPageSize
      this.currentPage = 1 // 切换每页显示条目个数时，重置为第一页
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage
    }
  }
}
</script>
