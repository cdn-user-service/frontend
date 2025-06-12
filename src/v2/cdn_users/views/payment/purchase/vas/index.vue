<template>
  <div class="payment-main mx-auto animated fadeInUp">
    <div class="pb-lg flex justify-between items-center">
      <div>
        <strong class="text-3xl mr-xs">{{ antsT('购买增值业务') }}</strong>
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

    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 16 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <LeftCard ref="LeftCardRef" @updateGoodInfo="updateGoodInfo" />
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 8 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <RightCard :form="form" />
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
      form: {
        // 选中商品
        good: {},
        // 选择绑定套餐
        serialNumber: '',
        // 生效时间 1650769152, 默认当前时间
        startTime: new Date().getTime(),
        // 按月、季、年购买
        type: 'm',
        // 购买数量
        sum: 1
      }
    }
  },
  computed: {},
  created() {},
  methods: {
    /**
     * @description: 更新当前选择套餐的数据
     * @param {*} plan
     * @param {*} type
     */

    updateGoodInfo(form = {}) {
      console.log(form)
      this.form = {
        ...this.form,
        ...form
      }
    }
  }
}
</script>
