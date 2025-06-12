
<template>
  <el-row :gutter="20">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 12 }"
      :md="{ span: 6 }"
      :lg="{ span: 6 }"
      :xl="{ span: 6 }"
      v-for="(item, idx) in countList"
      :key="idx"
    >
      <el-card class="mt-lg cursor-pointer">
        <div @click="$router.push(item.url)">
          <div class="flex items-center justify-between">
            <strong>{{ item.name }}</strong>
            <span
              class="aicon icon-youjiantou"
              :class="item.color"
            ></span>
          </div>
          <div class="mt-lg flex items-center">
            <span
              class="text-3xl mr-lg text-primary"
              style="font-size:30px;"
              :class="[item.icon, item.color]"
            ></span>
            <span
              v-loading="loading"
              element-loading-spinner="el-icon-loading"
            >
              <strong class="text-3xl">
                {{ countObj[item.key] || 0 }}
              </strong>
            </span>
            <span
              class="ml-xs font-bold"
              v-if="idx === 2"
            >+</span>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { getChartData } from '@/v2/dns_admin/api/public'

const countList = [
  {
    key: 'server_sum',
    name: '节点总数',
    icon: 'el-icon-s-shop',
    color: 'text-primary',
    url: '/dns/serve/node'
  },
  {
    key: 'domain_sum',
    name: '域名总数',
    icon: 'el-icon-s-shop',
    color: 'text-primary',
    url: '/dns/domain/list'
  },
  {
    key: 'record_count_sum',
    name: '解析记录总数',
    icon: 'el-icon-s-shop',
    color: 'text-success',
    url: '/dns/domain/list'
  },
  {
    key: 'acl_ip_sum',
    name: '已识别IP段',
    icon: 'el-icon-s-shop',
    color: 'text-primary',
    url: '/dns/ips/right'
  }
]

export default {
  data() {
    return {
      loading: false,
      countList,
      countObj: {
        server_sum: 0,
        domain_sum: 0,
        record_count_sum: 0,
        acl_ip_sum: 0
      }
    }
  },
  created() {
    this.getCountInfo()
  },
  methods: {
    // 获取计数信息
    async getCountInfo() {
      this.loading = true
      try {
        const queryKeys = []
        Object.keys(this.countObj).forEach((key) => {
          queryKeys.push(key)
        })
        const { data: res } = await getChartData({
          keys: queryKeys + ''
        })
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        this.countObj = {
          ...this.countObj,
          ...obj
        }
      } catch (error) {
        this.loading = false
        throw error
      }
    }
  }
}
</script>
