<template>
  <div class="analysis-box bg-login-bg-color min-h-full">
    <!-- 头部开始 -->
    <el-row :gutter="10">
      <el-col :span="6">
        <div class="chart_header_title">
          <span class="iconfont icon-jiance2"></span>
          <strong>Content Deliverry Network</strong>
        </div>
      </el-col>
      <el-col :span="9">
        <div class="chart_header_info">
          <div class="c_header_line"></div>
          <div>Real time node monitoring system</div>
        </div>
      </el-col>
      <el-col :span="9">
        <div></div>
      </el-col>
    </el-row>
    <!-- 头部结束 -->

    <FlightsGeo ref="FlightsGeoRef" />
  </div>
</template>

<script>
import FlightsGeo from './components/FlightsGeo'
export default {
  components: {
    FlightsGeo
  },
  data() {
    return {
      loading: false
    }
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang="scss">
.analysis-box {
//   min-height: 100vh;
  overflow: hidden;
  background-color: rgba(8, 16, 27, 1);
}
</style>
