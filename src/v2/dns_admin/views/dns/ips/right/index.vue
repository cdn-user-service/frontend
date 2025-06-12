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
            @click="allPush"
            :loading="btnLoading"
            :disabled="$root.loading"
            text="全部推送"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-upload2"
            @click="batchCancel('推送', 'update')"
            :loading="btnLoading"
            :disabled="$root.loading"
            text="批量推送"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            @click="batchCancel('删除', 'delete')"
            :loading="btnLoading"
            :disabled="$root.loading"
            text="批量删除"
          />
        </template>
      </table-query-form>

      <!-- Acl Ip 表格 -->
      <vxe-table
        class="mytable-scrollbar mt-sm"
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
          width="190"
        >
          <template #default="{ row }">
            {{ row.ipStartS + ' - ' + row.ipEndS }}
          </template>
        </vxe-table-column>

        <vxe-table-column
          title="第一级"
          field="level1Title"
          min-width="70"
        >
          <template #default="{ row }">
            <span v-if="!row.navlist.length">-</span>
            <span
              v-else
              class="text-sm"
            >{{ row.navlist[0] }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="第二级"
          field="level2Title"
          min-width="70"
        >
          <template #default="{ row }">
            <span v-if="row.navlist.length < 2">-</span>
            <span
              v-else
              class="text-sm"
            >{{ row.navlist[1] }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="第三级"
          field="level3Title"
          min-width="100"
        >
          <template #default="{ row }">
            <span v-if="row.navlist.length < 3">-</span>
            <span
              v-else
              class="text-sm"
            >{{ row.navlist[2] }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="第四级"
          field="level4Title"
          min-width="100"
        >
          <template #default="{ row }">
            <span v-if="row.navlist.length < 4">-</span>
            <span
              v-else
              class="text-sm"
            >{{ row.navlist[3] }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="第五级"
          field="level5Title"
          min-width="100"
        >
          <template #default="{ row }">
            <span v-if="row.navlist.length < 5">-</span>
            <span
              v-else
              class="text-sm"
            >{{ row.navlist[4] }}</span>
          </template>
        </vxe-table-column>

        <vxe-table-column
          title="编码"
          field="code"
          min-width="80"
        >
        </vxe-table-column>
        <vxe-table-column
          title="区域信息"
          field="info"
          min-width="120"
        >
          <template #default="{ row }">
            <span class="text-sm">{{ row.info }}</span>
          </template>
        </vxe-table-column>
        <vxe-table-column
          title="识别状态"
          width="80"
        >
          <template #default="{ row }">
            <span
              v-if="row.status == 1"
              class="text-success text-sm el-icon-success"
            > 已识别</span>
            <span
              v-else
              class="text-error text-sm el-icon-remove"
            > 未识别</span>
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
              style="cursor: pointer;"
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
    <UpdateAreaInfoDialog ref="UpdateAreaInfoDialogRef" />
  </div>
</template>

<script>
// api
import {
  getAclIpListData,
  doUpdatePushAclIp,
  doDeleteAclIp,
  doAllPushAclIp
} from '@/v2/dns_admin/api/dns/ips'

import UpdateAreaInfoDialog from '../wait/components/UpdateAreaInfoDialog'

export default {
  components: {
    UpdateAreaInfoDialog
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        status: 1, // 1 表示已识别的数据
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
     * @description: 显示修改IP段信息
     * @param {*} row
     */
    showEditIpDialog(row) {
      this.$refs.UpdateAreaInfoDialogRef.showDialog(row)
    },

    /**
     * @description: 点击全部推送
     */
    async allPush() {
      this.btnLoading = true
      const { data: res } = await doAllPushAclIp()
      this.btnLoading = false
      if (res.code !== 1) return
      this.$msg.success('推送成功')
    },

    /**
     * @description: 批量取消-推送IP段
     */

    async batchCancel(txt, type) {
      const selectLength = this.selectArr.length

      if (!selectLength) return this.$msg.error(`请选择要${txt}的IP段`)

      const confirmResult = await this.$confirm(`批量${txt}已识别IP段`, {
        title: `批量${txt}已识别IP段`,
        message: `该操作将永久 ${txt} ${selectLength} 个已识别IP段，是否继续？`,
        type: 'error',
        center: true
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$msg.info('已取消操作')
      }

      this.btnLoading = true

      const idsArr = this.selectArr.map((e) => {
        return e.id
      })

      const { data: res } = await (type === 'update'
        ? doUpdatePushAclIp({
            ids: idsArr.toString()
          })
        : doDeleteAclIp({
            ids: idsArr.toString()
          }))

      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()

      // 提示成功多少个、失败多少个
      let text = '已成功' + txt + res.data.success_count + ' 个已识别IP段。'
      if (res.data.success_count != res.data.data_count) {
        text +=
          res.data.data_count -
          res.data.success_count +
          ' 个IP段' +
          txt +
          '失败！'
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
