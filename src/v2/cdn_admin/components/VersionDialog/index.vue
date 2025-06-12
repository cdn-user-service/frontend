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
    <div class="version-top pt-xl bg-ants-bg-1 text-center">
      <span class="el-icon-upload text-6xl text-primary"></span>
      <div class="mt-lg text-ants-text-1">
        <el-badge :value="updateVersionData.length" type="success">
          <strong>发现更新啦！</strong>
        </el-badge>
      </div>
    </div>
    <ul>
      <li
        v-for="(item, idx) in updateVersionData"
        :key="idx"
        class="flex items-center py-lg version-item border-t border-ants-border-3"
      >
        <div
          class="rounded-xl bg-ants-bg-3 flex items-center justify-center"
          style="height:55px; width:55px;"
        >
          <span :class="item.icon" class="text-4xl"></span>
        </div>

        <div class="flex-1 flex justify-between items-center pl-lg">
          <strong>{{ item.name }}更新</strong>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-s-promotion"
            :loading="updateStatus == 1"
            round
            @click="doUpdateCdnVersion(item)"
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
  getVersionData,
  getUpdateStatus,
  doUpdateVersion
} from '@/v2/cdn_admin/api/public/version'

import {
  doUpdateStaticVariable
} from '@/v2/cdn_admin/api/public/index'

import { getLocation } from '@/utils/env'

export default {
  name: 'VersionDialog',
  data() {
    return {
      // 当前版本信息，数据库需要最先更新
      versionBaseData: {
        // 数据库
        db: 'el-icon-coin',
        // Web接口控制
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
  mounted() {
  },
  beforeDestroy() {
    // 清除定时器
    this.clearTimer()
  },
  methods: {
    // /**
    //  * @description: 更新变量，如果检测到本地的 protocol、hostname、port 跟线上的不一致，则要调用这个接口更新
    //  */    
    // async updateStaticVariable() {
    //   // 协议、主机、端口
    //   const { protocol, hostname, port } = getLocation()
    //   if ()
    //   const { data: res } = await doUpdateStaticVariable()
    // },

    /**
     * @description: 获取当前系统版本
     */

    async getCdnVersionData() {
      const { data: res } = await getVersionData()
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

        // 可更新的，远程和本地都不为空，并且远程不等于本地
        if (ITEM_OBJ.remote && ITEM_OBJ.local && ITEM_OBJ.remote != ITEM_OBJ.local) {
          updateArr.unshift(NEW_OBJ)
        }

        // 所有的
        allArr.unshift(NEW_OBJ)
      })

      this.updateVersionData = updateArr
      this.allVersionData = allArr

      // 如果有可更新的，则显示对话框
      if (updateArr.length) {
        // 是否已忽略本次更新
        const ignoreUpdates = window.sessionStorage.getItem('ignoreUpdates')
        this.dialogVisible = !ignoreUpdates
      }
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
      // const flag = this.updateVersionData.every(item => {
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
      window.sessionStorage.setItem('ignoreUpdates', true)
    }
  }
}
</script>

<style lang="scss" scoped>
.version-item {
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
  border-radius: 100px;
}
</style>
