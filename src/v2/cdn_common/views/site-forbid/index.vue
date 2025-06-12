<template>
  <div class="animated fadeIn content-box" style="margin-top:0;">
    <ants-tab-card :tab-arr="tabArr" @change="changeTab" :active="activeTab">
      <div class="ants-tips_box mb-lg">
        {{
          antsT(
            '注意：默认只统计近一个小时内的数据，如需统计更长周期的数据，请联系我们。'
          )
        }}
      </div>

      <table-query-form
        :search-arr="
          isAdmin
            ? [
                {
                  name: '检索节点IP',
                  key: 'nodeIp',
                  value: queryInfo.nodeIp
                },
                {
                  name: '检索源IP',
                  key: 'sourceIp',
                  value: queryInfo.sourceIp
                },
                {
                  name: '检索站点',
                  key: 'serverName',
                  value: queryInfo.serverName
                }
              ]
            : []
        "
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="inputs" v-if="isAdmin">
          <ants-button
            size="small"
            type="info"
            text="条件释放"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="showReleaseDialog"
            class="mr-sm"
          />
        </template>

        <template slot="buttons">
          <div v-if="isAdmin">
            <ants-button
              size="small"
              type="success"
              text="刷新"
              icon="el-icon-refresh"
              :loading="$root.loading"
              :disabled="btnLoading"
              @click="getTableData"
              class="mr-sm"
            />
            <BatchHandle
              ref="BatchHandleRef"
              :select-arr.sync="selectArr"
              @refreshData="getTableData"
              @showBatchReleaseDialog="showBatchReleaseDialog"
            />
            <!-- <ants-button
              size="small"
              type="primary"
              text="批量解封IP"
              :loading="btnLoading"
              :disabled="$root.loading"
              @click="showBatchReleaseDialog"
            /> -->
            <!-- <ants-button
              size="small"
              type="info"
              text="全部释放"
              icon="el-icon-s-open"
              :loading="btnLoading"
              :disabled="$root.loading"
              @click="releaseForbid"
            /> -->
          </div>

          <div v-else class="flex">
            <ants-select
              v-model="queryInfo.serverName"
              placeholder="请输入域名进行查询"
              filterable
              remote
              clearable
              :remote-method="remoteMethod"
              :loading="loading"
              size="small"
              class="mr-sm"
              @change="changeSelectDomain"
            >
              <ants-option
                v-for="item in domainList"
                :key="item.id"
                :label="item.mainServerName"
                :value="item.mainServerName"
              />
            </ants-select>
            <ants-button
              size="small"
              type="primary"
              text="查询"
              icon="el-icon-search"
              :loading="$root.loading"
              @click="searchData"
            />
            <ants-button
              size="small"
              type="info"
              text="释放"
              icon="el-icon-s-promotion"
              :loading="$root.loading"
              @click="releaseSite"
            />
          </div>

          <!-- <ants-radio-group size="small" v-model="queryInfo.time">
            <ants-radio-button
              v-for="(item, key) in timeObj"
              :key="key"
              :label="key"
              :text="item"
            />
          </ants-radio-group> -->
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
        :page-sizes="[50, 100, 150, 200, 250]"
      >
        <ants-table-column type="selection" width="45" align="center">
        </ants-table-column>

        <ants-table-column
          :label="isAdmin ? '节点IP/目标站点' : '目标站点'"
          min-width="140"
        >
          <template #default="{ row }">
            <div v-if="isAdmin">{{ row.t }}</div>
            <div>{{ row.s }}</div>
          </template>
        </ants-table-column>

        <ants-table-column label="源IP地址" min-width="140">
          <template #default="{ row }">
            <el-tag size="mini" type="danger">{{ row.i }}</el-tag>
            <div>{{ row.c }}</div>
          </template>
        </ants-table-column>

        <ants-table-column label="处理方式" min-width="140">
          <template #default="{ row }">
            <div class="mb-1">
              <el-tag size="mini" type="primary" v-if="handleObj[+row.b]"
                >{{ handleObj[+row.b].mode }}
              </el-tag>
              <el-tag size="mini" type="primary" v-else>{{ row.b }} </el-tag>
            </div>
            <div>
              <span>（{{ row.n + 1 }}）</span>
              <span v-if="handleObj[+row.b]"
                >{{ handleObj[+row.b].info }} 【{{ row.e }}】</span
              >
              <span v-else>{{ row.e }} </span>
            </div>
          </template>
        </ants-table-column>

        <!-- <ants-table-column label="命中次数" min-width="100">
          <template #default="{ row }">
            <el-tag size="mini" type="danger">{{ row.sum }}</el-tag>
          </template>
        </ants-table-column> -->

        <ants-table-column label="请求方式" min-width="80">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ methodsObj[row.m] }}</el-tag>
          </template>
        </ants-table-column>
        <ants-table-column label="Length" prop="l" min-width="80">
        </ants-table-column>
        <ants-table-column label="URL" prop="u" min-width="140">
        </ants-table-column>

        <ants-table-column label="User-Agent" prop="ua" min-width="140">
          <template #default="{ row }">
            <div class="truncate-2">{{ row.ua }}</div>
          </template>
        </ants-table-column>

        <ants-table-column
          label="上报时间"
          sortable
          prop="date"
          min-width="140"
        >
          <template #default="{ row }">
            {{ sortDate(row.date) }}
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="120" auto-fixed>
          <template #default="{ row }">
            <el-dropdown
              placement="bottom"
              :show-timeout="100"
              @command="clickMore"
            >
              <ants-button
                plain
                type="primary"
                size="mini"
                style="margin-left:10px;padding:7px 9px;"
                text="操作"
                ><i class="el-icon-caret-bottom el-icon--right"></i
              ></ants-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  :command="handleCommand('release', row)"
                  :disabled="activeTab != 'forbid'"
                  >{{ antsT('解封') }}</el-dropdown-item
                >
                <!-- <el-dropdown-item :command="handleCommand('white', row)">{{
                  antsT('加白')
                }}</el-dropdown-item> -->
                <el-dropdown-item
                  v-if="isAdmin"
                  :command="handleCommand('black', row)"
                  >{{ antsT('拉黑') }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ants-table-column>
      </ants-table>
    </ants-tab-card>

    <ReleaseDialog ref="ReleaseDialogRef" />
  </div>
</template>

<script>
import ReleaseDialog from './components/ReleaseDialog.vue'
import BatchHandle from './components/BatchHandle.vue'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getWafInterceptResult,
  getReleaseIpList,
  doReleaseIps,
  getSiteList,
  doIpInBlackForever
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

// 推送数据接口，用于节点初始化
const { pushByInputInfo } = require(`@/v2/${PROCESS_NAME}/api/cdn/push`)

const tabArr = [
  {
    label: '封禁',
    value: 'forbid'
  },
  {
    label: '拦截',
    value: 'intercept'
  },
  {
    label: '可疑',
    value: 'suspicious'
  },
  {
    label: '忽略',
    value: 'ignore'
  },
  {
    label: '放行',
    value: 'pass'
  }
]
const queryObj = {
  forbid: '30*', // 302|303|304
  intercept: '311',
  suspicious: '20*',
  ignore: '1',
  pass: '100'
}

const methodsObj = {
  1: 'UNKNOWN',
  2: 'GET',
  4: 'HEAD',
  8: 'POST',
  16: 'PUT',
  32: 'DELETE',
  64: 'MKCOL',
  128: 'COPY',
  256: 'MOVE',
  512: 'OPTIONS',
  1024: 'PROPFIND',
  2048: 'PROPPATCH',
  4096: 'LOCK',
  8192: 'UNLOCK',
  16384: 'PATCH',
  32768: 'TRACE '
}
export default {
  components: {
    ReleaseDialog,
    BatchHandle
  },
  data() {
    return {
      // 是否为管理平台
      isAdmin: PROCESS_NAME === 'cdn_admin',

      loading: false,
      domainList: [],

      tabArr,
      activeTab: this.$route.query.mode || 'forbid',

      btnLoading: false,
      preheatLoading: false,
      total: 0,
      queryInfo: {
        // 拦截方式
        interceptMode: queryObj[this.$route.query.mode || 'forbid'],
        // 时间
        date: '202208081601*',
        // 节点IP
        nodeIp: '',
        // 来源ID
        sourceIp: '',
        // 目标站点
        serverName: '',
        // 当前的页数
        page: 1,
        // 当前每页显示多少条数据
        limit: 50
      },
      selectArr: [],
      tableData: [],

      // 请求方法
      methodsObj,

      timeObj: {
        1: '1小时',
        6: '6小时',
        24: '1天',
        168: '近7天',
        720: '近30天'
      },

      // 处置方式
      handleObj: {
        311: {
          mode: '七层拦截',
          info: '返回错误码'
        },
        301: {
          mode: '七层拦截',
          info: '返回错误码'
        },
        302: {
          mode: '七层封禁',
          info: '禁封时长'
        },
        303: {
          mode: '三层封禁',
          info: '单节点拉黑'
        },
        304: {
          mode: '三层封禁',
          info: '全节点拉黑'
        },
        305: {
          mode: '三层封禁',
          info: '畸形包过滤'
        },

        300: {
          mode: '可疑',
          info: '记录日志后放行'
        },
        201: {
          mode: '可疑',
          info: '无感验证'
        },
        202: {
          mode: '可疑',
          info: '数字验证'
        },
        205: {
          mode: '可疑',
          info: '点击验证'
        },
        206: {
          mode: '可疑',
          info: '滑动验证'
        },
        200: {
          mode: '可疑',
          info: '记录日志后放行'
        },

        1: {
          mode: '忽略',
          info: '指向下一个规则'
        },
        100: {
          mode: '放行',
          info: '直接放行'
        }
      }
    }
  },
  created() {
    if (this.isAdmin) {
      this.getTableData()
    }
  },
  methods: {
    /**
     * @description: 切换tab
     */

    changeTab(val) {
      this.activeTab = val
      this.queryInfo.page = 1
      this.queryInfo.interceptMode = queryObj[val]
      this.$router.replace({ query: { mode: val } })

      if (this.isAdmin) {
        this.getTableData()
      } else {
        if (this.queryInfo.serverName) {
          this.getTableData()
        }
      }
    },

    // 时间样式 20220817173551
    sortDate(date = '') {
      const YYYY = date.slice(0, 4)
      const MM = date.slice(4, 6)
      const DD = date.slice(6, 8)
      const HH = date.slice(8, 10)
      const mm = date.slice(10, 12)
      const ss = date.slice(12, 14)
      return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`
    },

    //
    changeSelectDomain(val) {
      if (val) {
        this.queryInfo.page = 1
        this.getTableData()
      }
    },

    // 用户平台需要查询站点
    searchData() {
      if (!this.queryInfo.serverName) return this.$msg.error(this.antsT('请输入域名进行查询'))
      this.getTableData()
    },

    // 前台点击点击释放
    releaseSite() {
      if (!this.queryInfo.serverName) return this.$msg.error(this.antsT('请输入域名进行释放'))
      this.getTableData(1)
    },

    /**
     * @description:
     * @ release：release=1 = 0 表示查询， release = 1 时为当前条件下的清理，前台用户解封需要
     */

    async getTableData(release = 0) {
      this.selectArr = []
      this.$root.loading = true
      // 构造时间，默认取今日的，这里的时间查询时按字符串模糊匹配的
      // const nowDate = this.$dayjs(new Date()).format('YYYYMMDDHHmm')
      // const nowDate = this.$dayjs(new Date()).format('YYYYMMDD')
      // 取当前小时内的
      const nowDate = this.$dayjs(new Date()).format('YYYYMMDDHH')

      const {
        nodeIp,
        // 来源ID
        sourceIp,
        // 目标站点
        serverName
      } = this.queryInfo

      const { data: res } = await getWafInterceptResult({
        ...this.queryInfo,
        // date: nowDate + '*',
        date: '*', // 时间不好查询，默认查询所有的数据
        nodeIp: `*${nodeIp}*`,
        sourceIp: `*${sourceIp}*`,
        serverName: `*${serverName}*`,
        release
      })
      this.$root.loading = false
      if (res.code !== 1) return
      this.tableData = res.data || []
      this.total = res.total || 0

      if (release === 1) this.$msg.success('释放成功')
    },

    /**
     * @description: 点击全部释放
     */

    async releaseForbid() {
      this.btnLoading = true
      const { data: res } = await pushByInputInfo({
        command: 6
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('释放成功'))
    },

    /**
     * @description: 条件释放
     * @return {*}
     */

    async showReleaseDialog() {
      this.btnLoading = true
      const { nodeIp, serverName, sourceIp } = this.queryInfo
      const { data: res } = await pushByInputInfo({
        clean_short_cc: `:*${nodeIp}*:*${serverName}*:*${sourceIp}*:${'*'}:`
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('释放成功'))
    },

    /**
     * @description: 批量解封IP
     */

    showBatchReleaseDialog() {
      this.$refs.ReleaseDialogRef.showDialog()
    },

    /**
     * @description: 远程检索域名列表
     */
    async remoteMethod(query) {
      const QUERY = query.trim()
      if (QUERY !== '') {
        this.loading = true
        const { data: res } = await getSiteList({
          user: '',
          mainServerName: QUERY.toLowerCase(),
          page: 1,
          limit: 100
        })
        this.loading = false
        this.domainList = (res.data && res.data.list) || []
      } else {
        this.domainList = []
      }
    },

    /**
     * @description: 解封 IPs
     */

    async releaseIps(row) {
      const { data: res } = await doReleaseIps({
        ips: row.i
      })
      if (res.code !== 1) return
      this.$msg.success(this.antsT('解封成功'))
      this.getTableData()
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    /**
     * @description:
     */

    showCreateSiteDialog() {
      this.$refs.CreateDialogRef.dialogVisible = true
    },

    /**
     * @description: 永久拉黑
     */

    async ipInBlack(row = {}) {
      const result = await this.$doDelete({
        title: this.antsT('永久拉黑'),
        content: `${this.antsT(
          '此操作将永久拉黑IP：'
        )}<strong class="text-error">${row.i}</strong>，${this.antsT(
          '是否继续？'
        )}`
      })
      if (!result) return

      const { data: res } = await doIpInBlackForever({
        id: 0,
        ip: row.i,
        remark: '三层永久封禁',
        control: 4 // 三层永久封禁 = 4
      })
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('拉黑成功'))
    },

    /**
     * @description: 加白
     */

    ipInWhite() {},

    /**
     *  点击更多下拉框
     */
    // 获取下拉框指令参数，用于自定义参数
    handleCommand(flag, row) {
      return {
        flag,
        row
      }
    },

    // 选择更多下拉框内容
    clickMore(command) {
      switch (command.flag) {
        case 'release':
          // 解封
          this.releaseIps(command.row)
          break
        case 'black':
          // 拉黑
          this.ipInBlack(command.row)
          break
        case 'white':
          // 加白
          this.ipInWhite(command.row)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
