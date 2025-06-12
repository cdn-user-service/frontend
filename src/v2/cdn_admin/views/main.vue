<template>
  <div>
    <router-view :key="key"></router-view>

    <!-- 版本更新提示对话框 -->
    <!-- <VersionDialog ref="VersionDialogRef" /> -->
    <audio
      id="audio"
      ref="audio"
      class="hidden"
      style="height: 0; width: 0"
      :src="notice"
    />
  </div>
</template>

<script>
// import VersionDialog from '../components/VersionDialog'
import { queryPushTaskStatus } from '@/v2/cdn_admin/api/cdn/push'
import {
  getNewOrder,
  getWorkOrderDetail
} from '@/v2/cdn_admin/api/cdn/work-order'
const notice = require('@/assets/notice.mp3')

export default {
  components: {
    // VersionDialog
  },
  data() {
    return {
      timer: null,
      // 确保提示框只显示一次
      alertShowNum: 0,
      notice
    }
  },
  created() {
    // 获取 任务队列数
    this.getTaskNum()
    // 获取用户信息
    this.$root.getUserinfo()
    // 获取DNS客户端配置信息
    this.$root.getOhterSite()
    // 获取最新提交的工单
    this.setTimer()
  },
  mounted() {
    // this.$refs.audio.muted = false
  },
  beforeDestroy() {
    // 清除定时器
    this.clearTimer()
  },
  methods: {
    // 播放提示音
    async playAudio() {
      // 用户是否允许播放提示音
      const NOT_ALLOW_PLAY_AUDIO = localStorage.getItem('NOT_ALLOW_PLAY_AUDIO')
      if (NOT_ALLOW_PLAY_AUDIO == 1) return

      try {
        const res = await this.$refs.audio.play()
        console.log('res', res)
      } catch (err) {
        console.log('err', err)

        if (this.alertShowNum) return
        this.alertShowNum++

        this.$confirm('是否允许播放来自本站点的消息通知提示音', '权限申请', {
          confirmButtonText: '允许',
          cancelButtonText: '不允许',
          type: 'info',
          center: true
        })
          .then(() => {
            this.$refs.audio.play()
            localStorage.setItem('NOT_ALLOW_PLAY_AUDIO', 2)
          })
          .catch(() => {
            localStorage.setItem('NOT_ALLOW_PLAY_AUDIO', 1)
          })
          .finally(() => {
            this.alertShowNum = 0
          })
      }
    },

    // 获取任务列表数
    async getTaskNum() {
      const { data: res } = await queryPushTaskStatus({
        type: 1
      })
      this.$root.menuBadge.task = res.task_size
    },

    setTimer() {
      this.clearTimer()
      this.getNewOrder()
      this.timer = setTimeout(this.setTimer, 1000 * 5)
    },

    clearTimer() {
      clearTimeout(this.timer)
      this.timer = null
    },

    // 获取新工单
    async getNewOrder() {
      // 如果为工单详情页则不用提示
      if (this.$route.path === '/cdn/work-order/list/detail') {
        return
      }

      const { data: res } = await getNewOrder()
      if (res.code !== 1) return
      // 如果有新工单，并且没有重复显示
      if (res.newSum > 0) {
        this.getWorkOrderDetail(res.newSum)
      }
    },

    // 获取工单详情
    async getWorkOrderDetail(id) {
      if (!id) return
      const { data: res } = await getWorkOrderDetail({
        id
      })

      if (res.code !== 1) return
      const obj = res.data || {}
      const {
        title,
        categoryObj = {},
        lastSubmitDate,
        senderInfos = [],
        userName
      } = obj

      const msg = {
        content: `[${categoryObj.title}]${title}`,
        type: 'text',
        time: lastSubmitDate
      }

      if (senderInfos.length) {
        const obj = senderInfos[senderInfos.length - 1] || {}
        const content = JSON.parse(obj.content || '{}')

        msg.type = content.img ? 'img' : 'text'
        msg.content = content.img ? '[图片]' + content.text : content.text
        msg.time = obj.createdate
      }

      const notify = this.$notify({
        title: '工单消息',
        message: `
        <div style="width:280px;">
          <div class="truncate py-sm text-ants-text-1 cursor-color">${msg.content}</div>
          <div class="flex justify-between text-xs text-ants-text-4">
            <span class="truncate inline-block flex-1">
              <i class="el-icon-user">
            </i> ${userName}
            </span>
            <span>${msg.time}</span>
           </div>
        </div>
        `,
        dangerouslyUseHTMLString: true,
        // type: 'info',
        // iconClass: 'el-icon-info text-primary',
        position: 'bottom-right',
        offset: 0,
        duration: 0,
        onClick: () => {
          this.$router.push({
            path: '/cdn/work-order/list/detail',
            query: { id }
          })
          // 关闭弹窗
          notify.close()
        }
      })

      // 播放提示音
      this.playAudio()
    }
  }
}
</script>
