<template>
  <el-card class="mb-lg" style="min-height:350px;">
    <div slot="header">
      <strong>{{ antsT('最新公告') }}</strong>
    </div>

    <el-skeleton :rows="6" animated :loading="loading">
      <el-empty description="暂无数据" v-if="!noticeList.length" />
      <ul class="space-y-6" v-else>
        <li v-for="item in noticeList" :key="item.id" class="">
          <div class="text-sm mb-xs text-ants-text-4">
            <i class="el-icon-time"></i>
            {{ item.createtime }}
            <!-- <span
              v-if="idx === 0"
              class="bg-success inline-block rounded-lg px-2 pb-1 text-white"
              >new</span
            > -->
          </div>
          <div
            class="truncate text-ants-text-3 cursor-color text-sm"
            @click="goMessageDetail(item)"
          >
            {{ item.title }}
          </div>
        </li>
      </ul>
    </el-skeleton>

    <!-- 查看公告详情对话框 -->
    <MessageDialog ref="MessageDialogRef" />
  </el-card>
</template>

<script>
// API
import { getNoticeList } from '@/v2/dns_users/api/dns/message'

export default {
  components: {},
  data() {
    return {
      loading: false,
      noticeList: []
    }
  },
  created() {
    this.getNoticeData()
  },
  methods: {
    // 获取公告数据
    async getNoticeData() {
      this.loading = true
      const { data: res } = await getNoticeList({
        pagenum: 1,
        pagesize: 8
      })
      this.loading = false

      if (res.code !== 1) return
      const obj = res.data || {}
      this.noticeList = obj.list || []
    },

    // 查看详情
    // 查看公告详情
    goMessageDetail(item = {}) {
      this.$refs.MessageDialogRef.show(item)
    }
  }
}
</script>
