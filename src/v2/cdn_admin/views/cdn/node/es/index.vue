<template>
  <div class="content-box animated fadeIn" style="margin-top: 0">
    <ants-tab-card
      :tab-arr="groupList"
      @change="changeGroup"
      :active="activeGroup"
    >
      <Query ref="QueryRef" @queryChart="queryChart">
        <el-select
          size="small"
          v-model="time"
          style="width: 90px"
          @change="changeTimer"
        >
          <el-option :value="3" label="3秒" />
          <el-option :value="5" label="5秒" />
          <el-option :value="10" label="10秒" />
          <el-option :value="30" label="30秒" />
          <el-option :value="0" label="关闭" />
        </el-select>
      </Query>

      <!-- <CardLineChart ref="CardLineChartRef"/> -->

      <OverviewTable ref="OverviewTableRef" />

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
    </ants-tab-card>
  </div>
</template>

<script>
import Query from './Query'
// import CardLineChart from './CardLineChart'
import OverviewTable from './OverviewTable'
import LineChart from './LineChart'

// API
import { getNodeGroup, getNodeList } from '@/v2/cdn_admin/api/cdn/node'

const menuObj = {
  nodeload: '负载情况',
  cpu: 'CPU监控',
  memory: '内存监控',
  // memoryAvailable: '可用内存',
  disk: '磁盘监控',
  diskio: '磁盘IO',
  networkio: '网络IO',
  requests: '请求数',
  active: '活跃数',
  waiting: '等待数',
  reading: '读取数',
  writing: '写入数',
  handled: '处理数',
  accepts: '接收数'
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
        // // 粒度
        // step: '1m',
        // // 开启时间
        // gte: '1h',
        // 粒度
        step: '5s',
        // 开启时间
        gte: '5m',
        // 结束时间
        lte: null,
        // 节点列表
        nodes: [],
        // 类型
        type: this.$route.query.type || 'nodeload'
      },

      // 节点分组
      groupList: [],
      activeGroup: null,

      time: 5,
      timer: null
    }
  },
  created() {
    this.getGroupData()
  },
  mounted() {},
  destroyed() {
    // 清除定时器
    this.clearTimer()
  },
  methods: {
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
      console.log(this.timer, '----', this.time)
      this.getChart()
      if (!this.query.nodes.length) return
      if (this.time == 0) return
      this.timer = setTimeout(this.setTimer, 1000 * this.time)
    },

    // 开始查询数据，渲染表格
    getChart() {
      this.query.append++
      this.$refs.OverviewTableRef.getInfraData(this.query)
      this.$refs.LineChartRef.queryChart(this.query)
    },

    // 清除定时器
    clearTimer() {
      clearTimeout(this.timer)
    },

    // 获取节点分组
    async getGroupData() {
      this.$root.loading = true
      try {
        const { data: res } = await getNodeGroup({
          name: '',
          page: 1,
          limit: 100
        })
        if (res.code !== 1) {
          this.$root.loading = false
          return
        }
        const obj = res.data || {}
        this.groupList = (obj.list || []).map((item) => ({
          label: item.name,
          value: item.id
        }))
        if (this.groupList.length) {
          this.activeGroup = this.groupList[0].value
        }

        // 查询节点
        this.getNodeList()
      } catch (err) {
        this.$root.loading = false
        throw err
      }
    },

    // 根据分组ID查询节点列表
    async getNodeList() {
      this.$root.loading = true
      try {
        const { data: res } = await getNodeList({
          // 分组ID
          areaId: this.activeGroup,
          ip: '',
          page: 1,
          limit: 100
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        this.query.nodes = (obj.list || []).map((item) => item.clientIp)
        // 查询数据
        this.queryChart(this.query)
      } finally {
        this.$root.loading = false
      }
    },

    // 切换分组
    changeGroup(val) {
      this.activeGroup = val
      // 查询节点
      this.getNodeList()
    },

    changeMenu(key) {
      this.query.type = key
      this.$router.replace({ query: { type: key } })
      this.queryChart()
      // this.$refs.LineChartRef.queryChart(this.query)
    },

    // 查询数据
    queryChart(query = {}) {
      this.query = {
        ...this.query,
        ...query,
        nodes: this.query.nodes,
        // nodes: ['121.62.17.152'],
        append: 0
      }

      this.setTimer()
      // this.$refs.OverviewTableRef.getInfraData(this.query)
      // this.$refs.LineChartRef.queryChart(this.query)
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-wrap {
  padding: 6px;
  background-color: theme('colors.ants-bg-3');
  .menu-item {
    min-width: 100px;
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
