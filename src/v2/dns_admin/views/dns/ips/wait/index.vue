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
            icon="el-icon-s-promotion"
            @click="doAutoCheck()"
            :loading="btnLoading"
            text="自动识别"
          />

          <ants-button
            type="primary"
            size="small"
            icon="el-icon-s-check"
            @click="showCheckIpDialog"
            :loading="btnLoading"
            text="手动识别"
          />

          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="showAddIpDialog"
            :loading="btnLoading"
            text="添加IP段"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            @click="batchCancel"
            :loading="btnLoading"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <!-- Acl Ip 表格 -->
      <vxe-table
        class="mytable-scrollbar mt-sm text-sm"
        :data="ipList"
        size="small"
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

        <vxe-table-column
          type="checkbox"
          width="40"
        ></vxe-table-column>
        <vxe-table-column
          title="IP 段"
          field="ipStart"
          width="220"
        >
          <template #default="{ row }">
            {{ row.ipStartS + ' - ' + row.ipEndS }}
          </template>
        </vxe-table-column>

        <vxe-table-column
          title="区域信息"
          field="info"
          min-width="200"
        >
        </vxe-table-column>
        <vxe-table-column
          title="识别状态"
          width="100"
        >
          <template #default="{ row }">
            <span
              v-if="row.status == 1"
              class="text-success text-sm el-icon-success"
            >
              已识别</span>
            <span
              v-else
              class="text-error text-sm el-icon-remove"
            >
              未识别</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="操作"
          width="130"
        >
          <template #default="{ row }">
            <span
              class="el-icon-edit text-sm text-primary cursor-pointer"
              @click="showEditIpDialog(row)"
            >
              {{ antsT('修改') }}</span>
            <el-divider direction="vertical"></el-divider>
            <span
              class="el-icon-delete text-sm text-error cursor-pointer"
              @click="deleteIp(row)"
            >
              {{ antsT('删除') }}</span>
          </template>
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

    <!-- 修改备注信息对话框弹窗 -->
    <UpdateAreaInfoDialog
      ref="UpdateAreaInfoDialogRef"
      @refresh="getTableData"
    />

    <!-- 批量识别IP段 -->
    <BulkCheckDialog
      ref="BulkCheckDialogRef"
      :select-ip-arr="selectArr"
      @refresh="getTableData"
    />

    <!-- 手动追加IP段 -->
    <InputAclIpDialog
      ref="InputAclIpDialogRef"
      @refresh="getTableData"
    />
  </div>
</template>

<script>
// api
import {
  getAclIpListData,
  doDeleteAclIp,
  doIpAreaRepair
} from '@/v2/dns_admin/api/dns/ips'

import UpdateAreaInfoDialog from './components/UpdateAreaInfoDialog'
import BulkCheckDialog from './components/BulkCheckDialog'
import InputAclIpDialog from './components/InputAclIpDialog'

export default {
  components: {
    InputAclIpDialog,
    BulkCheckDialog,
    UpdateAreaInfoDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        status: 0, // 1 表示已识别的数据
        ip: '', // 检索截止IP
        key1: '', // 搜索框内容
        key2: '', // 搜索框内容
        key3: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: 100 // 当前每页显示多少条数据
      },
      ipList: [],
      selectArr: []
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取已识别ip列表数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getAclIpListData(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return
      this.ipList = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    // 点击自动识别
    async doAutoCheck() {
      this.btnLoading = true
      try {
        const { data: res } = await doIpAreaRepair()
        this.btnLoading = false
        if (res.code !== 1) return
        this.$msg.success('操作成功')
      } catch (error) {
        this.btnLoading = false
        throw error
      }
    },

    /**
     * @description: 点击批量识别
     */

    showCheckIpDialog() {
      if (!this.selectArr.length) {
        return this.$msg.warning('请选择要识别的IP段！')
      }
      this.$refs.BulkCheckDialogRef.showDialog()
    },

    /**
     * @description: 点击显示添加IP段对话框
     */

    showAddIpDialog() {
      this.$refs.InputAclIpDialogRef.showDialog()
    },

    /**
     * @description: 显示修改IP段信息
     * @param {*} row
     */

    showEditIpDialog(row) {
      this.$refs.UpdateAreaInfoDialogRef.showDialog(row)
    },

    /**
     * @description: 勾选操作
     * @param {*} checked
     * @param {*} records
     */

    handleSelectionChange({ checked, records }) {
      this.selectArr = records || []
    },

    // 监听limit 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getTableData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.getTableData()
    },

    /**
     * @description: 批量取消-推送IP段
     */

    async batchCancel() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: 'IP段'
      })
      if (!result) return

      this.btnLoading = true

      const idsArr = this.selectArr.map((e) => e.id)

      const { data: res } = await doDeleteAclIp({
        ids: idsArr.toString()
      })

      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()

      // 提示成功多少个、失败多少个
      let text = '已成功删除' + res.data.success_count + ' 个已识别IP段。'
      if (res.data.success_count != res.data.data_count) {
        text +=
          res.data.data_count - res.data.success_count + ' 个IP段删除失败！'
      }
      this.$alert(text, '友情提示', {
        confirmButtonText: '确定',
        type:
          res.data.success_count != res.data.data_count ? 'warning' : 'success',
        center: true
      })

      this.selectArr = [] // 释放
    },

    // 单个取消
    async deleteIp(row) {
      const { data: res } = await doDeleteAclIp({ ids: row.id })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('取消已识别IP段成功')
    }
  }
}
</script>
