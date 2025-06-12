<template>
  <div
    class="content-box animated fadeIn"
    style="margin:0;"
  >
    <AntsTabCard
      ref="AntsTabCardRef"
      :tab-arr="[
        {
          id: '',
          name: '全部'
        },
        ...groupList
      ]"
      value-key="id"
      label-key="name"
      @change="changeGroup"
    >
      <div class="animated fadeIn">
        <table-query-form
          :search-arr="[
            {
              name: '输入IP搜索',
              key: 'key',
              value: queryInfo.key
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
              @click="toCreateUpdate()"
              text="添加节点"
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
          row-key="id"
          :tree-props="{
           children: 'childList',
           hasChildren: 'hasChildren'
          }"
        >
          <ants-table-column
            type="selection"
            width="45"
            align="center"
          ></ants-table-column>
          <ants-table-column
            prop="ip"
            label="节点IP"
            min-width="140"
          >
          </ants-table-column>

          <ants-table-column
            prop="parentId"
            label="主/备"
            width="80"
          >
            <template #default="{ row }">
              <el-tag
                v-if="row.parentId != 0"
                size="mini"
                type="info"
              >备</el-tag>
              <el-tag
                v-else
                size="mini"
                type="primary"
              >主</el-tag>
            </template>
          </ants-table-column>

          <ants-table-column
            prop="id"
            label="ID"
            min-width="60"
          >
          </ants-table-column>

          <ants-table-column
            prop="version"
            label="版本"
            min-width="100"
          >
          </ants-table-column>

          <ants-table-column
            prop="regEndTime"
            label="到期时间"
            min-width="140"
          >
            <template #default="{ row }">
              {{ row.regEndTime * 1000 | dateFormat }}
            </template>
          </ants-table-column>

          <ants-table-column
            prop="name"
            label="所属分组"
            min-width="140"
          >
            <template #default="{ row }">
              <el-tag
                v-if="row.parentId == 0"
                type="primary"
                size="mini"
              >{{ row.name }}</el-tag>
            </template>
          </ants-table-column>

          <ants-table-column
            prop="line"
            label="线路"
            min-width="140"
          >
          </ants-table-column>

          <ants-table-column
            prop="remark"
            label="备注信息"
            min-width="140"
          >
          </ants-table-column>

          <ants-table-column
            prop="checkSun"
            label="健康状态"
            min-width="100"
          >
            <template #default="{ row }">
              <el-tag
                v-if="row.checkSun >= 10"
                size="mini"
                type="success"
              >正常</el-tag>
              <el-tag
                v-else-if="row.checkSun > 0 && row.checkSun < 10"
                size="mini"
                type="warning"
              >在线</el-tag>
              <el-tag
                v-else
                size="mini"
                type="danger"
              >故障</el-tag>
            </template>
          </ants-table-column>
          <ants-table-column
            prop="checkTime"
            label="最后检测时间"
            min-width="140"
          >
            <template #default="{ row }">
              {{ (row.checkTime * 1000) | dateFormat }}
            </template>
          </ants-table-column>

          <ants-table-column
            label="操作"
            width="160"
            align="right"
            auto-fixed
          >
            <template #default="{ row }">
              <ants-button
                v-if="row.parentId == 0"
                size="mini"
                type="primary"
                @click="toCreateUpdate(row)"
                :disabled="btnLoading"
                text="修改"
              />

              <el-dropdown
                placement="bottom"
                :show-timeout="100"
                @command="handleMore"
                v-if="row.clientType != 3"
              >
                <ants-button
                  plain
                  :disabled="btnLoading"
                  type="primary"
                  size="mini"
                  style="margin-left:10px;padding:7px 9px;"
                  text="更多"
                ><i class="el-icon-caret-bottom el-icon--right"></i></ants-button>

                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-if="row.parentId == 0"
                    :command="handleCommand('toCreateBackupIp', row)"
                  >{{
                  antsT('添加备IP')
                }}</el-dropdown-item>
                  <el-dropdown-item :command="handleCommand('toUpdateSshInfo', row)">{{
                  antsT('SSH信息')
                }}</el-dropdown-item>
                  <el-dropdown-item :command="handleCommand('openTerminal', row)">{{
                  antsT('连接终端')
                }}</el-dropdown-item>
                  <el-dropdown-item :command="handleCommand('singleDelete', row)">{{
                  antsT('删除节点')
                }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </ants-table-column>
        </ants-table>
      </div>
    </AntsTabCard>

    <FormDialog
      ref="FormDialogRef"
      :groupId="queryInfo.groupId"
      :groupList="groupList"
      @refresh="getTableData"
    />

    <CreateBackupDialog
      ref="CreateBackupDialogRef"
      @refresh="getTableData"
    />

    <UpdateSshInfoDialog
      ref="UpdateSshInfoDialogRef"
      @refresh="getTableData"
    />

    <!-- 终端 -->
    <Terminal ref="TerminalRef" :nodeList="tableData" />
  </div>
</template>

<script>
// API
import {
  getServerList,
  doDeleteServer,
  getSeverGroupNav
} from '@/v2/dns_admin/api/dns/serve'

import FormDialog from './FormDialog'
import CreateBackupDialog from './CreateBackupDialog'
import UpdateSshInfoDialog from './UpdateSshInfoDialog'
// import Terminal from './Terminal'
import Terminal from '@/components/terminal'

export default {
  components: {
    FormDialog,
    CreateBackupDialog,
    UpdateSshInfoDialog,
    Terminal
  },

  data() {
    return {
      total: 0,
      queryInfo: {
        key: '', // 搜索框内容
        groupId: '', // 分组ID
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      btnLoading: false,

      groupList: []
    }
  },
  created() {
    this.getSeverGroupList()
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取节点列表
     */
    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getServerList(this.queryInfo)
        this.$root.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        this.total = obj.totalCount || 0
        this.tableData = obj.list || []
      } catch (error) {
        this.$root.loading = false
        throw error
      }
    },

    // 切换分组
    changeGroup(val) {
      this.queryInfo.page = 1
      this.queryInfo.groupId = val
      this.getTableData()
    },

    /**
     * @description: 获取分组列表
     */

    async getSeverGroupList() {
      const { data: res } = await getSeverGroupNav()
      if (res.code !== 1) return
      this.groupList = res.data || []
    },

    // 获取下拉框指令参数，用于自定义参数
    handleCommand(method, row) {
      return {
        method,
        row
      }
    },

    // 选择更多下拉框内容
    handleMore({ method, row }) {
      this[method](row)
    },

    /**
     * @description: 前往 添加-编辑 节点页面
     */

    toCreateUpdate(row = {}) {
      this.$refs.FormDialogRef.show(row)
      // this.$router.push({
      //   name: 'NodeUpdate',
      //   params: { id: !id ? 'add' : id }
      // })
    },

    // 前往备IP页面
    toCreateBackupIp(row = {}) {
      this.$refs.CreateBackupDialogRef.show(row)
    },

    // 点击修改SSH信息
    toUpdateSshInfo(row = {}) {
      const sshInfo = row.sshInfo || {}
      this.$refs.UpdateSshInfoDialogRef.show({
        ...sshInfo,
        clientId: row.id,
        host: row.ip
      })
    },

    // 打开终端
    openTerminal(row = {}) {
      this.$refs.TerminalRef.show(row)
    },

    // 上架-下架分组
    async statusGoods(row) {
      let txt = '上架'
      let postState = 1
      if (row.state === 1) {
        txt = '下架'
        postState = 0
      }
      const { data } = await this.$http.post(
        '',
        this.$qs.stringify({
          id: row.id,
          state: postState
        })
      )
      if (data.code !== 1) return this.$msg.error(data.message)
      this.getTableData()
      this.$msg.success(row.goods + txt + '成功')
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: 'Server节点'
      })
      if (!result) return

      const idsArr = this.selectArr.map((e) => {
        return e.id
      })
      this.btnLoading = true
      const { data: res } = await doDeleteServer(idsArr)
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个节点')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除分组
     * @param {*} row
     */

    async singleDelete(row) {
      const result = await this.$doDelete({
        tag: '节点',
        name: row.ip
      })
      if (!result) return

      const { data: res } = await doDeleteServer([row.id])

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除节点成功')
    }
  }
}
</script>
