<template>
  <el-card class="mb-lg">
    <div class="mb-df">
      <TitleBorder title="最新公告" />
    </div>
    <el-skeleton :rows="6" animated :loading="loading">
      <el-empty description="暂无数据" v-if="!noticeList.length" />
      <ul v-else style="max-height: 400px;" class="overflow-y-auto">
        <li
          v-for="(item, idx) in noticeList"
          :key="item.id"
          @click="goMessageDetail(item)"
          :class="{ 'border-t': idx > 0 }"
          class="border-ants-border-3 border-dashed py-df text-sm flex items-center justify-between cursor-color"
        >
          <div class="flex-1 truncate">{{ item.title }}</div>
          <div class="pl-lg text-ants-text-4">
            {{ $dayjs(item.createtime).format('YYYY-MM-DD') }}
          </div>
        </li>
      </ul>
    </el-skeleton>

    <!-- 查看公告详情对话框 -->
    <MessageDialog ref="MessageDialogRef" title="公告详情"/>
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
      try {
        const { data: res } = await getNoticeList({
          pagenum: 1,
          pagesize: 15
        })
        this.loading = false
        if (res.code !== 1) return
        this.noticeList = (res.data || {}).list || []
      } finally {
        this.loading = false
      }
    },

    // 查看公告详情
    goMessageDetail(item = {}) {
      this.$refs.MessageDialogRef.show(item)
    }
  }
}
</script>
