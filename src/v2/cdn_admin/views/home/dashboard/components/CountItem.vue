
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
      <el-card class="mt-lg cursor-pointer count-item-box">
        <div @click="$router.push(item.url)">
          <div class="flex items-center justify-between">
            <strong>{{ antsT(item.name) }}</strong>
            <span
              class="aicon icon-youjiantou text-primary"
              :style="{ color: item.color }"
            ></span>
          </div>
          <div class="mt-lg flex items-center">
            <span
              class="text-5xl mr-lg text-primary"
              :class="item.icon"
              :style="{ color: item.color }"
            ></span>
            <span
              v-loading="loading"
              element-loading-spinner="el-icon-loading"
            >
              <strong class="text-3xl">
                {{ countObj[item.key] || 0 }}
              </strong>
            </span>
            <strong
              class="ml-sm"
              v-if="idx === 1"
            >+</strong>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { getChartData } from '@/v2/cdn_admin/api/public'

const countList = [
  {
    key: 'node_sum',
    name: '节点总数',
    icon: 'el-icon-s-shop',
    color: '#02B340',
    url: '/cdn/node/list'
  },
  {
    key: 'site_sum',
    name: '域名总数',
    icon: 'el-icon-s-shop',
    color: '#177DFF',
    url: '/cdn/site/domain'
  },
  {
    key: 'cert_sum',
    name: '证书总数',
    icon: 'el-icon-s-shop',
    color: '#FAC858',
    url: '/cdn/site/certificate'
  },
  {
    key: 'streamProxy_sum',
    name: '转发端口数',
    icon: 'el-icon-s-shop',
    color: '#FB9679',
    url: '/cdn/stream/list'
  }
]

export default {
  props: {},
  data() {
    return {
      loading: false,
      countList,
      countObj: {
        node_sum: 0,
        site_sum: 0,
        cert_sum: 0,
        streamProxy_sum: 0
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

<style lang="scss" scoped>
.count-item-box.el-card {
  transition: all 0.3s;
  &:hover {
    box-shadow: 0px 5px 15px 1px rgba(0, 0, 0, 0.1);
  }
}
</style>
