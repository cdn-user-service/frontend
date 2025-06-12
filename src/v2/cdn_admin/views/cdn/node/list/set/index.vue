<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索节点IP',
            key: 'ip',
            value: queryInfo.ip
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="success"
            icon="el-icon-s-promotion"
            size="small"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="refreshNodeSync"
            text="更新节点"
            class="mr-sm"
          />

          <BatchHandle ref="BatchHandleRef" @refreshData="getTableData" />
        </template>

        <template slot="inputs">
          <ants-select
            v-model="queryInfo.stableScoreStatus"
            @change="toQuery"
            size="small"
            placeholder="健康状态"
            style="width: 150px"
            class="mr-sm"
          >
            <ants-option label="全部状态" value="all" />
            <ants-option
              v-for="(item, key) in {
                0: '故障',
                1: '在线',
                2: '正常'
              }"
              :key="key"
              :label="item"
              :value="key"
            />
          </ants-select>

          <ants-select
            v-model="queryInfo.areaId"
            @change="toQuery"
            size="small"
            placeholder="请选择分组"
            style="width: 150px"
            class="mr-sm"
          >
            <ants-option label="全部分组" value=" " />
            <ants-option
              v-for="item in groupList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ants-select>

          <ants-select
            v-model="queryInfo.clientType"
            @change="toQuery"
            size="small"
            placeholder="请选择主备类型"
            style="width: 150px"
            class="mr-sm"
          >
            <ants-option label="全部类型" value=" " />
            <ants-option
              v-for="item in clientTypeList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </ants-select>
        </template>
      </table-query-form>

      <ants-table
        :data="listData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
        row-key="id"
        :tree-props="{
          children: 'childList',
          hasChildren: 'hasChildren'
        }"
        @expand-change="getChildData"
      >
        <ants-table-column prop="clientIp" label="节点IP" min-width="140">
        </ants-table-column>

        <ants-table-column prop="id" label="ID" width="80"> </ants-table-column>

        <ants-table-column label="缓存级别" min-width="80">
          <template #default="{ row }">
            <el-tag size="mini" :type="row.clientTagType">{{
              row.clientTypeName
            }}</el-tag>

            <!-- <el-tag v-if="row.clientType == 2" size="mini" type="success"
              >中间源</el-tag
            > -->
            <!-- <el-tag v-if="row.clientType == 1" size="mini" type="primary"
              >主</el-tag
            >
            <el-tag v-else-if="row.clientType == 3" size="mini" type="info"
              >备</el-tag
            >
            <el-tag v-else-if="row.clientType == 4" size="mini" type="success"
              >回源</el-tag
            > -->
          </template>
        </ants-table-column>

        <ants-table-column min-width="120" prop="area" label="主机区域">
          <template #default="{ row }">
            {{ row.area || '-' }}
          </template>
        </ants-table-column>
        <ants-table-column min-width="120" prop="line" label="线路">
          <template #default="{ row }">
            {{ row.line || '-' }}
          </template>
        </ants-table-column>
        <ants-table-column min-width="140" prop="remark" label="备注信息">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </ants-table-column>

        <ants-table-column
          prop="effectiveEndingTime"
          label="到期时间"
          min-width="140"
        >
          <template #default="{ row }">
            {{ row.effectiveEndingTime || '-' }}
          </template>
        </ants-table-column>

        <ants-table-column prop="version" label="版本号" min-width="80">
        </ants-table-column>
        <ants-table-column prop="gropuInfo" label="节点分组" min-width="100">
          <template #default="{ row }">
            {{ row.areaName }}
          </template>
        </ants-table-column>

        <ants-table-column label="健康状态" min-width="80">
          <template #default="{ row }">
            <el-tag v-if="row.stableScore >= 10" size="mini" type="success"
              >正常</el-tag
            >
            <el-tag
              v-else-if="row.stableScore > 0 && row.stableScore < 10"
              size="mini"
              type="warning"
              >在线</el-tag
            >
            <el-tag v-else size="mini" type="danger">故障</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column prop="status" label="推送状态" min-width="80">
          <template #default="{ row }">
            <div>
              <span v-if="!row.pushResult" class="el-icon-remove text-warning">
                推送中</span
              >

              <el-tooltip placement="left" v-else effect="light">
                <div slot="content" style="max-width: 300px">
                  <div class="mb-sm">
                    <strong>module:</strong>{{ row.pushResult.module }}
                  </div>
                  <div class="leading-relaxed">
                    <strong>info:</strong>{{ row.pushResult.info }}
                  </div>
                  <div class="leading-relaxed">
                    <strong>publish:</strong>{{ row.pushResult.publish }}
                  </div>
                </div>

                <span
                  v-if="row.pushResult.config === 'success'"
                  class="el-icon-success text-success cursor-pointer"
                >
                  已完成</span
                >
                <span v-else class="el-icon-error text-error cursor-pointer">
                  失败</span
                >
              </el-tooltip>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column prop="publish" label="推送时间" min-width="140">
          <template #default="{ row }">
            <div>
              {{
                (row.pushResult || {}).publish ? row.pushResult.publish : '-'
              }}
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="status"
          label="线路优化"
          min-width="90"
          v-if="$mode['176_179']"
        >
          <template #header>
            <el-tooltip
              placement="left"
              content="开启之后，优化TCP握手，提高连接成功率，会降低响应速度"
            >
              <span class="cursor-pointer">
                线路优化
                <i
                  class="el-icon-info text-primary"
                  style="font-size: 15px"
                ></i>
              </span>
            </el-tooltip>
          </template>
          <template #default="{ row, $index }">
            <ants-table-switch
              v-if="row.clientType == 1"
              v-model="row.sysWsStatus"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="160" auto-fixed align="right">
          <template #default="{ row }">
            <ants-button
              v-if="
                row.clientType == 1 ||
                row.clientType == 4 ||
                row.clientType == 5
              "
              :type="row.effectiveEndingTime ? 'primary' : 'success'"
              size="mini"
              :disabled="btnLoading"
              @click="showCreateUpdateDialog(row)"
              :text="row.effectiveEndingTime ? '修改' : '注册'"
            />

            <el-dropdown
              placement="bottom"
              :show-timeout="100"
              @command="handleMore"
              v-if="
                row.clientType == 1 ||
                row.clientType == 4 ||
                row.clientType == 5
              "
            >
              <ants-button
                plain
                :disabled="btnLoading"
                type="primary"
                size="mini"
                style="margin-left: 10px; padding: 7px 9px"
                text="更多"
                ><i class="el-icon-caret-bottom el-icon--right" />
              </ants-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, key) in {
                    initNode: '初始化',
                    enableNode: '应用节点',
                    toCreateBackup: '添加备IP',
                    toAdvance: '高级设置',
                    toUpdateSshInfo: 'SSH信息',
                    openTerminal: '连接终端',
                    rebootNode: '重启节点',
                    toDel: '删除节点'
                  }"
                  :key="key"
                  :command="handleCommand(key, row)"
                  >{{ antsT(item) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <ants-button
              v-else
              @click="toDel(row)"
              type="danger"
              size="mini"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加节点对话框 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      :groupList="groupList"
      :clientTypeList="clientTypeList"
    />

    <!-- 添加备用IP对话框 -->
    <CreateBackupDialog ref="CreateBackupDialogRef" @refresh="getTableData" />

    <!-- 高级设置对话框 -->
    <AdvancedSettingDialog ref="AdvancedSettingDialogRef" />

    <!-- 修改SSH信息对话框 -->
    <UpdateSshInfoDialog ref="UpdateSshInfoDialogRef" @refresh="getTableData" />

    <!-- 终端 -->
    <Terminal ref="TerminalRef" :nodeList="nodeList" />
  </div>
</template>

<script>
// API
import {
  getNodeList,
  doDeleteNode,
  doRefreshNodeSync,
  doEnableNode,
  getNodeGroup,
  switchNodeLine
} from '@/v2/cdn_admin/api/cdn/node'
// 推送数据接口，用于节点初始化
import { pushByInputInfo } from '@/v2/cdn_admin/api/cdn/push'

import CreateUpdateDialog from './CreateUpdateDialog'
import CreateBackupDialog from './CreateBackupDialog'
import AdvancedSettingDialog from './AdvancedSettingDialog'
import BatchHandle from './BatchHandle.vue'

import UpdateSshInfoDialog from './UpdateSshInfoDialog'
import Terminal from '@/components/terminal'

export default {
  components: {
    CreateUpdateDialog,
    CreateBackupDialog,
    AdvancedSettingDialog,
    BatchHandle,

    UpdateSshInfoDialog,
    Terminal
  },
  data() {
    return {
      btnLoading: false,
      total: 0,
      queryInfo: {
        stableScoreStatus: 'all',
        areaId: ' ',
        ip: '',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize, // 当前每页显示多少条数据
        clientType: ' '
      },
      selectArr: [],
      tableData: [],

      timer: null,

      // 节点分组列表
      groupList: [],
      // 主备类型
      clientTypeList: [
        { name: '一级缓存', value: '1', type: 'primary' },
        // { name: '中间节点', value: '2', type: 'warning' },
        // { name: '主节点备用节点', value: '3', type: 'info' },
        { name: '二级缓存', value: '4', type: 'success' },
        { name: '三级缓存', value: '5', type: 'danger' }
      ]
    }
  },
  computed: {
    // 用于终端显示的节点列表
    nodeList() {
      return this.tableData.map((item) => {
        return {
          id: item.id,
          ip: item.clientIp,
          childList: (item.childBackupIpList || []).map((child) => {
            return {
              id: child.id,
              ip: child.clientIp
            }
          })
        }
      })
    },
    // 获取table数据 用于table
    listData() {
      return this.tableData.map((item) => {
        return {
          ...item,
          childList: item.childBackupIpList.slice(0, 10) || []
        }
      })
    }
  },
  created() {
    this.getTableData()
    this.getNodeGroupList()
  },

  methods: {
    getChildData(row, expandRows) {
      if (expandRows) {
        row.childList = row.childBackupIpList
      }
    },
    // 获取分组数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { stableScoreStatus } = this.queryInfo
        const { data: res } = await getNodeList({
          ...this.queryInfo,
          stableScoreStatus:
            stableScoreStatus === 'all' ? undefined : stableScoreStatus
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData =
          obj.list?.map((item) => {
            if (item.childBackupIpList.length) {
              item.childBackupIpList = item.childBackupIpList.map((child) => {
                child.clientTypeName =
                  this.clientTypeList.find(
                    (type) => type.value == child.clientType
                  )?.name || '--'
                return child
              })
            }

            item.clientTypeName =
              this.clientTypeList.find((type) => type.value == item.clientType)
                ?.name || '--'

            item.clientTagType =
              this.clientTypeList.find((i) => i.value == item.clientType)
                ?.type || ''
            return item
          }) || []

        console.log('this.tableData', this.tableData)
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 获取节点分组列表
    async getNodeGroupList() {
      const { data: res } = await getNodeGroup({
        page: 1,
        limit: 500
      })
      if (res.code !== 1) return
      this.groupList = (res.data || {}).list || []
    },

    // 设置定时器刷新页面
    setTime() {
      // 清除定时器
      this.clearTimer()
      this.timer = setTimeout(async () => {
        const { data: res } = await doRefreshNodeSync()
        if (res.code !== 1) {
          this.clearTimer()
          return
        }
        // 刷新表格数据
        const { data: res1 } = await getNodeList(this.queryInfo)
        if (res.code !== 1) return
        const obj = (res1 || {}).data
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      }, 3000)
    },

    clearTimer() {
      clearTimeout(this.timer)
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 添加节点
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    // 添加备用IP
    toCreateBackup(row = {}) {
      this.$refs.CreateBackupDialogRef.showDialog({
        ...row,
        clientType: 3
      })
    },

    // 添加回源IP
    toCreateResource(row = {}) {
      this.$refs.CreateBackupDialogRef.showDialog({
        ...row,
        clientType: 4
      })
    },

    // 点击更新节点，与 ants 同步所有节点信息
    async refreshNodeSync() {
      this.btnLoading = true
      try {
        const { data: res } = await doRefreshNodeSync()
        if (res.code !== 1) return
        this.$msg.success('更新节点成功')
        this.getTableData()
      } finally {
        this.btnLoading = false
      }
    },

    // 应用节点、 主控向ants发起注册
    async enableNode({ id }) {
      this.btnLoading = true
      try {
        const { res: data } = await doEnableNode({
          id
        })
        if (data.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('应用节点成功'))
      } finally {
        this.btnLoading = false
      }
    },

    // 单个删除
    async toDel({ id, clientIp }) {
      const result = await this.$doDelete({
        tag: '节点',
        name: clientIp
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data } = await doDeleteNode({
          id
        })
        if (data.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('删除节点成功'))
      } finally {
        this.btnLoading = false
      }
    },

    // 初始化节点
    async initNode({ id, clientIp }) {
      const result = await this.$doDelete({
        title: '初始化节点',
        content: `此操作将初始化节点 <strong>${clientIp}</strong> ，是否继续？`,
        type: 'info',
        confirmButtonText: '初始化节点'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await pushByInputInfo({
          all_file_2_node: id
          // all_file: 'null' // 推送所有
          // init_node: id
        })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('初始化节点成功')
      } finally {
        this.btnLoading = false
      }
    },

    // 高级设置
    toAdvance(row = {}) {
      this.$refs.AdvancedSettingDialogRef.showDialog(row)
    },

    // 点击修改SSH信息
    toUpdateSshInfo(row = {}) {
      this.$refs.UpdateSshInfoDialogRef.show({
        ...row
      })
    },

    // 打开终端
    openTerminal(row = {}) {
      this.$refs.TerminalRef.show(row)
    },

    // 重启节点
    async rebootNode({ clientIp }) {
      const result = await this.$doDelete({
        title: '重启节点',
        content: `此操作将重启节点 <strong>${clientIp}</strong> ，是否继续？`,
        type: 'info',
        confirmButtonText: '立即重启'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const { data: res } = await pushByInputInfo({
          reboot_node: clientIp
        })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('操作成功，节点正在重启')
      } finally {
        this.btnLoading = false
      }
    },

    /**
     *  点击更多下拉框
     */
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

    // 线路优化
    async changeStatus(row, switchRef) {
      if (row.sysWsStatus === 0) {
        const result = await this.$doDelete({
          title: '关闭线路优化',
          content: `此操作将关闭节点“ <strong style="color: #F78989;">${row.clientIp}</strong> 线路优化”，是否继续？`
        })
        if (!result) {
          row.sysWsStatus = 1
          return
        }
      }

      this.$refs[switchRef].loading = true
      try {
        const { data: res } = await switchNodeLine({
          id: row.id,
          sysWsStatus: row.sysWsStatus
        })
        if (res.code !== 1) {
          row.sysWsStatus = row.sysWsStatus ? 0 : 1
          return
        }
        this.$msg.success('操作成功')
      } finally {
        this.$refs[switchRef].loading = false
      }
    }
  }
}
</script>
