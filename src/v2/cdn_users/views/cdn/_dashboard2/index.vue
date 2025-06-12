<template>
  <div class="content-box animated fadeIn" style="margin-top:0px;">
    <TopUserInfoCard />
    <CountCard />
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 16 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <FlowLine />
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 8 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <PlanFlowTop />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import TopUserInfoCard from './components/TopUserInfoCard'
import CountCard from './components/CountCard'
import FlowLine from './components/FlowLine'
import PlanFlowTop from './components/PlanFlowTop'
export default {
  components: {
    TopUserInfoCard,
    CountCard,
    FlowLine,
    PlanFlowTop
  },
  data() {
    return {}
  },
  created() {},
  methods: {}
}
</script>
<style lang="scss" scoped></style>
