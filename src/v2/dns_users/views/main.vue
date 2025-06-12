<template>
  <div>
    <!-- 未绑定手机号提示 -->
    <UnboundMobileTips v-if="isUnboundMobile" />

    <router-view
      :isUnverified="isUnverified"
      :isUnboundMobile="isUnboundMobile"
    ></router-view>

    <!-- 帮助文档 -->
    <!-- <Docs /> -->

    <!-- 未实名认证提示框 -->
    <UnverifiedDialog v-if="isUnverified && $route.name != 'Verification'" />
  </div>
</template>

<script>
// import Docs from '@/v2/cdn_common/components/Docs'

import { isUnverified, isUnboundMobile } from '../extra/computed'

// 未实名认证提示框
import UnverifiedDialog from '../components/UnverifiedDialog'
// 未绑定手机号提示 tips
import UnboundMobileTips from '../components/UnboundMobileTips'

export default {
  components: {
    // Docs,
    UnverifiedDialog,
    UnboundMobileTips
  },
  computed: {
    // 是否需要提示 实名认证
    isUnverified,
    // 是否需要提示 绑定绑定手机号
    isUnboundMobile
  },
  data() {
    return {}
  },
  created() {
    // 重置用户信息
    this.$root.resetUserinfo()
    
    // 获取用户信息
    this.$root.getUserinfo()
  },
  methods: {}
}
</script>
