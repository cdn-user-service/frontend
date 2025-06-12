<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索IP地址',
            key: 'ip',
            value: queryInfo.ip
          },
          {
            name: '检索区域条件一',
            key: 'key1',
            value: queryInfo.key1
          },
          {
            name: '检索区域条件二',
            key: 'key2',
            value: queryInfo.key2
          }
        ]"
        :queryInfo="queryInfo"
        :pagenumKey="'page'"
        @changeInput="getTableData"
        :show-table-setting="false"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            size="small"
            icon="el-icon-plus"
            :loading="btnLoading"
            @click="showImportIpDialog"
            text="导入数据"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-s-check"
            :loading="btnLoading"
            @click="doBatchRuku"
            text="批量入库"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="deleteIpList"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <vxe-table
        class="mytable-scrollbar"
        ref="multipleTable"
        :data="ipList"
        size="small"
        style="margin-top:10px;"
        max-height="650"
        auto-resize
        highlight-hover-row
        border="inner"
        v-loading="$root.loading"
        show-overflow
        @checkbox-all="handleSelectionChange"
        @checkbox-change="handleSelectionChange"
      >
        <div slot="empty">
          <el-empty :description="antsT('暂无数据')"> </el-empty>
        </div>
        <vxe-table-column type="checkbox" width="40"></vxe-table-column>
        <vxe-table-column title="IP段" width="200">
          <template #default="{ row }">
            {{ row.start + ' - ' + row.end }}
          </template>
        </vxe-table-column>
        <vxe-table-column title="区域信息" field="info" min-width="200">
        </vxe-table-column>
      </vxe-table>

      <!-- 分页 -->
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        small
        :page-sizes="[20, 50, 100, 200, 500]"
        :page-size="queryInfo.limit"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
      >
      </el-pagination>
    </el-card>

    <!-- 导入IP段文件弹窗 -->
    <BulkImportDialog ref="BulkImportDialogRef" />
  </div>
</template>

<script>
// api
import {
  getIpList,
  doDeleteIpList,
  doImportBaseIpToSuccessIp
} from '@/v2/dns_admin/api/dns/ips'

import BulkImportDialog from './BulkImportDialog'

export default {
  components: {
    BulkImportDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        ip: '',
        key1: '',
        key2: '',
        key3: '',
        page: 1,
        limit: 100
      },
      ipList: [],
      selectArr: []
      // 上传文件数据数据
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取IP数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getIpList(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return
      this.ipList = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    // 勾选操作
    handleSelectionChange({ checked, records }) {
      this.selectArr = records || []
    },

    /**
     * @description: 点击批量入库
     */

    async doBatchRuku() {
      if (!this.selectArr.length) {
        return this.$msg.warning('请选择要入库的IP段！')
      }
      this.btnLoading = true

      const idsArr = this.selectArr.map(e => e.id)
      const { data: res } = await doImportBaseIpToSuccessIp({
        ids: idsArr + ''
      })
      this.btnLoading = false

      if (res.code !== 1) return

      // 提示成功多少个、失败多少个
      let text = '已成功入库 ' + res.data.success + ' 个IP段。'
      if (res.data.success != res.data.total) {
        text += res.data.total - res.data.success + ' 个IP段入库失败'
      }
      this.$alert(text, '友情提示', {
        confirmButtonText: '确定',
        type: res.data.success != res.data.total ? 'warning' : 'success',
        center: true
      })
      this.selectArr = [] // 释放
    },

    /**
     * @description: 点击导入数据
     */

    showImportIpDialog() {
      this.$refs.BulkImportDialogRef.dialogVisible = true
    },

    /**
     * @description: 批量删除模块
     */

    async deleteIpList() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: 'IP段'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => e.id)

      const { data: res } = await doDeleteIpList({
        ids: idsArr.toString()
      })
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个IP段')
      this.selectArr = [] // 释放
    },

    /**
     *  导入数据上传文件模块 ===============================
     */

    // 监听limit 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getTableData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.getTableData()
    }
  },
  beforeDestroy() {
    window.sessionStorage.removeItem('areaList')
  }
}
</script>
