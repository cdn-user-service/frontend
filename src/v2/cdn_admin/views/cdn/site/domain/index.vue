<template>
  <div class="relative">
    <el-card class="animated fadeIn content-box">
      <div class="flex flex-wrap">
        <ants-input
          v-for="(item, key) in {
            mainServerName: '域名/别名',
            id: 'ID',
            user: '用户'
          }"
          :key="key"
          class="ants-search_input mr-sm mb-df"
          :placeholder="`检索${item}`"
          clearable
          v-model="queryInfo[key]"
          size="small"
          @change="toQuery()"
        >
          <i
            slot="prefix"
            class="el-input__icon aicon icon-sousuo"
            @click="toQuery()"
          />
        </ants-input>

        <ants-select
          v-model="queryInfo.groupId"
          size="small"
          placeholder="检索节点分组"
          style="width: 220px"
          class="mr-sm mb-df"
          @change="toQuery"
        >
          <ants-option label="全部节点分组" value=" " />
          <ants-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ants-select>

        <ants-button
          type="primary"
          icon="el-icon-search"
          size="small"
          class="mb-df"
          :loading="$root.loading"
          :disabled="btnLoading"
          @click="toQuery()"
          text="检索"
        />
        <ants-button
          type="primary"
          plain
          size="small"
          class="mb-df"
          @click="showQuery = !showQuery"
          :text="showQuery ? '收起' : '展开'"
        >
          <i
            class="ml-2"
            :class="showQuery ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
          />
        </ants-button>
      </div>

      <div class="flex flex-wrap" v-show="showQuery">
        <ants-input
          v-for="(item, key) in {
            sourceIp: '回源IP',
            sourcePort: '回源端口',
            listenPort: '监听端口'
          }"
          :key="key"
          class="ants-search_input mr-sm mb-df"
          :placeholder="`检索${item}`"
          clearable
          v-model="queryInfo[key]"
          size="small"
          @change="toQuery()"
        >
          <i
            slot="prefix"
            class="el-input__icon aicon icon-sousuo"
            @click="toQuery()"
          />
        </ants-input>

        <ants-select
          v-model="queryInfo.isAvailable"
          size="small"
          placeholder="检索套餐"
          style="width: 105px"
          class="mr-sm mb-df"
          @change="toQuery"
        >
          <ants-option label="全部套餐" value=" " />
          <ants-option label="有效套餐" :value="1" />
          <ants-option label="无效套餐" :value="0" />
        </ants-select>

        <ants-select
          v-model="queryInfo.statuss"
          size="small"
          placeholder="全部状态"
          style="width: 105px"
          class="mr-sm mb-df"
          @change="toQuery"
        >
          <ants-option label="全部状态" value=" " />
          <ants-option label="已启用" value="1" />
          <ants-option label="已禁用" value="0,2" />
        </ants-select>
      </div>

      <table-query-form :queryInfo="queryInfo" @changeInput="getTableData">
        <template slot="buttons">
          <ants-button
            type="primary"
            icon="el-icon-plus"
            size="small"
            :disabled="$root.loading || btnLoading"
            @click="showCreateSiteDialog()"
            text="添加域名"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-s-promotion"
            :loading="preheatLoading"
            :disabled="$root.loading || btnLoading"
            @click="batchPreheat"
            text="批量预热"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-finished"
            :disabled="$root.loading || btnLoading"
            @click="batchApplyCert"
            text="批量申请证书"
          />
          <ants-button
            type="primary"
            icon="el-icon-download"
            size="small"
            :disabled="$root.loading || btnLoading"
            @click="exportData()"
            text="批量导出"
          />

          <ants-button
            type="primary"
            icon="el-icon-download"
            size="small"
            :disabled="$root.loading || btnLoading"
            @click="exportData('all')"
            text="全部导出"
          />

          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
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
        :height="`calc(100vh - ${showQuery ? 390 : 345}px)`"
        min-height="300px"
      >
        <ants-table-column type="selection" width="45" align="center" />

        <ants-table-column width="80" prop="id" label="ID" />

        <ants-table-column prop="mainServerName" label="域名" min-width="140">
          <template #default="{ row }">
            <ants-copy
              :text="row.mainServerName"
              @click="toAdmin(row)"
              class="cursor-pointer text-primary"
            />
          </template>
        </ants-table-column>

        <ants-table-column prop="meal" label="套餐" min-width="140">
          <template #default="{ row }">
            <div>
              {{ ((row.suit || {}).product || {}).name }}
            </div>
            <div>{{ (row.suit || {}).endTime }}</div>
          </template>
        </ants-table-column>

        <ants-table-column prop="cname" label="CNAME" min-width="200">
          <template #default="{ row }">
            <el-tooltip
              :disabled="row.job_check_site_cname == 1"
              placement="top"
              effect="dark"
            >
              <div slot="content">
                <strong class="text-primary">
                  {{ row.mainServerName }}
                </strong>
                未解析到此CNAME
              </div>

              <div :class="{ 'text-error': row.job_check_site_cname != 1 }">
                <ants-copy :text="(row.cname || '').split(',')[0] || '-'" />
              </div>
            </el-tooltip>
          </template>
        </ants-table-column>

        <ants-table-column prop="user" label="用户" min-width="140">
          <template #default="{ row }">
            <div>ID：{{ row.userId }}</div>
            <ants-copy :text="row.user" />
          </template>
        </ants-table-column>

        <ants-table-column
          prop="gropuInfo"
          label="节点分组"
          min-width="100"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{
              (
                (((row.suit || {}).product || {}).client_group_list || [])[0] ||
                {}
              ).areaName
            }}</span>
          </template>
        </ants-table-column>

        <ants-table-column prop="ssl" label="SSL" min-width="50" align="center">
          <template #default="{ row }">
            <i
              class="text-df"
              :class="
                row.ssl
                  ? 'el-icon-success text-success'
                  : 'el-icon-remove text-error'
              "
            />
          </template>
        </ants-table-column>

        <ants-table-column
          prop="job_ssl_apply"
          label="续签证书"
          width="70"
          align="center"
        >
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.job_ssl_apply"
              :ref="`tableSslSwitchRef${$index}`"
              @change="changeSslStatus(row, `tableSslSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </ants-table-column>

        <ants-table-column
          prop="status"
          label="启用"
          min-width="60"
          align="center"
        >
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              :inactive-value="2"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="230" auto-fixed>
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              :disabled="btnLoading"
              @click="toAdmin(row)"
              text="管理"
            />
            <ants-button
              type="danger"
              size="mini"
              :disabled="btnLoading"
              @click="singleDelete(row)"
              text="删除"
            />
            <ants-button
              size="mini"
              type="success"
              :disabled="btnLoading"
              @click="goUsersClient(row)"
              text="客户端"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加域名对话框 -->
    <CreateDialog ref="CreateDialogRef" />

    <!-- 预热更新反馈对话框 -->
    <PreheatDialog
      ref="PreheatDialogRef"
      :loading="preheatLoading"
      @refreshData="querySitePushDetail"
    />
    <!-- 批量申请证书 -->
    <ReSignDialog ref="ReSignDialogRef" />
  </div>
