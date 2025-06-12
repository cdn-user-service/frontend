<template>
  <el-card class="">
    <TitleBorder title="最新公告" />

    <el-skeleton :rows="2" :loading="loading" animated>
      <div
        class="text-center  text-ants-text-4"
        v-if="!noticeList.length"
      >
        <el-empty
          style="transform: scale(0.5);padding:0;height: 100px;"
          description=" "
        />
        <div>{{ antsT('暂无数据') }}</div>
      </div>

      <ul
        v-else
        style="max-height: 200px;"
        class="overflow-y-auto pt-xs -mb-sm"
      >
        <li
          v-for="(item, idx) in noticeList"
          :key="item.id"
          @click="goMessageDetail(item)"
          :class="{ 'border-t': idx > 0 }"
          class="border-ants-border-3 border-dashed py-sm text-sm flex items-center justify-between cursor-color"
        >
          <div class="flex-1 truncate">{{ item.title }}</div>

          <div class="pl-lg text-ants-text-4 text-xs">
            {{ $dayjs(item.createtime).format('YYYY-MM-DD') }}
          </div>
        </li>
      </ul>
    </el-skeleton>

    <!-- 查看公告详情对话框 -->
    <MessageDialog ref="MessageDialogRef" title="公告详情" />
  </el-card>
</template>

<script>
// API
import { getNoticeList } from '@/v2/cdn_users/api/public'

export default {
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
    // 获取公告列表
    async getNoticeData() {
      this.loading = true
      try {
        const { data: res } = await getNoticeList({
          pagenum: 1,
          pagesize: 3
        })
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

<style lang="scss" scoped></style>
