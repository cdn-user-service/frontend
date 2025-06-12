<template>
  <el-card class="mb-lg">
    <div class="flex items-center justify-between pb-sm">
      <strong>{{ antsT('系统授权') }}</strong>
      <span
        class="el-icon-more cursor-color"
        @click="$router.push('/home/auth')"
      ></span>
    </div>

    <el-skeleton :rows="6" :loading="loading" animated>
      <template>
        <ul class="auth-info-box">
          <li class="text-sm pb-lg text-ants-text-4">
            <span>到期时间：</span>
            <span>{{ (authInfo.endtime * 1000) | dateFormat }}</span>
          </li>
          <li
            class="flex justify-between items-center border-t border-ants-border-4 py-lg"
          >
            <span>授权 IP </span>
            <span class="text-sm">{{ authInfo.ip }}</span>
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
            <ants-copy class="text-sm" :text="authInfo.goods_code" />
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
// API
import { getAuthInfo } from '@/v2/cdn_admin/api/home/auth'

export default {
  data() {
    return {
      loading: false,
      authInfo: {
        // 产品名称
        goods: '',
        // 产品识别码
        goods_code: '',
        // 授权IP
        ip: '',
        // 节点数
        access_max: 0,
        // 版本号
        version: '0.0.0',
        // 到期时间
        endtime: 0,
        // 创建时间
        addtime: 0
      }
    }
  },
  created() {
    this.getAuthInfoData()
  },
  methods: {
    /**
     * @description: 获取当前系统版本信息
     */

    async getAuthInfoData() {
      this.loading = true
      try {
        const { data: res } = await getAuthInfo()
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data && JSON.parse(res.data)
        this.authInfo = {
          ...this.authInfo,
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
