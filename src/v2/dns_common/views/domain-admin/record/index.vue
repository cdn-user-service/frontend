<template>
  <div class="dns-record-box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索主机记录',
            key: 'top',
            value: queryInfo.top
          },
          {
            name: '检索记录值',
            key: 'value',
            value: queryInfo.value
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
            :loading="loading"
            @click="showCreateForm()"
            text="添加记录"
            class="mr-sm"
          />

          <el-dropdown @command="toBulkMark" placement="bottom">
            <ants-button
              size="small"
              type="info"
              :loading="$root.loading"
              :disabled="btnLoading"
              text="批量操作"
            >
              <i class="el-icon-arrow-down el-icon--right"></i>
            </ants-button>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="toBulkStart">
                <i class="el-icon-check"></i>
                {{ antsT('批量开启') }}
              </el-dropdown-item>
              <el-dropdown-item command="toBulkClose">
                <i class="el-icon-close"></i>
                {{ antsT('批量暂停') }}
              </el-dropdown-item>
              <el-dropdown-item command="toBulkDel">
                <i class="el-icon-delete"></i>
                {{ antsT('批量删除') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </table-query-form>

      <!-- 表格 -->
      <el-form
        :model="form"
        :rules="formRules"
        class="table-form"
        ref="formRef"
      >
        <ants-table
          :data="tableData"
          @getTableData="getTableData"
          @selection-change="handleSelectionChange"
          empty-text="暂无解析记录，开始添加记录吧"
          :total="total"
          :queryInfo="queryInfo"
          row-key="record_id"
          :expand-row-keys="[expandRowId]"
          :row-class-name="tableRowClassName"
          v-loading="loading"
        >
          <ants-table-column type="expand" width="1">
            <ExpandTips ref="ExpandTipsRef" @hideExpandTips="hideExpandTips" />
          </ants-table-column>

          <ants-table-column
            type="selection"
            width="45"
            align="center"
            :selectable="isSelectable"
          />

          <ants-table-column width="30">
            <template #default="{ row, $index }">
              <span
                v-if="isNsRecord(row, $index)"
                class="el-icon-s-platform text-ants-text-4"
                style="
                  vertical-align: middle;
                  margin-left: -4px;
                  font-size: 15px;
                "
              />

              <template v-else>
                <el-tooltip
                  :content="
                    antsT(
                      row.taskId
                        ? '监控调度中'
                        : row.status !== 0
                        ? '正常解析'
                        : '暂停解析'
                    )
                  "
                  placement="top"
                  effect="dark"
                >
                  <span
                    :class="
                      row.taskId
                        ? 'bg-primary'
                        : row.status !== 0
                        ? 'bg-success'
                        : 'bg-error'
                    "
                    class="inline-block rounded-xl cursor-pointer"
                    style="width: 8px; height: 8px"
                  />
                </el-tooltip>
              </template>
            </template>
          </ants-table-column>

          <ants-table-column label="主机记录" prop="top" min-width="100">
            <template #default="{ row, $index }">
              <div
                v-if="
                  isNsRecord(row, $index) || row.taskId || !canEditRecord(row)
                "
              >
                {{ row.top }}
              </div>

              <el-form-item v-else-if="isShowForm(row.record_id)" prop="top">
                <el-input
                  size="small"
                  v-model="form.top"
                  ref="topRef"
                  :placeholder="antsT('按如下提示填写')"
                  @focus="toggleExpand(row, 'top')"
                />
              </el-form-item>

              <div
                v-else
                class="hover-div"
                @click="showUpdateForm(row, 'topRef')"
              >
                {{ row.top }}
              </div>
            </template>
          </ants-table-column>

          <ants-table-column
            label="记录类型"
            sortable
            prop="record_type"
            min-width="100"
          >
            <template #default="{ row, $index }">
              <div v-if="isNsRecord(row, $index)">NS</div>

              <div v-else-if="row.taskId || !canEditRecord(row)">
                {{ row.record_type }}
              </div>

              <el-form-item
                v-else-if="isShowForm(row.record_id)"
                prop="record_type"
              >
                <TypeSelect
                  v-model="form.record_type"
                  ref="sortRef"
                  @focus="toggleExpand(row, 'record_type')"
                  @change="changeSort(row, form.record_type)"
                />
              </el-form-item>
              <div
                v-else
                class="hover-div"
                @click="showUpdateForm(row, 'sortRef')"
              >
                {{ (row.record_type || '').toUpperCase() }}
              </div>
            </template>
          </ants-table-column>

          <ants-table-column
            label="线路类型"
            min-width="100"
            class-name="line-table-column"
          >
            <template #default="{ row, $index }">
              <div
                v-if="
                  isNsRecord(row, $index) || row.taskId || !canEditRecord(row)
                "
              >
                {{ row.record_line_name }}
              </div>

              <el-form-item v-else-if="isShowForm(row.record_id)" prop="line">
                <LineCascader
                  v-model="form.line"
                  :placeholder="row.record_line_name"
                  :index="$index"
                  ref="cascaderRef"
                  @focus="toggleExpand(row, 'line')"
                />
              </el-form-item>
              <div
                v-else
                class="hover-div"
                @click="showUpdateForm(row, 'cascaderRef')"
              >
                {{ row.record_line_name }}
              </div>
            </template>
          </ants-table-column>
          <ants-table-column label="记录值" prop="value" min-width="130">
            <template #default="{ row, $index }">
              <div
                v-if="
                  isNsRecord(row, $index) || row.taskId || !canEditRecord(row)
                "
              >
                {{ row.value }}
              </div>

              <!-- prop="value" 验证后端做 -->
              <el-form-item
                v-else-if="isShowForm(row.record_id)"
                prop="value"
                ref="valueFormItemRef"
              >
                <el-input
                  size="small"
                  ref="valueRef"
                  v-model="form.value"
                  @focus="toggleExpand(row, 'value')"
                />
              </el-form-item>

              <div
                v-else
                class="hover-div"
                @click="showUpdateForm(row, 'valueRef')"
              >
                {{ row.value }}

                <!-- CNAME、MX记录类型后面加一个 点 -->
                <span
                  v-if="row.record_type == 'CNAME' || row.record_type == 'MX'"
                  >.</span
                >
              </div>
            </template>
          </ants-table-column>

          <ants-table-column label="权重" min-width="68">
            <template #default="{ row, $index }">
              <div
                v-if="
                  isNsRecord(row, $index) || row.taskId || !canEditRecord(row)
                "
              >
                {{ row.weight || '-' }}
              </div>

              <el-form-item v-else-if="isShowForm(row.record_id)" prop="weight">
                <el-input
                  size="small"
                  ref="weightRef"
                  v-model="form.weight"
                  @focus="toggleExpand(row, 'weight')"
                />
              </el-form-item>

              <div
                class="hover-div"
                v-else
                @click="showUpdateForm(row, 'weightRef')"
              >
                {{ row.weight || '-' }}
              </div>
            </template>
          </ants-table-column>

          <ants-table-column label="MX" min-width="68">
            <template #default="{ row }">
              <!-- 记录类型不为 MX ，则不允许修改mx的值 -->
              <span v-if="row.record_type != 'MX'">-</span>
              <div v-else>
                <el-form-item v-if="isShowForm(row.record_id)" prop="mx">
                  <el-input
                    size="small"
                    ref="mxRef"
                    v-model="form.mx"
                    @focus="toggleExpand(row, 'mx')"
                  />
                </el-form-item>

                <div
                  class="hover-div"
                  v-else
                  @click="showUpdateForm(row, 'mxRef')"
                >
                  {{ row.mx || '-' }}
                </div>
              </div>
            </template>
          </ants-table-column>

          <ants-table-column label="TTL" prop="ttl" min-width="68">
            <template #default="{ row, $index }">
              <div
                v-if="
                  isNsRecord(row, $index) || row.taskId || !canEditRecord(row)
                "
              >
                {{ row.ttl }}
              </div>

              <el-form-item v-else-if="isShowForm(row.record_id)" prop="ttl">
                <el-input
                  size="small"
                  ref="ttlRef"
                  type="number"
                  :min="60"
                  v-model="form.ttl"
                  @focus="toggleExpand(row, 'ttl')"
                />
              </el-form-item>

              <div
                v-else
                class="hover-div"
                @click="showUpdateForm(row, 'ttlRef')"
              >
                {{ row.ttl }}
              </div>
            </template>
          </ants-table-column>

          <ants-table-column label="状态" prop="status" min-width="50">
            <template #default="{ row, $index }">
              <ants-table-switch
                v-model="row.status"
                inactive-color="#DCDFE6"
                active-color="#13ce66"
                :inactive-value="3"
                :disabled="
                  isNsRecord(row, $index) || !!row.taskId || row.shareEntity
                "
                :ref="`tableSwitchRef${$index}`"
                @change="changeStatus(row, `tableSwitchRef${$index}`)"
              />
            </template>
          </ants-table-column>

          <!-- <ants-table-column label="TC模式" prop="tcp" min-width="60">
            <template #default="{ row, $index }">
              <ants-table-switch
                v-model="row.tcp"
                inactive-color="#DCDFE6"
                active-color="#13ce66"
                 :disabled="isNsRecord(row, $index) || !!row.taskId"
                :ref="`tableSwitchRef${$index}`"
                @change="changeTCP(row, `tableSwitchRef${$index}`)"
              />
            </template>
          </ants-table-column> -->

          <ants-table-column label="操作" width="200">
            <template #default="{ row, $index }">
              <div
                v-if="
                  isNsRecord(row, $index) || row.taskId || !canEditRecord(row)
                "
                class="flex items-center"
              >
                <span
                  v-if="row.taskId"
                  class="text-primary cursor-pointer"
                  @click="toGtm(row)"
                >
                  <i class="el-icon-monitor" />
                  {{ antsT('监控') }}
                </span>

                <span v-else class="text-ants-text-5 cursor-not-allowed">
                  <i class="el-icon-edit" />
                  {{ antsT('修改') }}
                </span>

                <el-divider direction="vertical" />

                <span class="text-ants-text-5 cursor-not-allowed">
                  <i class="el-icon-delete" />
                  {{ antsT('删除') }}
                </span>
                <el-divider direction="vertical" />

                <span class="text-ants-text-5 cursor-not-allowed">
                  <i class="el-icon-caret-bottom" />
                  {{ antsT('更多') }}
                </span>
              </div>

              <div v-else-if="isShowForm(row.record_id)">
                <ants-button
                  type="primary"
                  size="mini"
                  @click="submitForm(row)"
                  :loading="btnLoading"
                  icon="el-icon-check"
                  text="保存"
                />
                <ants-button
                  type="info"
                  size="mini"
                  :disabled="btnLoading"
                  @click="hideForm(row)"
                  text="取消"
                />
                <el-tooltip
                  v-show="row.record_id != expandRowId"
                  :enterable="false"
                  :content="antsT('查看提示信息')"
                  placement="top"
                  effect="dark"
                >
                  <i
                    class="el-icon-question absolute text-primary cursor-pointer"
                    style="top: 15px; right: 8px; font-size: 16px"
                    @click="showExpandTips(row)"
                  />
                </el-tooltip>
              </div>

              <div v-else class="flex items-center">
                <template v-if="($root.custom || {}).monitors">
                  <span
                    v-if="row.record_type === 'A'"
                    class="cursor-pointer"
                    :class="row.amonitorId ? 'text-primary' : 'text-success'"
                    @click="toAMonitors(row)"
                  >
                    <i class="el-icon-monitor" />
                    {{ antsT('A监控') }}
                  </span>

                  <span v-else class="text-ants-text-5 cursor-not-allowed">
                    <i class="el-icon-monitor" />
                    {{ antsT('A监控') }}
                  </span>
                  <el-divider direction="vertical" />
                </template>

                <span
                  class="text-primary cursor-pointer"
                  @click="showUpdateForm(row, 'topRef')"
                  v-if="canEditRecord(row)"
                >
                  <i class="el-icon-edit" />
                  {{ antsT('修改') }}
                </span>
                <span v-else>--</span>
                <span v-if="!row.shareEntity">
                  <el-divider direction="vertical" />

                  <span
                    class="text-primary cursor-pointer"
                    @click="singleDelete(row)"
                  >
                    <i class="el-icon-delete" />
                    {{ antsT('删除') }}
                  </span>

                  <el-divider direction="vertical" />

                  <el-dropdown
                    placement="bottom"
                    :show-timeout="100"
                    @command="clickMore"
                  >
                    <span class="text-primary cursor-pointer">
                      <i class="el-icon-caret-bottom" />
                      {{ antsT('更多') }}
                    </span>

                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item
                        :command="handleCommand('authorize', row)"
                        >{{ antsT('域名授权') }}</el-dropdown-item
                      >
                      <el-dropdown-item
                        :command="handleCommand('ddns', row)"
                        v-if="
                          row.record_type === 'A' || row.record_type === 'AAAA'
                        "
                        >{{ antsT('ddns') }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                </span>
              </div>
            </template>
          </ants-table-column>
        </ants-table>
      </el-form>
    </el-card>

    <!-- 域名授权 -->
    <CreateDialog ref="CreateDialogRef" @refresh="getTableData" />

    <!-- ddns弹框 -->
    <ddnsDialog ref="ddnsDialogRef" />

    <!-- 轮询管理 -->
    <!-- <PollingDialog ref="PollingDialogRef" @refresh="getTableData" /> -->

    <!-- 监控设置 -->
    <!-- <AMonitorUpdateDialog
      ref="AMonitorUpdateDialogRef"
      @refresh="getTableData"
      isRecordPage
    /> -->
  </div>
</template>

<script>
// 组件
import ExpandTips from './ExpandTips'
import TypeSelect from './TypeSelect'
import LineCascader from './LineCascader'
import formRules from './rules.js'
import CreateDialog from './CreateDialog'
import ddnsDialog from './ddnsDialog'

import md5 from 'js-md5'

// import PollingDialog from './PollingDialog'
// import AMonitorUpdateDialog from '@/v2/dns_common/views/a-monitor/task/UpdateDialog'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getList,
  doCreate,
  switchStatus,
  bulkDelete
} = require(`@/v2/${PROCESS_NAME}/api/dns/record`)
const { saveRule } = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const checkCNAME =
  /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*(\.[a-zA-Z0-9]{2,20})$/

// 提示信息上面的小三角对应的 left
const tipsSpanLeftObj = {}

// 基础表单数据
const defaultForm = {
  // 记录ID
  record_id: '',
  // 主机记录
  top: '',
  // 记录类型
  record_type: 'A',
  // 记录值
  value: '',
  // 权重
  weight: '1',
  // MX优先级
  mx: '1',
  // TTL
  ttl: '600',
  // TCP 开关
  tcp: 0,
  // 线路对象
  line: {
    // 线路编码
    record_line: '100000000-999999999',
    // 线路ID
    record_line_id: 1,
    // 线路名称
    record_line_name: '默认',
    // 线路类型，1表示官方线路，2表示自定义线路
    linetype: 1
  }
}

export default {
  components: {
    ExpandTips,
    TypeSelect,
    LineCascader,
    CreateDialog,
    ddnsDialog
    // PollingDialog,
    // AMonitorUpdateDialog
  },
  props: {
    domainInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // 是否为管理端
      isAdmin: PROCESS_NAME === 'dns_admin',
      // 域名ID
      id: this.$route.params.id,
      // 当前解析域名
      domain: this.$route.params.domain || '',
      btnLoading: false,
      loading: false,
      total: 0,
      queryInfo: {
        domain_id: this.$route.params.id || null,
        // 检索主机记录
        top: '',
        order: 'asc',
        // 检索记录值
        value: '',
        page: 1,
        limit: 20
      },
      selectArr: [],
      tableData: [],
      // 用于前端分页的临时数组
      tableDataArr: [],
      // 默认线路
      defaultLine: {
        ...defaultForm.line
      },
      // 表格表单数据
      form: {
        ...defaultForm
      },
      formRules,
      // 当前展开行记录ID
      expandRowId: null
    }
  },
  computed: {
    // 表单显示
    isShowForm() {
      return (recordId) => {
        return this.form.record_id === recordId
      }
    },
    // 是否有权限修改
    canEditRecord() {
      return (row) => {
        return (
          (row.shareEntity && row.shareEntity.permission === 'w:r') ||
          !row.shareEntity
        )
      }
    },
    // 是否为系统默认的 NS 记录
    isNsRecord() {
      // NS记录后台允许删除，前台不允许删除
      return (row = {}, idx) => {
        if (this.isAdmin) return false

        // 记录类型不为 NS，则允许修改
        if (row.record_type != 'NS') return false

        // if (idx > 2) return false
        // 如果为添加记录，则允许修改
        if (this.form.record_id === 'add' && idx === 0) return false

        // 其他的则不允许修改
        return true
      }
    },

    // 禁用 监控、轮询，只有 A、AAAA、CNAME 记录才能开启
    isDisabledPoll() {
      return (recordType) => {
        return !['A', 'AAAA', 'CNAME'].includes(recordType)
      }
    }
  },
  created() {
    // 获取域名信息
    this.$emit('getDomainInfo')
    this.getTableData()
  },
  mounted() {
    // 获取展开信息小箭头left偏移量
    this.$nextTick(() => {
      const allThNode = document.querySelectorAll(
        '.el-table__header-wrapper th'
      )

      // 输入框对应的表格列索引
      const keyObj = {
        3: 'top',
        4: 'record_type',
        5: 'line',
        6: 'value',
        7: 'weight',
        8: 'mx',
        9: 'ttl'
      }

      Object.keys(keyObj).forEach((key) => {
        const letVal =
          allThNode[key].offsetLeft + allThNode[key].offsetWidth / 2 - 13
        tipsSpanLeftObj[keyObj[key]] = letVal
      })
    })
  },
  destroyed() {},
  methods: {
    rowKey(row) {
      return row.record_id + row.value
    },

    // 选择更多下拉框内容
    async clickMore(command) {
      switch (command.flag) {
        // 域名授权
        case 'authorize':
          console.log('域名授权', command, this.domain)
          this.showCreateDialogRef(command.row)
          break
        // 删除
        case 'ddns':
          // 弹框 提示
          this.$refs.ddnsDialogRef.showDialog(
            this.getCommandParams(command.row)
          )
          break
      }
    },
    // 域名授权弹框
    showCreateDialogRef(row = {}) {
      this.$refs.CreateDialogRef.showDialog({
        ...row,
        domain: this.domain
      })
    },

    // ddns 确认框
    getCommandParams(row) {
      const url = window.location.origin
      const value = `${this.$route.params.userId}:${this.$route.params.id}:${this.domain}`
      const key = md5(value)
      // 获取当前url
      // 获取域名
      const domain = `${row.top}.${this.domain}`
      const apiUrl = `/app/capi/ddns/v1?domain=${domain}&key=${key}`
      return {
        url,
        apiUrl
      }
      // return `${url}/app/capi/ddns/v1?domain=${domain}&key=${key}`
    },
    /**
     *  获取下拉框指令参数，用于自定义参数
     */
    handleCommand(flag, row) {
      return {
        flag,
        row
      }
    },

    /**
     * @description: 获取记录数据
     */

    getTableData() {
      this.loading = true

      // 前台是调用的域名ID
      getList({
        // 后台
        domain: this.domain,
        // 前台
        id: this.id,
        ...this.queryInfo
      })
        .then((res) => {
          const { data } = res
          if (data.code !== 1) return
          // 解析json 字符串
          const recordArr = data.objData || []
          // data.data.forEach((item, idx) => {
          //   const obj = JSON.parse(item + '')
          //   // 过滤掉 soa
          //   if (!{}.hasOwnProperty.call(obj, 'soa')) {
          //     recordArr.push(obj)
          //   }
          // })

          // this.tableDataArr = recordArr.sort(this.compareNum)
          // this.getHandleChange(this.queryInfo.page, this.queryInfo.limit)
          // this.total = this.tableDataArr.length || 0
          console.log('recordArr', recordArr)
          this.total = data.total || 0
          this.tableData = recordArr.sort(this.compareNum)

          // 关闭所有展开行信息
          this.expandRowId = null
          // 重置表单数据
          this.resetForm()
        })
        .catch((err) => err)
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * @description: 列表按记录类型排序, ns 记录要排在首位
     */

    compareNum(x, y) {
      // NS 排在最前面
      if (y.record_type == 'NS') return 1
      if (x.record_type == 'NS') return -1

      // 按记录类型排序
      if (x.record_type < y.record_type) return -1
      if (x.record_type > y.record_type) return 1

      // 按主机记录排序
      if (x.record_type == y.record_type) {
        if (x.top < y.top) return -1
        if (x.top > y.top) return 1
        return 0
      }
    },

    /**
     * @description: 显示展开行提示信息
     */

    toggleExpand(row = {}, key = 'top') {
      // 如果已经点击了隐藏提示信息则不再展开
      if (!this.expandRowId) return
      // 关闭当前展开项，并打开当前行展开信息
      this.expandRowId = row.record_id

      this.$nextTick(() => {
        // 获取对应的提示信息
        this.$refs.ExpandTipsRef.getExpandTips(key, tipsSpanLeftObj[key])
      })
    },

    // 隐藏提示信息
    hideExpandTips() {
      this.expandRowId = null
    },

    // 显示提示信息
    showExpandTips(row = {}) {
      this.expandRowId = row.record_id
      this.toggleExpand(row)
    },

    // 自定义分页
    getHandleChange(page, size) {
      this.tableData = this.tableDataArr.slice((page - 1) * size, page * size)
    },

    // 设置默认线路的值
    setDefaultLine(lineObj = {}) {
      this.defaultLine = lineObj
    },

    /**
     * @description: 添加-修改数据，修改一行或者新增一行数据后，点击确认
     */

    submitForm(row) {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return

        if (
          this.form.record_type === 'CNAME' &&
          !checkCNAME.test(this.form.value)
        ) {
          this.$message.error('CNAME 记录值格式有误')
          return false
        }
        if (row.record_id === 'add') {
          // 如果为添加记录
          // 如果主机记录前面没有添加过，且选择的线路非默认线路，将自动调整为默认线路
          let isNewRecord = false
          if (
            this.form.line.record_line_id != this.defaultLine.record_line_id
          ) {
            isNewRecord = true
            this.tableData.some((e) => {
              if (e.top === this.form.top) {
                isNewRecord = false
                return true
              }
            })
          }

          if (isNewRecord) {
            const confirmResult = await this.$confirm(
              this.form.top + ' 还未添加默认线路的解析，将自动调整为默认线路',
              '添加解析',
              {
                center: true,
                type: 'info'
              }
            ).catch((err) => err)

            if (confirmResult !== 'confirm') {
              return this.$msg.info('已取消添加解析')
            }

            // 将线路调整为默认线路
            this.form.line = this.defaultLine
          }
        }

        // 如果记录类型为显性URL或者隐性URL，记录值必须以http://或者https://开头，如果不是则自动添加
        if (
          this.form.record_type === 'XURL' ||
          this.form.record_type === 'URLFWD'
        ) {
          const { value } = this.form
          if (!value.startsWith('http://') && !value.startsWith('https://')) {
            this.form.value = 'https://' + this.form.value
          }
        }

        // 发起添加-修改请求
        this.btnLoading = true
        try {
          const res = await this.requestUpdateRecord(this.form)
          if (res.code !== 1) return
          this.$msg.success('保存成功')
          this.getTableData()
        } finally {
          this.btnLoading = false
        }
      })
    },

    /**
     * @description: 添加修改记录发起请求
     */

    async requestUpdateRecord(row) {
      const infoObj = {
        // 操作类型
        operation_type: row.operation_type,
        // 当前记录ID,添加时为空
        record_id: row.record_id === 'add' ? null : row.record_id,
        // 主机记录
        top: row.top.trim(),
        // 记录类型
        record_type: row.record_type,
        // 记录值
        value: row.value,
        // 权重
        weight: row.weight + '',
        // mx，记录类型 = MX 才有
        mx: row.record_type === 'MX' ? row.mx + '' || '1' : '0',
        // ttl
        ttl: row.ttl + '',
        // tcp, 0为关闭，1为开启
        tcp: row.tcp,

        /* =======================
         *  线路值 用于回显
         * ========================
         */

        // 线路code值
        record_line: row.line.record_line,
        // 线路ID
        record_line_id: row.line.record_line_id,
        // 线路名称
        record_line_name: row.line.record_line_name,
        // 线路类型，1为已有线路，2为自定义线路
        linetype: row.line.linetype,
        // 线路绑定值，用于回显
        line: row.line
      }

      const { data: res } = await doCreate({
        id: this.id,
        domain: this.domain,
        info: this.isAdmin ? infoObj : JSON.stringify(infoObj)
      })
      return res
    },

    /**
     * @description: 点击删除记录
     */

    async singleDelete(row) {
      const result = await this.$doDelete({
        tag: '记录'
      })
      if (!result) return

      const infoObj = {
        operation_type: 'delete',
        record_type: row.record_type,
        record_id: row.record_id,
        top: row.top,
        record_line_id: row.record_line_id, // 线路ID
        linetype: row.linetype // 线路类型，1为已有线路，2为自定义线路
      }

      const { data: res } = await doCreate({
        id: this.id,
        domain: this.domain,
        info: this.isAdmin ? infoObj : JSON.stringify(infoObj)
      })

      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.getTableData()
    },

    /**
     * @description: TCP开关
     */

    async changeTCP(row, switchRef) {
      // 如果为添加则不发起请求
      if (row.record_id === 'add') return

      this.$refs[switchRef].loading = true
      row.operation_type = 'update'
      const res = await this.requestUpdateRecord(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.tcp = row.tcp === 1 ? 0 : 1
        return
      }
      this.$msg.success('操作成功')
      this.getTableData()
    },

    // 开启-暂停解析
    async changeStatus(row, switchRef) {
      if (row.status === 3) {
        const confirmResult = await this.$confirm(
          '此操作将暂停解析该记录，是否继续？',
          '暂停解析',
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'error'
          }
        ).catch((err) => err)

        if (confirmResult !== 'confirm') {
          row.status = 1
          this.$msg.info('已取消操作')
          return
        }
      }

      this.$refs[switchRef].loading = true
      try {
        const { data: res } = await switchStatus({
          ids: row.id,
          status: row.status
        })
        if (res.code !== 1) {
          row.status = row.status === 1 ? 3 : 1
          return
        }
        this.$msg.success('操作成功')
      } finally {
        this.$refs[switchRef].loading = false
      }
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm,
        line: this.defaultLine // 默认线路
      }
      this.$refs.formRef && this.$refs.formRef.resetFields()
    },

    /**
     * @description: 点击添加记录按钮，表格第一行显示添加记录输入框
     *  1、表格输入框，一次只显示一行为输入框
     *  2、点击添加时默认显示提示信息，点击修改时默认不显示提示信息
     *  3、添加和修改都可以点击 显示和隐藏提示信息
     */
    showCreateForm() {
      // 限制一次只允许添加一行
      if (this.tableData.length && this.tableData[0].record_id === 'add') {
        return
      }
      this.btnLoading = false

      // 给 form 赋初始值
      this.form = {
        ...defaultForm,
        // 记录ID
        record_id: 'add',
        // 操作类型，表示添加
        operation_type: 'add',
        // 已设置的默认TTL值
        ttl: (this.domainInfo.confDefaultTtl || 600) + '',
        line: this.defaultLine // 默认线路
      }

      // 表格添加第一行
      this.tableData.unshift({
        status: 0, // 状态
        ...this.form,
        ...this.defaultLine
      })

      // 关闭当前展开项，并打开当前添加行展开信息
      this.expandRowId = 'add'

      // 使输入框获取焦点
      this.$nextTick(() => {
        this.$refs.topRef.focus()
      })
    },

    /**
     * @description: 修改表单显示：显示表格一整行为输入框形式
     */
    showUpdateForm(row, inputRef) {
      // 关闭当前展开项，并打开当前行展开信息
      this.expandRowId = null
      this.btnLoading = false
      // 如果已打开行为新增行，则移除新增行，解除禁止添加记录按钮
      if (this.form.record_id === 'add') {
        this.tableData.shift()
      }

      // const lineObj = row.line || {}
      // 给 tabelForm 赋值
      this.form = {
        operation_type: 'update', // 操作类型，表示修改
        record_id: row.record_id,
        top: row.top,
        record_type: row.record_type,
        value: row.value,
        weight: row.weight || '1',
        mx: row.mx || '1',
        ttl: row.ttl,
        tcp: row.tcp,
        line: {
          record_line: row.record_line, // 线路编码
          record_line_id: +row.record_line_id, // 线路ID
          record_line_name: row.record_line_name, // 线路名称
          linetype: +row.linetype // 线路类型，1表示官方线路，2表示自定义线路
        }
      }
      console.log(this.form.line)

      // 使当前点击的输入框获取焦点
      this.$nextTick(() => {
        if (inputRef === 'cascaderRef') {
          // 如果为线路类型级联选择器
          this.$refs[inputRef].$children[0].$refs.input.focus()
          this.$refs[inputRef].$children[0].toggleDropDownVisible(true)
        } else {
          this.$refs[inputRef].focus()
        }
      })
    },

    // 修改一行或者新增一行数据后，点击取消
    hideForm(row) {
      this.expandRowId = null // 关闭展开行，重要，可以触发元素切换操作
      // 如果为新添加的记录，然后点击取消，则直接删除该行，解除禁止添加记录按钮
      if (row.record_id === 'add') {
        this.tableData.shift()
      }
      this.resetForm()
    },

    // 线路类型改变
    changeSort(row, val) {
      // 如果选择的记录类型为MX，则显示mx输入框，否则隐藏
      row.record_type = val
      // 记录类型改变，移除记录值验证信息
      this.$refs.valueFormItemRef.clearValidate()
    },

    // 监听limit 改变事件
    // handleSizeChange(newSize) {
    //   this.queryInfo.limit = newSize
    //   this.getHandleChange(this.queryInfo.page, newSize)
    // },
    // // 监听 页码值 改变事件
    // handleCurrentChange(newPage) {
    //   this.queryInfo.page = newPage
    //   this.getHandleChange(newPage, this.queryInfo.limit)
    // },

    // 设置表格状态，用于设置 NS记录状态
    tableRowClassName({ row, rowIndex }) {
      if (this.isAdmin) return ''
      if (row.record_type != 'NS') return ''
      if (rowIndex > 2) return ''
      if (this.form.record_id === 'add' && rowIndex === 0) return ''
      return 'ns-record-row'
    },

    // 复选框是否禁用
    isSelectable(row, index) {
      // NS记录不允许修改
      return row.record_type != 'NS'
    },

    // 轮询管理
    toPolling(row) {
      this.$refs.PollingDialogRef.show(row)
    },

    // 监控管理
    toAmonitor(row) {
      this.$refs.AMonitorUpdateDialogRef.show({
        rdataId: row.id,
        server_name: row.top + '.' + this.domain,
        rdata: row.value
      })
    },

    // 前往GTM
    toGtm(row = {}) {
      this.$router.push({
        name: 'gtmRule',
        query: {
          taskId: row.taskId,
          type: row.record_type
        }
      })
    },

    // 前往或者添加A监控
    async toAMonitors(row = {}) {
      if (row.record_type !== 'A') return

      if (!row.amonitorId) {
        this.$confirm(
          '还未为此记录添加A监控，是否立即添加？',
          '是否添加A监控',
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'info',
            confirmButtonText: '立即添加',
            beforeClose: async (action, instance, done) => {
              if (action === 'confirm') {
                instance.confirmButtonLoading = true
                instance.confirmButtonText = '加载中...'

                try {
                  const { data: res } = await saveRule({
                    id: 0,
                    domain: this.domain,
                    domainId: this.queryInfo.domain_id,
                    top: row.top,
                    recordCount: 0, // 不传
                    recordType: row.record_type,
                    status: row.status,
                    taskMode: 'no-change',
                    userId: this.domainInfo.userid,
                    username: ''
                  })
                  if (res.code !== 1) {
                    instance.confirmButtonText = '添加失败'
                    return
                  }

                  instance.confirmButtonText = '添加成功'
                  this.$msg.success('添加成功')
                  done()

                  this.goAmonitors((res.data || {}).id)
                } finally {
                  instance.confirmButtonLoading = false
                }
              } else {
                done()
              }
            }
          }
        ).catch((err) => err)

        return
      }

      this.goAmonitors(row.amonitorId)
    },

    goAmonitors(id) {
      this.$router.push({
        path: '/dns/a-monitor/monitors/details',
        query: {
          id
        }
      })
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 批量操作
    toBulkMark(method) {
      this[method]()
    },

    // 批量开启-暂停
    async toBulkUpdate(status) {
      const txt = status == 1 ? '开启' : '暂停'
      const selectLength = this.selectArr.length
      if (!selectLength) {
        this.$msg.info('请选择需要操作的解析记录')
        return
      }

      this.$confirm(
        `该操作将批量${txt} ${selectLength} 条解析记录，是否继续？`,
        `批量${txt}解析记录`,
        {
          dangerouslyUseHTMLString: true,
          center: true,
          type: 'info',
          confirmButtonText: txt + '解析',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '加载中...'

              try {
                const { data: res } = await switchStatus({
                  ids: this.selectArr.map((e) => e.id) + '',
                  status
                })

                if (res.code !== 1) {
                  instance.confirmButtonText = '重试'
                  return
                }

                instance.confirmButtonText = '操作成功'
                this.$msg.success('操作成功')
                this.selectArr = []
                this.getTableData()
                done()
              } finally {
                instance.confirmButtonLoading = false
              }
            } else {
              done()
            }
          }
        }
      ).catch((err) => err)
    },

    toBulkStart() {
      this.toBulkUpdate(1)
    },

    toBulkClose() {
      this.toBulkUpdate(3)
    },

    // 批量删除
    async toBulkDel() {
      const selectLength = this.selectArr.length
      if (!selectLength) {
        this.$msg.info('请选择需要删除的解析记录')
        return
      }

      this.$confirm(
        `该操作将批量删除 ${selectLength} 条解析记录，是否继续？`,
        '批量删除解析记录',
        {
          dangerouslyUseHTMLString: true,
          center: true,
          type: 'info',
          confirmButtonText: '批量删除',
          beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '加载中...'

              try {
                const { data: res } = await bulkDelete({
                  ids: this.selectArr.map((e) => e.id) + ''
                })

                if (res.code !== 1) {
                  instance.confirmButtonText = '重试'
                  return
                }

                instance.confirmButtonText = '删除成功'
                this.$msg.success('删除成功')
                this.selectArr = []
                this.getTableData()
                done()
              } finally {
                instance.confirmButtonLoading = false
              }
            } else {
              done()
            }
          }
        }
      ).catch((err) => err)
    }
  }
}
</script>
<style lang="scss">
.dns-record-box {
  .el-button {
    transition: all 0s ease 0s !important;
  }
  .table-form {
    .cell {
      overflow: visible;
    }
    .el-form-item__content {
      line-height: 32px;
    }
    .el-form-item {
      margin: 0;
    }
    .el-form-item__error {
      white-space: nowrap;
      top: -44px;
      left: 50%;
      transform: translateX(-50%);
      -ms-transform: translateX(-50%);
      -moz-transform: translateX(-50%);
      -webkit-transform: translateX(-50%);
      -o-transform: translateX(-50%);
      padding: 12px;
      border-radius: 4px;
      background-color: theme('colors.ants-bg-5');
      text-align: center;
      font-size: 14px;
      z-index: 9;
    }
    .el-form-item__error::before {
      content: '';
      position: absolute;
      top: 38px;
      left: 50%;
      margin-left: -8px;
      border: 8px solid rgba(0, 0, 0, 0);
      border-top-color: theme('colors.ants-bg-5');
    }
  }
  .el-table__body-wrapper {
    padding-top: 50px;
    margin-top: -50px;
  }

  .line-table-column {
    ::-webkit-input-placeholder {
      /* WebKit, Blink, Edge */
      color: theme('colors.ants-text-2');
    }

    :-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: theme('colors.ants-text-2');
    }

    ::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: theme('colors.ants-text-2');
    }

    :-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: theme('colors.ants-text-2');
    }
  }

  .el-switch__core {
    width: 34px !important;
    height: 16px;
  }
  .el-switch__core:after {
    height: 12px;
    width: 12px;
  }
  .el-switch.is-checked .el-switch__core::after {
    margin-left: -13px;
  }

  .el-table__body-wrapper {
    .hover-div {
      cursor: pointer;
      min-height: 22px;
      border: 1px solid rgba(0, 0, 0, 0);
      border-radius: 4px;
      transition: all 0.3s;
      position: relative;
      &:hover {
        border-color: theme('colors.ants-border-1');
        padding-left: 5px;
      }
    }
    .el-input__inner {
      padding: 0 5px;
    }
  }
  .el-table__expand-icon {
    display: none;
  }
  .el-table__expanded-cell[class*='cell'] {
    padding: 0;
  }
}

.ns-record-row {
  cursor: not-allowed;
  position: relative;
  &::after {
    content: '该 NS 记录为系统初始记录，为了确保解析的安全稳定，不支持修改该记录，如记录值有误可操作重置。';
    // white-space: pre;
    display: none;
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 0;
    transform: translate(-50%, -100%);
    width: auto;
    line-height: 22px;
    padding: 5px 10px;
    background-color: #242d4e;
    color: #fefefe;
    border-radius: 6px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.06);
    // animation: nsFadein 0.5s;
  }
  &:hover {
    &::after {
      display: block;
    }
  }
  // @keyframes nsFadein {
  //   0% {
  //     transform: scale(0.5);
  //     transform: translate(-50%, -40%);
  //   }
  //   100% {
  //     transform: scale(1);
  //     transform: translate(-50%, -40%);
  //   }
  // }
}
</style>

<style lang="scss" scoped></style>
