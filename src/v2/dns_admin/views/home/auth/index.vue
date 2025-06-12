<template>
  <div>
    <el-card class="content-box animated fadeIn">
      <div class="p-lg rounded-2xl bg-ants-bg-3">
        <TitleBorder title="系统授权信息" />

        <div class="mt-xs text-ants-text-4 text-sm">
          当前系统的授权信息，若授权过期，请购买授权或联系管理员。
        </div>

        <el-table
          :data="[authInfo]"
          border
          v-loading="authLoading"
          empty-text="当前系统还未授权！"
          class="rounded-lg"
        >
          <ants-table-column label="产品名称" prop="goods" align="center">
          </ants-table-column>
          <ants-table-column label="版本号" prop="version" align="center">
          </ants-table-column>
          <ants-table-column label="授权 IP" prop="auth_ip" align="center">
          </ants-table-column>
          <ants-table-column
            label="产品识别码"
            prop="goods_code"
            align="center"
          >
          </ants-table-column>
          <ants-table-column label="到期时间" align="center" prop="endtime">
            <template #default="{ row }">
              {{ (row.end_time * 1000) | dateFormat }}
            </template>
          </ants-table-column>
          <ants-table-column label="节点数" prop="access_max" align="center">
          </ants-table-column>
          <el-table-column label="获取授权" width="150" align="center">
            <template #default="{ row }">
              <el-button
                v-if="!row.goods_code"
                size="mini"
                type="primary"
                @click="getAuthCode(row)"
                class="price-button"
                >获取授权</el-button
              >
              <el-button v-else size="mini" type="success">更新</el-button>

              <el-button
                v-if="row.goods_code"
                size="mini"
                type="primary"
                class="price-button"
                >升级</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card class="content-box animated fadeIn">
      <div class="p-lg rounded-2xl bg-ants-bg-3">
        <TitleBorder title="系统版本更新" />
        <el-table :data="versionData" border class="rounded-lg">
          <el-table-column label="名称" prop="name" align="center">
          </el-table-column>
          <el-table-column label="当前版本" prop="local" align="center">
            <template #default="{ row }">
              <div
                v-loading="row.loading"
                element-loading-spinner="el-icon-loading"
              >
                <div>
                  {{ row.local }}

                  <!-- 节点 -->
                  <span
                    v-if="row.key === 'ants_dns'"
                    @click="showNodeVersionDialog(row)"
                    class="ml-sm cursor-color text-primary"
                    >详情</span
                  >
                </div>
                <div v-if="row.localTime">
                  {{ (row.localTime * 1000) | dateFormat }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="最新版本" prop="remote" align="center">
            <template #default="{ row }">
              <div
                v-loading="row.loading"
                element-loading-spinner="el-icon-loading"
              >
                <div :class="{ 'text-success': row.status === 1 }">
                  {{ row.remote || row.local }}
                </div>
                <div v-if="row.remoteTime">
                  {{ (row.remoteTime * 1000) | dateFormat }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag size="mini" type="success" v-if="row.status === 1"
                >可更新</el-tag
              >
              <el-tag size="mini" type="primary" v-else>最新版</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="130">
            <template #default="{ row }">
              <ants-button
                type="primary"
                size="mini"
                :loading="isUpdating || row.loading"
                :disabled="!row.status"
                @click="doUpdateVersion(row)"
                :text="
                  isUpdating ? '更新中' : row.loading ? '加载中' : '立即更新'
                "
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <NodeVersionDialog ref="NodeVersionDialogRef" />
  </div>
</template>

<script>
import {
  getVersionData,
  doUpdateVersion,
  getUpdateVersionStatus,
  getChartData
} from '@/v2/dns_admin/api/public'

import NodeVersionDialog from './NodeVersionDialog'

const versionObj = {
  db: '数据库',
  web_controller: 'Web接口控制单元',
  web_view_manager: '管理平台',
  web_view_user: '用户平台',
  ants_dns: '节点'
}

const rowObj = {
  key: '',
  name: '',
  // 当前版本
  local: '',
  // 当前版本时间
  localTime: '',
  // 最新版本
  remote: '',
  // 最新版本时间
  remoteTime: '',
  // 是否可更新 0 = 最新版（不可更新），1 = 可更新
  status: 0,
  // 加载状态
  loading: false
}

export default {
  components: {
    NodeVersionDialog
  },
  data() {
    return {
      authLoading: false,
      authInfo: {
        // 到期时间
        end_time: 0,
        // 授权IP
        auth_ip: '',
        // 产品名称
        goods: '',
        // 产品识别码
        goods_code: '',
        // 节点数
        access_max: 0,
        // 版本号
        version: '-'
      },

      // 版本更新表格数据
      versionData: [],
      // 数据库是否为最新版，只有数据库为最新版时，才能更新其他版本
      isDbNew: false,
      // 是否正在更新中，保持依次执行任务
      isUpdating: false,
      // 当前正在更新的任务
      activeUpdateKey: '',
      timer: null
    }
  },
  computed: {},
  created() {
    this.getAuthInfo()

    // 构造版本更新表格数据
    Object.keys(versionObj).forEach((key) => {
      const obj = {
        ...rowObj,
        key,
        name: versionObj[key]
      }
      this.versionData.push(obj)
    })

    this.versionData.forEach((item) => {
      this.getVersionDataByKey(item)
    })
  },
  mounted() {},
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.timer)
  },
  methods: {
    // 获取系统授权信息
    async getAuthInfo() {
      this.authLoading = true
      try {
        const { data: res } = await getChartData({
          keys: 'auth_info'
        })
        this.authLoading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        const authInfo = obj.auth_info || {}
        const goodsObj = authInfo.data || {}
        this.authInfo = {
          ...this.authInfo,
          ...authInfo,
          goods: goodsObj.goods,
          goods_code: goodsObj.goods_code,
          access_max: goodsObj.access_max || 0,
          // auth_ip: '192.168.10.1',
          // access_max: '无限制',
          // endtime: '永久',
          version: goodsObj.version || '-'
        }
      } catch (error) {
        this.authLoading = false
        throw error
      }
    },

    // 分别获取每一条的版本信息
    async getVersionDataByKey(item) {
      item.loading = true
      try {
        const { data: res } = await getVersionData({
          keys: item.key
        })
        item.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        const keyObj = obj[item.key] || {}

        item.local = keyObj.local || ''
        item.remote = keyObj.remote || ''
        item.detail = keyObj.detail || ''
        item.localTime = ((keyObj.info || {}).query || {}).addtime
        item.remoteTime = (keyObj.info || {}).newest || item.localTime

        // 判断是否可更新：远程的版本号不为空，并且本地版本号与远程版本号不一致，则可更新
        item.status = item.remote && item.remote != item.local ? 1 : 0
        // 判断数据库是否为最新版
        if (item.key === 'db') {
          this.isDbNew = item.status === 0
        }
      } catch (error) {
        item.loading = false
        throw error
      }
    },

    // 执行更新，一次执行一个更新任务
    async doUpdateVersion(row) {
      // 必须先更新数据库
      if (row.key != 'db' && !this.isDbNew) {
        this.$msg.error('请先更新数据库！')
        return
      }
      this.isUpdating = true
      const { data: res } = await doUpdateVersion({
        goods: row.key,
        hash: row.remote
      })

      if (res.code !== 1) {
        this.isUpdating = false
        return
      }
      this.activeUpdateKey = row.key
      // 定时检测是否更新成功
      this.setTimer()
    },

    // 定时检测后台更新状态
    setTimer() {
      // 清除定时器
      clearInterval(this.timer)
      this.timer = setInterval(this.getUpdateDnsVersionStatus, 3000)
      // 页面销毁清除定时器
      this.$once('hook:beforeDestroy', () => {
        clearInterval(this.timer)
      })
    },

    // 获取更新任务状态, Updating = 1 表示有正在更新的任务
    async getUpdateDnsVersionStatus() {
      try {
        const { data: res } = await getUpdateVersionStatus()
        if (res.code !== 1) {
          clearInterval(this.timer)
          this.isUpdating = false
          return
        }
        this.updateStatus = res.Updating || 0

        // 更新完成，清除定时器
        if (res.Updating == 0) {
          clearInterval(this.timer)
          this.isUpdating = false
          this.$msg.success(`${versionObj[this.activeUpdateKey]}更新完成`)
          // 刷新表格数据
          this.versionData.forEach((item) => {
            this.getVersionDataByKey(item)
          })
        }
      } catch (error) {
        clearInterval(this.timer)
        this.isUpdating = false
        this.$msg.error('网络错误，更新失败！')
        throw error
      }
    },

    /**
     * @description: 节点，节点守护程序，查看详情
     */

    showNodeVersionDialog(row = {}) {
      this.$refs.NodeVersionDialogRef.showDialog(row.detail, row.name)
    }
  }
}
</script>
