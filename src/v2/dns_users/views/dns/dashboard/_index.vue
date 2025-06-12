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
        <LeftUserInfo :userinfo="userinfo" />
        <LeftCount :count-obj="countObj" />

        <el-row :gutter="20">
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 8 }"
            :md="{ span: 8 }"
            :lg="{ span: 8 }"
            :xl="{ span: 8 }"
          >
            <LeftRoseChart />
          </el-col>
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 16 }"
            :md="{ span: 16 }"
            :lg="{ span: 16 }"
            :xl="{ span: 16 }"
          >
            <LeftLineChart />
          </el-col>
        </el-row>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 6 }"
        :xl="{ span: 6 }"
      >
        <RightPlan />
        <RightNotice />
      </el-col>
    </el-row>
  </div>
</template>

<script>
// API
import { getChartData } from '@/v2/dns_users/api/public'

// 组件
import LeftUserInfo from './components/LeftUserInfo'
import LeftCount from './components/LeftCount'
import LeftRoseChart from './components/LeftRoseChart'
import LeftLineChart from './components/LeftLineChart'
import RightPlan from './components/RightPlan'
import RightNotice from './components/RightNotice'
export default {
  components: {
    LeftUserInfo,
    LeftCount,
    LeftRoseChart,
    LeftLineChart,
    RightPlan,
    RightNotice
  },
  data() {
    return {
      // 用户信息
      userinfo: {
        userId: 0,
        username: '-',
        realnameStatus: 1,
        propertyBalance: 0,
        loginType: 'username'
      },

      // 数量统计
      countObj: {
        // 域名数
        domain: 0,
        // 域名错误数据
        domainErr: 0,
        // httpdns
        httpdns: 0,
        // 反向解析
        ptr: 0,
        // A监控
        monitor: 0
      }
    }
  },
  created() {
    this.getDashboardUserData()
  },
  methods: {
    /**
     * @description: 获取服务概览数据
     */

    async getDashboardUserData() {
      const { data: res } = await getChartData()
      if (res.code !== 1) return
      const obj = res.data || {}
      console.log(res)
      this.userinfo = {
        ...this.userinfo,
        ...obj.user_info
      }

      this.countObj.domain = obj.domain_sum || 0
      this.countObj.domainErr = obj.domain_err_sum || 0
      this.countObj.monitor = obj.m_task_sum || 0
      this.countObj.httpdns = obj.http_dns_sum || 0
    }
  }
}
</script>
