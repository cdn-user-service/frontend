<template>
  <el-dropdown @command="clickMore">
    <el-button
      type="info"
      size="small"
      :loading="btnLoading"
      :disabled="$root.loading"
    >
      {{ antsT('批量操作') }}<i class="el-icon-arrow-down el-icon--right"></i>
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <!-- <el-dropdown-item command="pushAll">一键推送</el-dropdown-item> -->
      <el-dropdown-item command="initAll">一键初始化</el-dropdown-item>
      <el-dropdown-item command="syncFile">同步文件</el-dropdown-item>
      <!-- <el-dropdown-item command="resetAgent">重启Agent</el-dropdown-item> -->
      <!-- <el-dropdown-item command="resetNginx">重启Nginx</el-dropdown-item> -->
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
// 推送数据接口，用于节点初始化
import { pushByInputInfo } from '@/v2/cdn_admin/api/cdn/push'

export default {
  data() {
    return {
      btnLoading: false
    }
  },
  methods: {
    async clickMore(command) {
      switch (command) {
        // 一键推送
        case 'pushAll':
          this.pushAll()
          break
        // 一键初始化
        case 'initAll':
          this.initAll()
          break
        // 重启Agent
        case 'resetAgent':
          this.resetAgent(7, 'Agent')
          break
        // 重启Nginx
        case 'resetNginx':
          this.resetAgent(3, 'Nginx')
          break
        // 同步文件
        case 'syncFile':
          this.syncFile()
          break
      }
    },

    async syncFile() {
      const result = await this.$doDelete({
        title: '同步文件',
        content: '此操作将同步文件 ，是否继续？',
        type: 'info'
      })
      if (!result) return

      this.btnLoading = true
      const { data: res } = await pushByInputInfo({
        all_file: 'null'
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.$msg.success(this.antsT('同步文件成功'))
      this.$emit('refreshData')
    },

    /**
     * @description: 推送所有节点
     */

    async pushAll() {
      const result = await this.$doDelete({
        title: '一键推送',
        content: '此操作将一键推送所有节点配置 ，是否继续？',
        type: 'info'
      })
      if (!result) return

      this.btnLoading = true
      const { data: res } = await pushByInputInfo({
        all_file: 'null'
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.$msg.success(this.antsT('推送成功'))
      this.$emit('refreshData')
    },

    /**
     * @description: 初始化所有节点
     */

    async initAll() {
      const result = await this.$doDelete({
        title: '初始化所有节点',
        content: '此操作将初始化所有节点 ，是否继续？',
        type: 'info'
      })
      if (!result) return

      this.btnLoading = true
      const { data: res } = await pushByInputInfo({
        initAllNode: 'null'
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.$msg.success(this.antsT('初始化成功'))
      this.$emit('refreshData')
    },

    /**
     * @description: 重启Agent、重启Nginx
     */

     async resetAgent(index, text) {
      const result = await this.$doDelete({
        title: '重启' + text,
        content: `此操作将重启${text} ，是否继续？`,
        type: 'info'
      })
      if (!result) return

      this.btnLoading = true
      const { data: res } = await pushByInputInfo({
        command: index
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.$msg.success(this.antsT(`重启${text}成功`))
      this.$emit('refreshData')
    }
  }
}
</script>
