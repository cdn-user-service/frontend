<template>
  <ants-form-card>
    <template slot="title">
      <TitleBorder title="系统版本更新" />
    </template>
    <template slot="info">
      请优先更新数据库！！！，请优先更新数据库！！！，请优先更新数据库！！！
    </template>
    <template slot="content">
      <el-table
        :data="allVersionData"
        border
        v-loading="loading"
        style="margin:0;"
      >
        <ants-table-column label="名称" prop="name" align="center">
        </ants-table-column>
        <ants-table-column label="当前版本" prop="local" align="center">
          <template #default="{ row }">
            <div>
              {{ row.local }}

              <!-- 节点守护程序 and 节点 -->
              <span
                v-if="row.goods === 'nginx' || row.goods === 'ants_agent'"
                @click="showNodeVersionDialog(row)"
                class="ml-sm cursor-color text-primary"
                >详情</span
              >
            </div>

            <div v-if="row.local_version_date">
              {{ (row.local_version_date * 1000) | dateFormat }}
            </div>
          </template>
        </ants-table-column>
        <ants-table-column label="最新版本" prop="remote" align="center">
          <template #default="{ row }">
            <div v-if="row.remote || row.local">
              <span :class="{ 'text-success': getStatus(row) }">{{
                row.remote || row.local
              }}</span>
            </div>

            <div v-if="row.local_version_date">
              <span :class="{ 'text-success': getStatus(row) }">{{
                ((row.remote_version_date || row.local_version_date) * 1000)
                  | dateFormat
              }}</span>
            </div>
          </template>
        </ants-table-column>

        <ants-table-column label="状态" align="center" width="100">
          <template #default="{ row }">
            <el-tag size="mini" type="success" v-if="getStatus(row)"
              >可更新</el-tag
            >
            <el-tag size="mini" type="info" v-else>最新版</el-tag>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" align="center" width="120">
          <template #default="{ row }">
            <ants-button
              :type="getStatus(row) ? 'primary' : 'info'"
              size="mini"
              :loading="updateStatus == 1"
              :disabled="!getStatus(row)"
              @click="doUpdateCdnVersion(row)"
              :text="`${updateStatus == 1 ? '正在' : '立即'}更新`"
            />
          </template>
        </ants-table-column>
      </el-table>

      <!-- 节点，节点守护程序，查看详情对话框 -->
      <NodeVersionDialog ref="NodeVersionDialogRef" />

    </template>
  </ants-form-card>
</template>

<script>
// API
import {
  getVersionData,
  getUpdateStatus,
  doUpdateVersion
} from '@/v2/cdn_admin/api/public/version'
import NodeVersionDialog from './NodeVersionDialog'

