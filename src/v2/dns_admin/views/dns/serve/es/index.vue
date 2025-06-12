<template>
  <el-card>
    <Query
      ref="QueryRef"
      @queryChart="queryChart"
      :page="query.page"
      :pageSize="query.pageSize"
    >
      <el-select
        size="small"
        v-model="time"
        style="width: 90px; margin-left: 10px"
        @change="changeTimer"
      >
        <template #prefix>
          <div class="h-full pl-2 flex items-center">
            <i class="el-icon-time" style="font-size: 14px" />
          </div>
        </template>

        <el-option :value="3" label="3秒" />
        <el-option :value="5" label="5秒" />
        <el-option :value="10" label="10秒" />
        <el-option :value="30" label="30秒" />
        <el-option :value="0" label="关闭" />
      </el-select>
    </Query>

    <!-- <CardLineChart ref="CardLineChartRef"/> -->

    <OverviewTable ref="OverviewTableRef" @submit="selectNode" />

    <ul class="menu-wrap flex items-center rounded-2xl flex-wrap mt-lg">
      <li
        class="menu-item one_show_h rounded-2xl cursor-color"
        :class="{
          'active-menu': query.type === key
        }"
        v-for="(item, key) in menuObj"
        :key="key"
        @click="changeMenu(key)"
      >
        {{ item }}
      </li>
    </ul>

    <LineChart ref="LineChartRef" />
  </el-card>
</template>

<script>
import Query from './Query'
// import CardLineChart from './CardLineChart'
import OverviewTable from './OverviewTable'
import LineChart from './LineChart'

const menuObj = {
  nodeload: '负载情况',
  cpu: 'CPU监控',
  memory: '内存监控',
  // memoryAvailable: '可用内存',
  disk: '磁盘监控',
  diskio: '磁盘IO',
  networkio: '网络IO',
  qps: '请求QPS'
}

export default {
  components: {
    Query,
    // CardLineChart,
    OverviewTable,
    LineChart
  },
  data() {
    return {
      loading: false,
      // 菜单列表
      menuObj,
      query: {
        // 开启时间
        gte: '5m',
        // 结束时间
        lte: null,
        // 粒度
        step: '5s',
        // 节点列表
        nodes: [],
        // 类型
        type: this.$route.query.type || 'nodeload',
        append: 0,
        page: 1,
        pageSize: 1000
      },

      time: 5,
      timer: null
    }
  },
  created() {},
  mounted() {},
  destroyed() {
    // 清除定时器
    this.clearTimer()
  },
  methods: {
    selectNode(val) {
      this.$refs.QueryRef.selectNode(val)
    },
    changeTimer(val) {
      if (val == 0) {
        this.clearTimer()
        return
      }
      this.setTimer()
    },

    // 设置定时器 3s 刷新一下数据
    setTimer() {
      this.clearTimer()
      this.getChart()
      if (!this.query.nodes.length) return
      if (this.time == 0) return
      this.timer = setTimeout(this.setTimer, 1000 * this.time)
    },

    // 清除定时器
    clearTimer() {
      clearTimeout(this.timer)
    },

    getChart() {
      this.query.append++
      this.$refs.OverviewTableRef.getInfraData(this.query)
      this.$refs.LineChartRef.queryChart(this.query)
    },

    changeMenu(key) {
      this.query.type = key
      this.$router.replace({ query: { type: key } })
      this.queryChart()
    },

    // 查询数据
    queryChart(query = {}) {
      console.log('query', query)
      this.query = {
        ...this.query,
        ...query,
        append: 0
      }
      this.setTimer()
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-wrap {
  padding: 6px;
  background-color: theme('colors.ants-bg-3');
  .menu-item {
    width: 120px;
    padding: 10px 0;
    font-size: 12px;
    font-weight: 600;
    color: theme('colors.ants-text-3');
    text-align: center;
    white-space: nowrap;
    &:hover {
      color: theme('colors.primary');
    }
  }
  .menu-item.active-menu {
    background-color: theme('colors.ants-bg-1');
    color: theme('colors.primary');
    box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.1);
  }
}
</style>
