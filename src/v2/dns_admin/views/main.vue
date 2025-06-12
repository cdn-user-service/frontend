<template>
  <div>
    <router-view></router-view>

    <!-- 版本更新提示对话框 -->
    <!-- <VersionDialog ref="VersionDialogRef" /> -->
  </div>
</template>

<script>
// import VersionDialog from '../components/VersionDialog'
// import { queryPushTaskStatus } from '@/v2/cdn_admin/api/cdn/push'

export default {
  components: {
    // VersionDialog
  },
  data() {
    return {}
  },
  created() {
    // 获取 任务队列数
    // this.getTaskNum()
    // 获取当前用户信息
    this.$root.getUserinfo()
    // 获取CDN客户端配置
    this.$root.getOhterSite()
  },
  methods: {
    // 获取任务列表数
    // async getTaskNum() {
    //   const { data: res } = await queryPushTaskStatus({
    //     type: 1
    //   })
    //   this.$root.menuBadge.task = res.task_size
    // }
  }
}
</script>
