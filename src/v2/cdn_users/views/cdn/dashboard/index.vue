<template>
  <div class="content-box animated fadeIn" style="margin-top:0;">
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 18 }"
        :xl="{ span: 18 }"
      >
        <LeftUserInfo
          ref="LeftUserInfoRef"
          :last-login-log="DashboardUserData.lastLoginLog || {}"
        />
        <LeftMonitor ref="LeftMonitorRef" />
        <!-- <LeftDocs ref="LeftDocsRef" class="hidden-md-and-down" /> -->
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 6 }"
        :xl="{ span: 6 }"
      >
        <RightCount
          ref="RightCountRef"
          :count="{
            site: DashboardUserData.siteCount,
            stream: DashboardUserData.streamCount,
            cert: DashboardUserData.certCount
          }"
        />
        <RightPlanUsed />
        <RightNotice />
      </el-col>
    </el-row>
  </div>
</template>

<script>
// API
import { getDashboardUser } from '@/v2/cdn_users/api/cdn/dashboard'
// 组件
import LeftUserInfo from './components/LeftUserInfo'
import LeftMonitor from './components/LeftMonitor'
// import LeftDocs from './components/LeftDocs'
import RightCount from './components/RightCount'
import RightPlanUsed from './components/RightPlanUsed'
import RightNotice from './components/RightNotice'
// import RightBill from './components/RightBill'

export default {
  components: {
    LeftUserInfo,
    LeftMonitor,
    // LeftDocs,

    RightCount,
    RightPlanUsed,
    RightNotice
    // RightBill
  },
  data() {
    return {
      DashboardUserData: {
        lastLoginLog: {
          // 最后登录时间
          createDate: null,
          // 登录IP
          ip: ''
        },
        // 站点数
        siteCount: 0,
        // 四层转发数
        streamCount: 0,
        // 套餐数
        suitCount: 0,
        // 证书总数
        certCount: 0
      }
    }
  },
  created() {
    this.getDashboardUserData()
  },
  methods: {
    // 获取服务概览数据
    async getDashboardUserData() {
      const { data: res } = await getDashboardUser()
      if (res.code !== 1) return
      this.DashboardUserData = {
        ...this.DashboardUserData,
        ...res.data
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
