<template>
  <div class="payment-main mx-auto animated fadeInUp">
    <div class="pb-lg flex justify-between items-center">
      <div>
        <strong class="text-3xl mr-xs">{{ antsT('购买CDN套餐') }}</strong>

      </div>
      <ants-button
        icon="el-icon-back"
        size="mini"
        type="primary"
        plain
        @click="$router.go(-1)"
        text="我再想想"
      />
    </div>

    <div class="ants-tips_box mb-lg">
      <span class="el-icon-info"></span>
      {{antsT('同一个套餐可多次购买，互为独立的套餐，时间不会叠加，在其有效期内可以正常使用。')}}
    </div>

    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 16 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <LeftCard ref="LeftCardRef" @updatePlanAndTime="updatePlanAndTime" />
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 8 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <RightCard :plan="plan" :type="type" :sum="sum" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LeftCard from './components/LeftCard'
import RightCard from './components/RightCard'

export default {
  components: {
    LeftCard,
    RightCard
  },
  data() {
    return {
      plan: {},
      type: 'm',
      sum: 1
    }
  },
  computed: {
    
  },
  created() {
    // 获取用户信息
    this.$root.getUserinfo()
  },
  methods: {
    /**
     * @description: 更新当前选择套餐的数据
     * @param {*} plan
     * @param {*} type
     */

    updatePlanAndTime({ plan = {}, type = '', sum = 1 }) {
      this.plan = plan
      this.type = type
      this.sum = sum
    }
  }
}
</script>
