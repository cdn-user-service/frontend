<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :queryInfo="queryInfo"
        @changeInput="getTableData"
        :search-arr="[
          {
            name: '检索源站IP',
            key: 'sourceIp',
            value: queryInfo.sourceIp
          },
          {
            name: '检索回源端口',
            key: 'sourcePort',
            value: queryInfo.sourcePort
          },
          {
            name: '检索监听端口',
            key: 'listenPort',
            value: queryInfo.listenPort
          }
        ]"
      >
        <template slot="buttons" v-if="!$root.disabledCrud">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            :disabled="$root.loading"
            @click="showCreateUpdateDialog()"
            text="添加转发"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            v-loading="btnLoading"
            :disabled="$root.loading"
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
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>

        <ants-table-column width="60" prop="id" label="ID"> </ants-table-column>
        <ants-table-column label="监听端口" min-width="120">
          <template #default="{ row }">
            <el-tag size="mini" type="primary" plain>
              {{ (row.confInfo || {}).listen }}
            </el-tag>
          </template>
        </ants-table-column>
        <ants-table-column label="协议" min-width="120">
          <template #default="{ row }">
            {{ (row.confInfo || {}).protocol }}
          </template>
        </ants-table-column>
        <ants-table-column label="PP协议" min-width="80">
          <template #default="{ row }">
            <span
              class="text-success"
              v-if="(row.confInfo || {}).proxy_protocol"
            >
              {{ row.confInfo.proxy_protocol == 1 ? '协议V1' : '协议V2' }}
            </span>
            <span class="text-error" v-else>关闭</span>
          </template>
        </ants-table-column>
        <ants-table-column prop="ip" label="源站IP/回源端口" min-width="160">
          <template #default="{ row }">
            <div v-for="item in (row.confInfo || {}).server" :key="item">
              {{ item }}
            </div>
          </template>
        </ants-table-column>

        <ants-table-column prop="meal" label="套餐" min-width="140">
          <template #default="{ row }">
            <div>
              {{ row.productName }}
            </div>
            <div>{{ row.productEndTime }}</div>
          </template>
        </ants-table-column>

        <ants-table-column prop="cname" label="CNAME" min-width="160">
          <template #default="{ row }">
            <ants-copy :text="(row.cname || '').split(',')[0] || '-'" />
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="60">
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

        <ants-table-column
          label="操作"
          width="160"
          auto-fixed
          v-if="!$root.disabledCrud"
        >
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="showCreateUpdateDialog(row)"
              text="修改"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="deleteSingle(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <CreateUpdateDialog ref="CreateUpdateDialogRef" @refresh="getTableData" />
  </div>
</template>
<script>
import {
  getStreamList,
  doCreateUpdateStream,
  doDeleteBatchStream,
  getStreamDetail
} from '@/v2/cdn_users/api/cdn/stream'

import CreateUpdateDialog from './CreateUpdateDialog'

// 验证提示实名认证、绑定手机号
import { showTipsAlert } from '@/v2/cdn_users/extra/computed'

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        sourceIp: null,
        sourcePort: null,
        listenPort: null,
        page: 1,
        limit: this.$store.state.tabelConfig.pagesize
      },
      selectArr: [],
      tableData: [],
      btnLoading: false
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
      try {
        const { sourcePort, listenPort } = this.queryInfo
        const { data: res } = await getStreamList({
          ...this.queryInfo,
          // 端口查询的时候需要传整数，不然后端会报错！！！
          sourcePort: Number.isInteger(+sourcePort) ? sourcePort : 999999999,
          listenPort: Number.isInteger(+listenPort) ? listenPort : 999999999
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = (obj.list || []).map(item => {
          return {
            ...item,
            productEndTime: '',
            productName: '',
            cname: item.cname,
            confInfo: JSON.parse(item.confInfo || '{}')
          }
        })

        this.tableData = arr || []
        this.total = obj.totalCount || 0
        this.tableData.forEach(row => {
          this.getStreamDetailById(row)
        })
      } finally {
        this.$root.loading = false
      }
    },

    // 获取详情
    async getStreamDetailById(row) {
      const { data: res } = await getStreamDetail({
        id: row.id
      })
      if (res.code !== 1) return
      const { suit = {}, cname } = res.data || {}

      row.productEndTime = suit.endTime
      row.productName = (suit.product || {}).name
      row.cname = cname
    },

    // 多选
    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description: 添加
     */

    showCreateUpdateDialog(row = {}) {
      // 坚持是否提示实名认证和绑定手机号
      const { isUnverified, isUnboundMobile } = this.$attrs
      if (
        showTipsAlert({
          isUnverified,
          isUnboundMobile,
          tag: '添加转发'
        })
      ) {
        return
      }

      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    // 启动禁用
    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用四层转发',
          content: '此操作将禁用该四层转发，是否继续？'
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      try {
        const { data: res } = await doCreateUpdateStream({
          id: row.id,
          serialNumber: row.serialNumber,
          userId: row.userId,
          status: row.status,
          confInfo: JSON.stringify(row.confInfo)
        })

        if (res.code !== 1) {
          row.status = row.status ? 0 : 1
          return
        }

        this.$msg.success('操作成功')
      } finally {
        this.$refs[switchRef].loading = false
      }
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '转发'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const idsArr = this.selectArr.map((item, index) => {
          return item.id
        })
        const { data: res } = await doDeleteBatchStream({
          ids: idsArr + ''
        })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(selectLength + this.antsT('个转发已成功删除 '))
        this.selectArr = [] // 释放
      } finally {
        this.btnLoading = false
      }
    },

    /**
     * @description: 单个删除
     */

    async deleteSingle({ id }) {
      const result = await this.$doDelete({
        tag: '转发'
      })
      if (!result) return

      const { data } = await doDeleteBatchStream({
        ids: id
      })
      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    }
  }
}
</script>