export default {
  components: {
    NodeVersionDialog
  },
  data() {
    return {
      loading: false,

      // 当前版本信息，数据库需要最先更新
      versionBaseData: {
        // 数据库
        db: 'el-icon-coin',
        // Web接口控制单
        web_controller: 'el-icon-s-shop',
        // web 后台
        web_view_manager: 'aicon icon-CDN',
        // web 前台
        web_view_user: 'aicon icon-CDN',
        // kafka中间件
        middleware: 'el-icon-s-shop'
      },
      // 有更新项的数组
      updateVersionData: [],
      // 所有更新项的数组
      allVersionData: [],

      // 对话框隐藏显示
      dialogVisible: false,
      // 关闭按钮隐藏显示
      isShowClose: true,

      // 是否已更新过数据库
      isUpdateDb: false,
      // 后台任务更新状态， = 1 表示有正在更新的任务
      updateStatus: 0,
      activeUpdate: '',
      timer: null,
      // 已更新次数
      updateTimes: 0
    }
  },
  computed: {
    // 是否需要提示更新过数据库
    isTipsUpdateDb() {
      let flag = false
      this.updateVersionData.some(item => {
        if (item.goods === 'db' && this.updateVersionData.length > 1) {
          flag = true
          return true
        }
      })
      return flag
    }
  },
  created() {
    this.initVersion()
    this.getCdnVersionData()
  },
  mounted() {},
  beforeDestroy() {
    // 清除定时器
    this.clearTimer()
  },

  methods: {
    getStatus({ local, remote }) {
      return remote && local && local != remote
    },

    /**
     * @description: 获取当前系统版本
     */

    async getCdnVersionData() {
      this.loading = true
      const { data: res } = await getVersionData()
      this.loading = false

      if (res.code !== 1) return
      const updateArr = []
      const allArr = []
      res.goods.forEach(item => {
        const ITEM_OBJ = res.data[item] || {}
        const NEW_OBJ = {
          loading: false,
          isUpdate: false,
          icon: this.versionBaseData[item] || 'el-icon-s-shop',
          goods: item,
          ...ITEM_OBJ
        }

        // 可更新的
        if (ITEM_OBJ.local != ITEM_OBJ.remote && ITEM_OBJ.remote) {
          updateArr.unshift(NEW_OBJ)
        }

        // 所有的
        allArr.unshift(NEW_OBJ)
      })

      this.updateVersionData = updateArr
      this.allVersionData = allArr
      console.log(allArr)
    },

    /**
     * @description: 初始化查询后台更新进度, Updating = 1 表示有正在更新的任务
     */

    async initVersion() {
      const { data: res } = await getUpdateStatus()
      this.updateStatus = res.Updating || 0
    },

    /**
     * @description: 获取更新任务状态, Updating = 1 表示有正在更新的任务
     */

    async getUpdateCdnVersionStatus() {
      const { data: res } = await getUpdateStatus()
      if (res.code !== 1) {
        this.clearTimer()
        return
      }
      this.updateStatus = res.Updating || 0

      // 清除定时器
      if (res.Updating == 0) {
        // 显示关闭按钮
        this.isShowClose = true
        this.updateTimes++
        this.$msg.success(`${this.activeUpdate}更新完成`)
        this.clearTimer()
        this.getCdnVersionData()

        // 检查是否所有的更新都已完成，重新加载页面
        if (this.updateTimes >= this.updateVersionData.length) {
          location.reload()
        }
      }
    },

    /**
     * @description: 定时检测后台更新状态
     */

    setTimer() {
      // 清除定时器
      this.clearTimer()
      this.getUpdateCdnVersionStatus()
      this.timer = setTimeout(this.setTimer, 3000)
    },

    clearTimer() {
      clearTimeout(this.timer)
    },

    /**
     * @description: 更新系统版本，必须先更新数据库，这个只是发起更新请求，后台会执行更新
     */

    async doUpdateCdnVersion(item) {
      // 提醒先更新数据库
      if (this.isTipsUpdateDb && item.goods != 'db' && !this.isUpdateDb) {
        this.$msg.warning('请先更新数据库！')
        return
      }

      // item.loading = true
      this.updateStatus = 1
      // 隐藏关闭按钮
      this.isShowClose = false
      const { data: res } = await doUpdateVersion({
        goods: item.goods,
        hash: item.remote
      })

      // item.loading = false

      // 设置为更新成功
      // item.isUpdate = true

      if (res.code !== 1) {
        this.updateStatus = 0
        return
      }
      this.activeUpdate = item.name
      // 定时检测是否更新成功
      this.setTimer(item)

      // 设置数据库已更新标识
      if (item.goods === 'db') {
        this.isUpdateDb = true
      }

      // this.$msg.success(`${item.name}更新成功!`)

      // // 如果全部更新成功则关闭对话框，重新加载页面
      // let flag = this.updateVersionData.every(item => {
      //   return item.isUpdate
      // })

      // if (flag) {
      //   // this.dialogVisible = false
      //   location.reload()
      // } else {
      //   this.isShowClose = true
      // }
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