</template>

<script>
// API
import {
  getSiteList,
  dobatchDeleteSite,
  doChangeSiteStatus,
  doCreateUpdateSiteAttr,
  doExportSite
} from '@/v2/cdn_admin/api/cdn/site'

import { goUserClientConsole } from '@/v2/cdn_admin/api/account/users'
import { getNodeGroup } from '@/v2/cdn_admin/api/cdn/node'
import {
  pushSiteConfToNode,
  pushDataToNode,
  queryPushDetail,
  pushByInputInfo
} from '@/v2/cdn_admin/api/cdn/push'

import CreateDialog from './components/CreateDialog'
import PreheatDialog from './components/PreheatDialog'
import ReSignDialog from '@/v2/cdn_common/components/ReSignDialog'

import { getLocation, openUrl } from '@/utils/env'

import { exportXlsx, exportTxt } from '@/utils/export'

export default {
  name: 'CdnSiteDomain',
  components: {
    CreateDialog,
    PreheatDialog,
    ReSignDialog
  },
  data() {
    return {
      btnLoading: false,
      preheatLoading: false,
      showQuery: false,
      total: 0,
      queryInfo: {
        group: 0,
        // 节点分组
        groupId: ' ',
        id: null,
        sourceIp: null, // 回源IP
        sourcePort: null, // 回源端口
        listenPort: null, // 监听端口
        mainServerName: null, // 检索域名
        user: null,
        // 筛选套餐是否有效
        isAvailable: ' ',
        // 查询状态
        statuss: ' ',
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      selectArr: [],
      tableData: [],

      groupList: [],
      isAvailableVisible: false,
      statusVisible: false
    }
  },
  computed: {},
  created() {
    // 判断是否使用保存下来的分页数据
    // if (this.$route.meta.flag && this.$route.meta.queryInfo) {
    //   this.queryInfo = this.$route.meta.queryInfo
    // }
    this.getTableData()
    this.getNodeGroupList()
  },
  activated() {
    console.log('重新刷新数据')
    this.getTableData()
  },
  methods: {
    async exportData(type) {
      if (type === 'all') {
        const result = await this.$doDelete({
          title: '导出域名列表',
          content: '是否导出全部域名列表？',
          type: 'info'
        })
        if (!result) return
      } else {
        if (this.selectArr && this.selectArr.length) {
          const result = await this.$doDelete({
            title: '导出域名列表',
            content: `是否导出 ${this.selectArr.length} 条域名列表？`,
            type: 'info'
          })
          if (!result) return
        } else {
          this.$msg.error('请选择要导出的数据')
          return
        }
      }
      this.btnLoading = true
      try {
        //  遍历selectArr  拿到数组内每一个对象的id 组合成字符串 中间用逗号隔开赋值给 siteIds
        const obj = {
          keys: 'alias,source_base_info',
          siteIds:
            type === 'all'
              ? type
              : this.selectArr.map((item) => item.id).join(',')
        }
        const { data: res } = await doExportSite(obj)
        if (res.code !== 1) return
        // this.doDownload(res.data)
        this.doDownloadTxt(res.data)
      } finally {
        this.btnLoading = false
      }
    },
    // 执行导出excel
    async doDownload(arr = []) {
      // 指定要导出的每列数据
      const jsonArr = arr.map((item) => {
        const {
          siteId,
          siteName,
          groupId,
          groupName,
          alias: aliasArr,
          source_base_info: sourceBaseInfo
        } = item
        // aliasArr= "[www.11.com, www.22.com]" 把‘[',']'去掉
        const alias = aliasArr.replace(/[[\]]/g, '')
        const sourceIp = this.extractIpAndPort(JSON.parse(sourceBaseInfo)).join(
          ','
        )

        return {
          siteId,
          siteName,
          groupId,
          groupName,
          alias,
          sourceIp
        }
      })

      // 追加表头
      jsonArr.unshift({
        siteId: 'ID',
        siteName: '域名',
        groupId: '分组ID',
        groupName: '所属分组',
        alias: '别名',
        sourceIp: '回源IP'
      })
      // 获取当前时间
      const time = this.getCurrentTime()
      const res = await exportXlsx(jsonArr, `域名列表(${time})`)
      if (!res) return (this.btnLoading = false)
      setTimeout(() => {
        this.$msg.success('导出成功')
        this.btnLoading = false
      }, 500)
    },
    // 导出txt
    async doDownloadTxt(arr = []) {
      this.loading = true
      // 获取当前时间
      const time = this.getCurrentTime()
      // 指定要导出的每列数据
      const jsonArr = arr.map((item) => {
        const {
          siteId,
          siteName,
          groupId,
          groupName,
          alias: aliasArr,
          source_base_info: sourceBaseInfo
        } = item
        // aliasArr= "[www.11.com, www.22.com]" 把‘[',']'去掉
        const alias = aliasArr.replace(/[[\] ]/g, '')
        const sourceIp = sourceBaseInfo
          ? this.extractIpAndPort(JSON.parse(sourceBaseInfo)).join(',')
          : ''

        console.log(
          'sourceIp',
          this.extractIpAndPort(JSON.parse(sourceBaseInfo)),
          sourceIp
        )
        return {
          siteId,
          siteName,
          groupId,
          groupName,
          alias,
          sourceIp
        }
      })
      try {
        let txtContent = '主站,别名1,别名2|源站IP|端口 \r\n \r\n'
        jsonArr.forEach((item = {}) => {
          txtContent += `${item.siteName}${item.alias ? `,${item.alias}` : ''}${
            item.sourceIp ? `|${item.sourceIp}` : ''
          } \r\n`
        })
        exportTxt(txtContent, `域名列表(${time})`, false)
      } finally {
        this.loading = false
      }
    },
    /**
     * 从数组中提取每个对象的 line 数组下的 ip 和 port
     * @param {Array} arr - 包含对象的数组
     * @returns {Array} - 包含 ip 和 port 的数组
     */
    extractIpAndPort(arr) {
      console.log('arr', arr)
      const newArr = arr.length > 0 ? [arr[0]] : []
      return newArr
        .map((item) => {
          if (Array.isArray(item.line)) {
            if (item.line && item.line.length) {
              return `${item.line[0][item.source_set]}|${item.line[0].port}`
            } else {
              return ''
            }
            // return item.line
            // .map((lineItem) => {
            //   if (lineItem.ip && lineItem.port) {
            //     return `${lineItem.ip}|${lineItem.port}`
            //   }
            //   return null // 如果 lineItem 中没有 ip 或 port，返回 null
            // })
            // .filter(Boolean) // 过滤掉 null 值
          }
          return [] // 如果 item.line 不是数组，返回空数组
        })
        .flat() // 展平二维数组为一维数组
        .filter((value, index, self) => self.indexOf(value) === index) // 去重
    },
    /**
     * 获取当前时间，精确到秒
     * @returns {string} 当前时间的字符串格式，例如 "2023-10-05 12:34:56"
     */
    getCurrentTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    // 获取表格数据
    async getTableData() {
      this.$root.loading = true
      try {
        const { sourcePort, listenPort, isAvailable, statuss } = this.queryInfo
        const { data: res } = await getSiteList({
          ...this.queryInfo,
          // 端口查询的时候需要传整数，不然后端会报错！！！
          sourcePort: Number.isInteger(+sourcePort) ? sourcePort : 999999999,
          listenPort: Number.isInteger(+listenPort) ? listenPort : 999999999
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        this.tableData = obj.list || []
        this.total = obj.totalCount || 0
      } finally {
        this.$root.loading = false
      }
    },

    // 获取节点分组列表
    async getNodeGroupList() {
      const { data: res } = await getNodeGroup({
        page: 1,
        limit: 100
      })
      if (res.code !== 1) return
      this.groupList = (res.data || {}).list || []
    },

    toQuery() {
      this.queryInfo.page = 1
      this.getTableData()
    },

    handleSelectionChange(val) {
      this.selectArr = val
    },

    // 添加域名
    showCreateSiteDialog() {
      // this.$refs.CreateDialogRef.dialogVisible = true
      this.$router.push('./domain/create')
    },

    // 启动禁用站点
    async changeStatus(row, switchRef) {
      if (row.status === 2) {
        const result = await this.$doDelete({
          title: '禁用站点',
          content: `此操作将禁用站点“ <strong style="color: #F78989;">${row.mainServerName}</strong> ”，是否继续？`
        })
        if (!result) {
          row.status = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      try {
        const { data: res } = await doChangeSiteStatus({
          siteId: row.id,
          status: row.status
        })
        if (res.code !== 1) {
          row.status = row.status ? 2 : 1
          return
        }
        this.$msg.success('操作成功')
        // this.pushStatusData(row.id, row.status)
      } finally {
        this.$refs[switchRef].loading = false
      }
    },

    async changeSslStatus(row, switchRef) {
      if (row.job_ssl_apply === 0) {
        const result = await this.$doDelete({
          title: '关闭自动续签证书',
          content: `此操作将关闭站点“ <strong style="color: #F78989;">${row.mainServerName}</strong> 自定续签证书功能”，是否继续？`
        })
        if (!result) {
          row.job_ssl_apply = 1
          return
        }
      }
      this.$refs[switchRef].loading = true
      try {
        const { data: res } = await doCreateUpdateSiteAttr({
          siteId: row.id,
          job_ssl_apply: row.job_ssl_apply
        })
        if (res.code !== 1) {
          row.job_ssl_apply = row.job_ssl_apply ? 0 : 1
          return
        }
        this.$msg.success('操作成功')
      } finally {
        this.$refs[switchRef].loading = false
      }
    },

    // 启用关闭站点 推送数据
    async pushStatusData(siteId, status) {
      let keyStr = ''
      // 关闭
      if (status === 0) {
        keyStr = 'delete_site'
      }
      // 开启
      if (status === 1) {
        keyStr = 'site_chunk'
      }
      const { data: res } = await pushByInputInfo({
        [keyStr]: siteId
      })
    },

    // 前往管理页面
    toAdmin(row) {
      console.log(row)
      // 保存当前分页数据，返回到当前页时直接显示
      this.$route.meta.queryInfo = this.queryInfo

      this.$router.push({
        path: './domain/admin',
        query: { id: row.id, domain: row.mainServerName }
      })
    },

    // 批量操作
    toBatch(command) {
      this[command]()
    },

    // 批量申请证书
    async batchApplyCert() {
      const selectLength = this.selectArr.length
      if (!selectLength) return this.$msg.warning('请先选择站点')
      this.$refs.ReSignDialogRef.show(this.selectArr)

      // const result = await this.$batchDelete(selectLength, {
      //   title: '批量申请证书',
      //   tag: '站点',
      //   content: `此操作将会批量申请${selectLength}个站点的证书，是否继续？`,
      //   type: 'info'
      // })
      // if (!result) return
      // this.btnLoading = true
      // try {
      //   const idsArr = this.selectArr.map((item) => item.id)
      //   const { data: res } = await pushByInputInfo({
      //     apply_certificate_v2: idsArr + ''
      //   })
      //   if (res.code !== 1) return
      //   this.getTableData()
      //   this.$msg.success(this.antsT('操作成功'))
      //   this.selectArr = []
      // } finally {
      //   this.btnLoading = false
      // }
    },

    // 批量预热
    async batchPreheat() {
      const selectLength = this.selectArr.length
      if (!selectLength) return this.$msg.warning('请选择要预热更新的站点')
      const result = await this.$batchDelete(selectLength, {
        title: '批量预热',
        tag: '站点',
        content: `此操作将会预热更新${selectLength}个站点配置数据，是否继续？`,
        type: 'info'
      })
      if (!result) return

      this.preheatLoading = true
      this.btnLoading = true
      try {
        const idsArr = this.selectArr.map((item, index) => {
          return item.id
        })
        const { data: res } = await pushByInputInfo({
          site_select_chunk: idsArr + ''
        })
        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(this.antsT('预热成功'))
        this.selectArr = [] // 释放
      } finally {
        this.preheatLoading = false
        this.btnLoading = false
      }
    },

    // 一键预热所有站点配置，这个不要
    async preheatAll() {
      const result = await this.$doDelete({
        title: '一键预热',
        content: '此操作将会预热更新所有的站点配置数据，是否继续？',
        type: 'info'
      })
      if (!result) return
      this.preheatLoading = true
      const { data: res } = await pushDataToNode()
      this.preheatLoading = false
      if (res.code !== 1) {
        // return
      }

      // 查询推送状态
      // this.querySitePushDetail(res.data)
    },

    // 预热更新，不要
    async preheatSite({ id }) {
      this.preheatLoading = true
      const { data: res } = await pushSiteConfToNode({
        siteId: id
      })
      this.preheatLoading = false

      if (res.code !== 1) {
        // this.preheatLoading = false
        // return
      }

      // 查询推送状态
      // this.querySitePushDetail(res.data)
    },

    // 预热更新站点后查询状态
    async querySitePushDetail(index) {
      this.preheatLoading = true
      const { data: res } = await queryPushDetail({
        types: '1,2',
        index
      })
      this.preheatLoading = false

      if (res.code !== 1) return

      this.$refs.PreheatDialogRef.showDialog(res, index)
      // this.$alert(res.feed, '数据推送状态', {
      //   confirmButtonText: '确定',
      //   center: true
      // })
      // this.$msg.success(this.antsT('预热成功'))
    },

    // 刷新缓存
    async refreshSite(row) {
      const result = await this.$doDelete({
        title: '强制刷新缓存',
        content: '此操作会强制更新该站点下的缓存内容，是否继续？',
        type: 'info'
      })
      if (!result) return

      // const { data } = await this.$http.post(
      //   'cdn/domaincache/cache_clean',
      //   this.$qs.stringify({ site_id: row.id, group_id: row.group_id })
      // )

      // if (data.code !== 1) return this.$msg.error(data.message || '强制刷新失败')
      this.$msg.success('强制刷新缓存成功')
    },

    // 删除单个
    async singleDelete({ id, mainServerName }) {
      const result = await this.$doDelete({
        tag: '站点',
        name: mainServerName
      })
      if (!result) return
      this.btnLoading = true

      const { data } = await dobatchDeleteSite({
        ids: id
      })
      this.btnLoading = false

      if (data.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除站点成功'))
      // 推送数据
      // const { data: res } = await pushSiteConfToNode({
      //   siteId: id
      // })
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: '站点'
      })
      if (!result) return

      this.btnLoading = true
      try {
        const idsArr = this.selectArr.map((item, index) => {
          return item.id
        })
        const { data: res } = await dobatchDeleteSite({
          ids: idsArr + ''
        })

        if (res.code !== 1) return
        this.getTableData()
        this.$msg.success(selectLength + this.antsT('个站点已成功删除'))
        this.selectArr = [] // 释放
      } finally {
        this.btnLoading = false
      }
    },

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
        case 'delete':
          // 删除域名
          this.singleDelete(command.row)
          break
        case 'refresh':
          // 刷新缓存
          this.refreshSite(command.row)
          break
        case 'preheat':
          // 预热更新
          this.preheatSite(command.row)
          break
        // case 'alias':
        //   // 别名管理
        //   this.goAliasPage(command.row)
        //   break
      }
    },

    /**
     * @description: 前往用户控制
     */

    async goUsersClient({ userId, mainServerName }) {
      this.btnLoading = true
      const { data: res } = await goUserClientConsole({
        userId
      })
      this.btnLoading = false
      if (res.code !== 1) return

      // 获取协议
      const { protocol } = getLocation()

      // token
      const TOKEN = res.token
      const { userDir } = this.$root.webConfig

      let obj = {}
      if (typeof res.env === 'object') {
        obj = res.env.paramValue && JSON.parse(res.env.paramValue)
      }
      const frontAddress = obj.frontAddress || ''

      const rootPath = frontAddress || `${protocol}//${userDir}`

      // 拼接 url 地址
      const URL = `${rootPath}#/cdn/site/domain?token=${TOKEN}&mainServerName=${mainServerName}`
      openUrl(URL)
    }
  }
}
</script>

<style lang="scss" scoped></style>
