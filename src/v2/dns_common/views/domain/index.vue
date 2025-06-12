<template>
  <div class="domain-list-box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="
          isAdmin
            ? [
                {
                  name: '检索用户',
                  key: 'user',
                  value: queryInfo.user
                },
                {
                  name: '检索域名',
                  key: 'domain',
                  value: queryInfo.domain
                }
              ]
            : [
                {
                  name: '检索域名',
                  key: 'domain',
                  value: queryInfo.domain
                }
              ]
        "
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :loading="$root.loading"
            :disabled="btnLoading"
            @click="toAdd()"
            text="添加域名"
            class="mr-sm"
          />
          <!-- <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="toBulkDel"
            text="批量删除"
          /> -->

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
              <el-dropdown-item command="toBulkPush">
                <i class="el-icon-top"></i>
                {{ antsT('全部推送') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>

        <template slot="inputs">
          <ants-select
            v-model="queryInfo.whoisStatus"
            size="small"
            style="width: 120px"
            class="mr-sm"
            placeholder="查询状态"
            @change="toQuery()"
          >
            <ants-option value="all" label="转入状态" />
            <ants-option :value="1" label="正常" />
            <ants-option :value="0" label="错误" />
          </ants-select>

          <ants-select
            v-if="!isAdmin"
            v-model="queryInfo.groupId"
            size="small"
            placeholder="请选择"
            style="width: 140px"
            class="mr-sm"
            @change="getTableData"
          >
            <ants-option label="全部分组" :value="0" />
            <ants-option
              v-for="item in groupList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ants-select>
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        empty-text="还没有任何域名，赶紧添加"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
        :row-class-name="tableRowClassName"
      >
        <ants-table-column
          type="selection"
          :selectable="isCheckca"
          align="center"
          width="45"
        />

        <ants-table-column width="80" label="ID" prop="id" />

        <ants-table-column label="域名" min-width="140" prop="domain">
          <template #default="{ row }">
            <div class="cursor-pointer text-primary" @click="toRecord(row)">
              <span>{{ row.domain }}</span>
              <el-tag size="mini" class="ml-sm" v-if="row.isTopDomain === 0"
                >子域名</el-tag
              >
              <el-tag size="mini" class="ml-sm" v-if="row.isShare === 1"
                >共享</el-tag
              >
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="状态" prop="status" min-width="110">
          <template #default="{ row }">
            <el-popover
              v-if="row.whoisStatus === 1 && row.status === 1"
              placement="top"
              width="220"
              trigger="hover"
            >
              <ul>
                <li class="text-sm text-success mb-sm">
                  {{ antsT('更新时间') }}：{{ row.ckTime || '-' }}
                </li>

                <li>{{ antsT('DNS解析正常') }}</li>

                <li class="flex justify-between items-center mt-sm">
                  <span></span>
                  <span
                    class="el-icon-refresh cursor-color"
                    @click="refreshWhois(row)"
                    >{{ antsT('刷新') }}</span
                  >
                </li>
              </ul>
              <span slot="reference">
                <span class="text-success el-icon-success cursor-pointer">
                  {{ antsT('正常') }}</span
                >
              </span>
            </el-popover>

            <el-tooltip
              class="item"
              effect="light"
              :content="antsT('域名已暂停解析，所有解析记录停止生效')"
              placement="top"
              v-else-if="row.whoisStatus === 1 && row.status === 0"
            >
              <span class="text-error el-icon-remove">
                {{ antsT('已暂停解析') }}</span
              >
            </el-tooltip>

            <el-popover placement="top" width="220" trigger="hover" v-else>
              <ul>
                <li class="text-sm text-error mb-sm">
                  {{ antsT('更新时间') }}：{{ row.ckTime || '-' }}
                </li>
                <li>{{ antsT('请正确设置 DNS 服务器为') }}</li>
                <li
                  class="my-sm"
                  v-for="(item, idx) in row.nsRecordsArr"
                  :key="idx"
                >
                  {{ item }}
                </li>

                <li class="flex justify-between items-center">
                  <span
                    class="text-primary cursor-pointer"
                    @click="toWhois(row)"
                    >{{ antsT('查看详情') }}</span
                  >
                  <span
                    class="el-icon-refresh cursor-color"
                    @click="refreshWhois(row)"
                    >{{ antsT('刷新') }}</span
                  >
                </li>
              </ul>
              <span slot="reference">
                <span
                  class="text-error el-icon-error"
                  @click="toWhois(row)"
                  style="cursor: pointer"
                >
                  {{ antsT('DNS 错误') }}</span
                >
              </span>
            </el-popover>
          </template>
        </ants-table-column>

        <ants-table-column label="记录数" prop="recordCount" min-width="80">
          <template #default="{ row }">
            {{ row.recordCount || 0 }} {{ antsT('条') }}
          </template>
        </ants-table-column>

        <ants-table-column label="备注信息" min-width="140" prop="remarks">
          <template #default="{ row }">
            <div>{{ row.remarks || '-' }}</div>
          </template>
        </ants-table-column>

        <ants-table-column label="套餐" min-width="140">
          <template #default="{ row }">
            <div v-if="row.consume">
              <div>
                <span>
                  {{ antsT((row.consume.product || {}).productName) }}
                </span>
                <el-tooltip
                  v-if="!isAdmin"
                  effect="light"
                  :content="antsT('升级套餐')"
                  placement="top"
                >
                  <span
                    class="aicon icon-double-up text-success cursor-pointer align-middle"
                    style="font-size: 14px"
                    @click="toUpgradePlan(row)"
                  ></span>
                </el-tooltip>
              </div>
              <div>
                {{
                  (row.consume.product || {}).productUnitPrice == 0
                    ? '永久有效'
                    : (row.consume.consume || {}).effectEndTime
                }}
              </div>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column
          v-if="isAdmin"
          label="用户"
          prop="username"
          min-width="140"
        >
          <template #default="{ row }">
            <div>ID：{{ row.userid }}</div>
            <ants-copy :text="(row.userInfo || {}).username" />
          </template>
        </ants-table-column>

        <ants-table-column label="异常监控" min-width="80">
          <template #default="{ row }">
            <span v-if="!row.errorInfo">-</span>

            <template v-else>
              <el-popover v-if="isAdmin" placement="top" width="200">
                <ul>
                  <li class="font-semibold">QPS_DEFEND</li>
                  <li class="my-sm">
                    UDP：<span class="text-warning">{{
                      JSON.parse(row.errorInfo.qps_defend || '{}').udp
                    }}</span>
                  </li>
                  <li class="my-sm">
                    {{ JSON.parse(row.errorInfo.qps_defend || '{}').date }}
                  </li>
                  <li>
                    <ants-button
                      size="mini"
                      type="success"
                      :loading="reLeaseLoading"
                      @click="releaseDomainError(row.id)"
                      text="解除异常"
                    />
                  </li>
                </ul>
                <span slot="reference">
                  <span
                    class="text-warning el-icon-warning"
                    style="cursor: pointer"
                  >
                    {{ antsT('发现异常') }}</span
                  >
                </span>
              </el-popover>

              <span v-else class="text-warning el-icon-warning">
                {{ antsT('发现异常') }}</span
              >
            </template>
          </template>
        </ants-table-column>

        <ants-table-column label="锁定" min-width="70">
          <template #default="{ row }">
            {{ row.locked === 1 ? '已锁定' : '正常' }}
          </template>
        </ants-table-column>

        <ants-table-column label="暂停/开启" width="80">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#DCDFE6"
              active-color="#13ce66"
              :ref="`tableSwitchRef${$index}`"
              @change="switchStatus(row, `tableSwitchRef${$index}`)"
              :disabled="row.isShare === 1"
            />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="140">
          <template #default="{ row }">
            <span
              class="cursor-pointer text-primary text-df"
              @click="toRecord(row)"
              >{{ antsT('解析') }}</span
            >
            <el-divider
              direction="vertical"
              v-if="row.isShare === 0"
            ></el-divider>

            <el-dropdown
              placement="bottom"
              @command="toMore"
              v-if="row.isShare === 0"
            >
              <span class="cursor-pointer text-primary text-df">
                {{ antsT('更多') }} <i class="el-icon-caret-bottom" />
              </span>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, key) in {
                    toDomainSetting: '域名设置',
                    changeLocked: row.locked === 1 ? '解除锁定' : '锁定域名',
                    toDel: '删除域名',
                    toAddCDN: $mode[176] ? '添加CDN' : '',
                    toClient: isAdmin ? '客户端' : ''
                  }"
                  :key="key"
                  :command="handleCommand(key, row)"
                  >{{ antsT(item) }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加域名对话框 -->
    <AddDomainDialog ref="AddDomainDialogRef" @refresh="getTableData" />

    <!-- 查看域名解析状态对话框 -->
    <WhoisInfoDialog ref="WhoisInfoDialogRef" @refresh="getTableData" />

    <!-- 添加CDN站点对话框 -->
    <AddCdnDialog ref="AddCdnDialogRef" />

    <!-- 套餐升级对话框 -->
    <UpgradeDialog v-if="!isAdmin" ref="UpgradeDialogRef" />
  </div>
</template>

<script>
// 组件
import AddDomainDialog from './AddDomainDialog'
import AddCdnDialog from './AddCdnDialog'
import WhoisInfoDialog from './WhoisInfoDialog'
import UpgradeDialog from '@/v2/dns_users/components/UpgradeDialog'
// 管理端：前往客户端
import { goUserClientConsole } from '@/v2/dns_admin/api/account/user'
import { getLocation, openUrl } from '@/utils/env'
// 客户端：验证提示实名认证、绑定手机号
import { showTipsAlert } from '@/v2/dns_users/extra/computed'

const PROCESS_NAME = process.env.VUE_APP_NAME

// API
const {
  getList,
  doCreate,
  doUpdateDomainStatus,
  doBatchDeleteDomain,
  doUpdateDomainAttr,
  doUpdateDomainStatusBulk,
  doPushAll,

  // 管理端：解除异常API
  doReleaseDomain,
  // 客户端：获取分组列表API
  getDomainGroupList
} = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

export default {
  components: {
    AddDomainDialog,
    WhoisInfoDialog,
    AddCdnDialog,
    // 客户端：升级套餐
    UpgradeDialog
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      total: 0,
      queryInfo: {
        user: '',
        groupId: 0,
        whoisStatus: 'all',
        domain: this.$route.query.domain || '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      btnLoading: false,
      reLeaseLoading: false,
      selectArr: [],
      groupList: []
    }
  },
  created() {
    // 判断是否使用保存下来的分页数据
    if (this.$route.meta.flag && this.$route.meta.queryInfo) {
      this.queryInfo = this.$route.meta.queryInfo
    }
    this.getTableData()

    if (!this.isAdmin) {
      this.getGroupData()
    }
  },
  methods: {
    // 获取域名列表数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { whoisStatus } = this.queryInfo
        const { data: res } = await getList({
          ...this.queryInfo,
          whoisStatus: whoisStatus === 'all' ? undefined : whoisStatus
        })
        if (res.code !== 1) return

        const obj = res.data || {}
        this.total = obj.totalCount || 0
        this.tableData = (obj.list || []).map((item) => {
          return {
            ...item,
            nsRecordsArr: JSON.parse(item.nsRecords || '[]'),
            errorInfo:
              item.errorInfo &&
              item.errorInfo != '{}' &&
              JSON.parse(item.errorInfo)
          }
        })
      } finally {
        this.$root.loading = false
      }
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 复选框是否禁用
    isCheckca(row, index) {
      return true
    },

    // 表格状态
    tableRowClassName({ row }) {
      return row.locked === 1 ? 'domain-table--locked' : ''
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 查看解析状态详情，只允许 3 秒钟请求一次
    async toWhois(row) {
      this.$refs.WhoisInfoDialogRef.getWhoisInfo(row)
    },

    // 验证解析状态
    refreshWhois(row) {
      this.$refs.WhoisInfoDialogRef.refreshStatus(row.domain)
    },

    // 添加域名
    toAdd() {
      // 客户端：判断用户是否已实名认证、已绑定手机号
      if (!this.isAdmin) {
        const { isUnverified, isUnboundMobile } = this.$attrs
        if (
          showTipsAlert({
            isUnverified,
            isUnboundMobile,
            tag: '添加域名'
          })
        ) {
          return
        }
      }

      this.$refs.AddDomainDialogRef.showDialog()
    },

    // 开启-暂停解析
    async switchStatus(row, tableSwitchRef) {
      if (row.status === 0) {
        const confirmResult = await this.$confirm(
          '此操作将暂停解析域名“ <strong style="color: #F78989;"> ' +
            row.domain +
            ' </strong> ”，是否继续？',
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

      this.$refs[tableSwitchRef].loading = true
      try {
        const { data: res } = await doUpdateDomainStatus({
          domainId: row.id,
          status: row.status
        })
        if (res.code !== 1) {
          row.status = row.status === 1 ? 0 : 1
          return
        }
        this.$msg.success('操作成功')
      } finally {
        this.$refs[tableSwitchRef].loading = false
      }
    },

    // 点击域名前往记录管理
    toRecord(row) {
      // 保存当前分页数据，返回到当前页时直接显示
      this.$route.meta.queryInfo = this.queryInfo

      this.$router.push({
        name: 'DNSDomainRecord',
        params: {
          id: row.id,
          domain: row.domain,
          userId: row.userid,
          isShare: row.isShare
        }
      })
    },

    // 获取下拉框指令参数，用于自定义参数
    handleCommand(method, row) {
      return {
        method,
        row
      }
    },

    // 选择更多下拉框内容
    toMore({ method, row }) {
      this[method](row)
    },

    // 点击域名设置
    toDomainSetting(row) {
      // 保存当前分页数据，返回到当前页时直接显示
      this.$route.meta.queryInfo = this.queryInfo

      this.$router.push({
        name: 'DNSDomainSet',
        params: { id: row.id, domain: row.domain, userId: row.userid }
      })
    },

    // 锁定域名-解除锁定
    async changeLocked(row) {
      const txt = row.locked === 1 ? '解除锁定域名' : '锁定域名'
      const confirmResult = await this.$confirm(
        `此操作将${txt}：“ <strong style="color: #F78989;">
            ${row.domain}
          </strong> ”，是否继续？`,
        txt,
        {
          dangerouslyUseHTMLString: true,
          center: true,
          type: 'info'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        this.$msg.info('已取消操作')
        return
      }

      const { data: res } = await doUpdateDomainAttr({
        id: row.id,
        // 0 = 正常，1 = 锁定
        locked: row.locked === 1 ? 0 : 1
      })
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(`已${txt}`)
    },

    // 单个删除域名
    async toDel(row) {
      const result = await this.$doDelete({
        name: row.domain,
        tag: '域名'
      })
      if (!result) return

      this.btnLoading = true
      try {
        // 发起请求
        const { data: res } = await doCreate({
          domain: '',
          operation_type: 'delete',
          id: row.id
        })

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success('删除成功')
      } finally {
        this.btnLoading = false
      }
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
        this.$msg.info('请选择要操作的域名')
        return
      }

      this.$confirm(
        `该操作将批量${txt} ${selectLength} 条域名解析，是否继续？`,
        `批量${txt}域名解析`,
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
                const { data: res } = await doUpdateDomainStatusBulk({
                  domainIds: this.selectArr.map((e) => e.id) + '',
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
      this.toBulkUpdate(0)
    },

    // 批量删除域名
    async toBulkDel() {
      const selectLength = this.selectArr.length
      if (!selectLength) {
        this.$msg.info('请选择需要删除的域名')
        return
      }

      this.$confirm(
        `该操作将批量删除 ${selectLength} 条域名，是否继续？`,
        '批量删除域名',
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
                const ids = this.selectArr.map((e) => e.id) + ''
                const params = this.isAdmin
                  ? ids
                  : {
                      ids
                    }
                const { data: res } = await doBatchDeleteDomain(params)

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
    },

    // 全部推送
    async toBulkPush() {
      const { data: res } = await doPushAll()
      console.log('res', res)
    },

    // 添加CDN
    toAddCDN(row = {}) {
      this.$refs.AddCdnDialogRef.show(row)
    },

    /** ====================================
     *   客户端
     *  ====================================
     */
    // 客户端：获取分组数据
    async getGroupData() {
      const { data: res } = await getDomainGroupList({
        key: '',
        page: 1,
        limit: 50
      })
      if (res.code !== 1) return
      this.groupList = (res.data || {}).list || []
    },

    // 客户端：升级套餐
    toUpgradePlan(row) {
      const { consume = {}, domain } = row
      this.$refs.UpgradeDialogRef.getMealList({
        domain,
        id: consume.consume.id, // 当前产品ID
        productName: consume.product.productName,
        productUnit: consume.product.productUnit,
        productUnitPrice: consume.product.productUnitPrice,
        effectEndTime: consume.consume.effectEndTime
      })
    },

    /** ====================================
     *   管理端
     *  ====================================
     */
    // 管理端： 解除异常
    async releaseDomainError(domainId) {
      this.reLeaseLoading = true
      try {
        const { data: res } = await doReleaseDomain({
          domainId
        })
        if (res.code !== 1) return

        this.getTableData()
        this.$msg.success('成功解除异常')
      } finally {
        this.reLeaseLoading = false
      }
    },

    // 登录客户端后台
    async toClient({ userid, domain }) {
      this.btnLoading = true
      try {
        const { data: res } = await goUserClientConsole({
          userId: userid
        })
        if (res.code !== 1) return

        // token
        const TOKEN = res.token

        // 获取协议
        const { protocol, host, hostname } = getLocation()

        const rootPath = `${protocol}//${hostname}/users`

        // 拼接 url 地址
        const URL = `${rootPath}#/dns/domain/list/list?token=${TOKEN}&domain=${domain}`
        openUrl(URL)
      } finally {
        this.btnLoading = false
      }
    }
  },
  destroyed() {}
}
</script>
<style lang="scss">
.domain-list-box {
  .domain-table--locked {
    background-color: theme('colors.ants-bg-5');
    color: theme('colors.ants-text-5');
    .text-primary,
    .text-success,
    .text-error {
      color: theme('colors.ants-text-5');
    }
  }

  .dialog_box {
    .el-dialog__body {
      padding: 20px 60px;
    }
    .el-form-item__label {
      padding-right: 30px;
    }
  }

  .status_span {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  .el-button {
    .icon-bofang,
    .icon-zantingtingzhi {
      font-size: 12px;
    }
  }
}
</style>
