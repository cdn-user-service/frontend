<template>
  <el-card class="mb-lg">
    <div class="flex items-center justify-between pb-sm">
      <strong>{{ antsT('系统授权') }}</strong>
      <span
        class="text-sm cursor-color text-primary"
        @click="$router.push('/home/auth')"
        >详情</span
      >
    </div>

    <el-skeleton :rows="6" :loading="loading" animated>
      <template>
        <ul class="auth-info-box">
          <li class="text-sm pb-lg text-ants-text-4">
            <span>到期时间：</span>
            <span>{{ (authInfo.end_time * 1000) | dateFormat }}</span>
          </li>
          <li
            class="flex justify-between items-center border-t border-ants-border-4 py-lg"
          >
            <span>授权 IP </span>
            <span class="text-sm">{{ authInfo.auth_ip }}</span>
          </li>
          <li
            class="flex justify-between items-center border-t border-ants-border-4 py-lg"
          >
            <span>产品名称</span>
            <span class="text-sm">{{ authInfo.goods }}</span>
          </li>
          <li
            class="flex justify-between items-center border-t border-ants-border-4 py-lg"
          >
            <span>产品识别码</span>
            <span class="text-sm">
              <ants-copy :text="authInfo.goods_code" />
            </span>
          </li>
          <li
            class="flex justify-between items-center border-t border-ants-border-4 py-lg"
          >
            <span>节点数</span>
            <strong>{{ authInfo.access_max }}</strong>
          </li>
          <li
            class="flex justify-between items-center border-t border-ants-border-4 pt-lg"
          >
            <span>版本号</span>
            <el-tag size="small" type="success">{{ authInfo.version }}</el-tag>
          </li>
        </ul>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
import { getChartData } from '@/v2/dns_admin/api/public'

export default {
  data() {
    return {
      loading: false,
      authInfo: {
        // 到期时间
        end_time: 0,
        // 授权IP
        auth_ip: '',
        // 产品名称
        goods: '',
        // 产品识别码
        goods_code: '',
        // 节点数
        access_max: 0,
        // 版本号
        version: '1.0.0'
      }
    }
  },
  created() {
    this.getAuthInfo()
  },
  methods: {
    // 获取授权信息
    async getAuthInfo() {
      this.loading = true
      try {
        const { data: res } = await getChartData({
          keys: 'auth_info'
        })
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        const authInfo = obj.auth_info || {}
        const goodsObj = authInfo.data || {}
        this.authInfo = {
          ...this.authInfo,
          ...authInfo,
          goods: goodsObj.goods,
          goods_code: goodsObj.goods_code,
          access_max: goodsObj.access_max || 0,
          version: goodsObj.version || '-'
        }
      } catch (error) {
        this.loading = false
        throw error
      }
    }
  }
}
</script>
