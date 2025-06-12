<template>
  <el-dialog
    title="发现版本更新"
    :visible.sync="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="closeVersionDialog"
    top="20vh"
    append-to-body
    :show-close="isShowClose"
    center
  >
    <div class="version-top padding-top-lg">
      <span class="el-icon-upload text-xsl ants_base_color"></span>
      <div class="margin-top ants-font-1">
        <el-badge :value="dnsVersionData.length" type="success">
          <strong>发现更新啦！</strong>
        </el-badge>
      </div>
    </div>
    <ul>
      <li
        v-for="(item, idx) in dnsVersionData"
        :key="idx"
        class="flex items-center padding-tb version-item"
      >
        <div
          class="border-radius-sm ants-bg-3 flex items-center justify-center"
          style="height:55px; width:55px;"
        >
          <span :class="item.icon" class="text-xxl"></span>
        </div>

        <div class="flex-sub flex justify-between items-center padding-left">
          <strong>{{ item.name }}更新</strong>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-s-promotion"
            :loading="updateStatus == 1"
            round
            @click="doUpdateDnsVersion(item)"
            >{{ updateStatus == 1 ? '正在' : '立即' }}更新</el-button
          >

          <!-- <el-button
            v-else
            class="animated fadeInRight"
            type="success"
            size="small"
            icon="el-icon-success"
            round
            >更新完成</el-button
          > -->
        </div>
      </li>
    </ul>
  </el-dialog>
</template>

<script>
import {
  doUpdateVersion,
  getUpdateVersionStatus
} from '@/antsProject/dns_manager/api/public'

export default {
  name: 'VersionDialogAdmin',
  props: {
    dnsVersionData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: true,
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
      this.dnsVersionData.some(item => {
        if (item.goods === 'db' && this.dnsVersionData.length > 1) {
          flag = true
          return true
        }
      })
      return flag
    }
  },
  created() {
    this.initVersion()
  },
  beforeDestroy() {
    // 清除定时器
    this.clearTimer()
  },
  methods: {
    /**
     * @description: 初始化查询后台更新进度
     */

    async initVersion() {
      const { data: res } = await getUpdateVersionStatus()
      this.updateStatus = res.Updating || 0
    },

    /**
     * @description: 获取更新任务状态, Updating = 1 表示有正在更新的任务
     */

    async getUpdateDnsVersionStatus() {
      const { data: res } = await getUpdateVersionStatus()
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
        this.$emit('getDnsVersionData')

        // 检查是否所有的更新都已完成，重新加载页面
        if (this.updateTimes >= this.dnsVersionData.length) {
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
      this.getUpdateDnsVersionStatus()
      this.timer = setTimeout(this.setTimer, 3000)
    },

    clearTimer() {
      clearTimeout(this.timer)
    },

    /**
     * @description: 更新dns版本，必须先更新数据库，这个只是发起更新请求，后台会执行更新
     */

    async doUpdateDnsVersion(item) {
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
      this.setTimer()

      // 设置数据库已更新标识
      if (item.goods === 'db') {
        this.isUpdateDb = true
      }

      // this.$msg.success(`${item.name}更新成功!`)

      // // 如果全部更新成功则关闭对话框，重新加载页面
      // const flag = this.dnsVersionData.every(item => {
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
     * @description: 关闭
     */

    closeVersionDialog() {
      this.clearTimer()
      this.$msg.warning('已忽略本次更新！')
    }
  }
}
</script>

<style lang="scss" scoped>
.version-item {
  border-top: 1px solid theme('colors.ants-border-3');
  &:first-child {
    border-top: none;
  }
}
.version-top {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 190px;
  height: 180px;
  background-color: theme('colors.ants-bg-1');
  border-radius: 100px;
  text-align: center;
}
</style>
