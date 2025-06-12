<template>
  <div>
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 24 }"
        :lg="{ span: 18 }"
        :xl="{ span: 18 }"
      >
        <Avatar />
        <CountItem />

        <el-row :gutter="20">
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 12 }"
            :md="{ span: 8 }"
            :lg="{ span: 8 }"
            :xl="{ span: 8 }"
            v-for="item in chartNameList"
            :key="item"
            class="mt-lg"
          >
            <component
              :is="item"
              :ref="`${item}Ref`"
            />
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
        <AuthInfo />

        <UpdateLog />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getChartData } from '@/v2/dns_admin/api/public'

// 组件
import Avatar from './components/Avatar'
import CountItem from './components/CountItem'

import ChartBarUserLogin from './components/ChartBarUserLogin'
import ChartRoseFinance from './components/ChartRoseFinance'
import ChartLineServe from './components/ChartLineServe'

import AuthInfo from './components/AuthInfo'
import UpdateLog from './components/UpdateLog'

export default {
  components: {
    Avatar,
    CountItem,

    ChartBarUserLogin,
    ChartRoseFinance,
    ChartLineServe,

    UpdateLog,
    AuthInfo
  },
  data() {
    return {
      loading: false,
      chartNameList: ['ChartBarUserLogin', 'ChartRoseFinance', 'ChartLineServe']
    }
  },
  created() {},
  methods: {
    /**
     * @description: 获取仪表盘数据
     */

    async getDashboardData() {
      this.loading = true
      const { data: res } = await getChartData()
      console.log(res)
      this.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}

      this.dashboardData = obj

      this.$refs.ChartRoseFinanceRef[0].getChart({
        rechargeTotal: obj.alread_recharge_sum || 0,
        payTotal: obj.alread_pay_sum || 0
      })

      this.$refs.ChartBarUserLoginRef[0].initWeekData(obj.app_user_login_7)

      this.$refs.ChartLineUserRegRef[0].initWeekData(obj.app_user_reg_7)
    }
  }
}
</script>
