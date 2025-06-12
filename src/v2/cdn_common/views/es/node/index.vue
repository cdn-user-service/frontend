<template>
  <el-card>
    <!-- <ul
      class="menu-wrap flex items-center flex-wrap mb-lg rounded-2xl bg-ants-bg-3 p-3"
    >
      <li
        class="menu-item py-sm px-xl text-center text-sm font-bold text-ants-text-3
         rounded-2xl cursor-color"
        v-for="(item, key) in menuObj"
        :key="key"
        @click="changeMenu(key)"
        :class="{
          'active-menu': query.type === key
        }"
      >
        {{ antsT(item) }}
      </li>
    </ul> -->

    <QueryTime @change="changeTime" v-model="query">
      <QueryNode @change="changeNode" class="mr-sm" />
      <QueryArea v-if="$route.name === 'es-ndoe-origin'" @change="changeArea" />

      <el-select
        size="small"
        v-model="time"
        style="width:90px;"
        @change="changeTimer"
      >
        <template #prefix>
          <div class="h-full pl-2 flex items-center">
            <i class="el-icon-time" style="font-size:14px;" />
          </div>
        </template>

        <el-option :value="3" label="3秒" />
        <el-option :value="5" label="5秒" />
        <el-option :value="10" label="10秒" />
        <el-option :value="30" label="30秒" />
        <el-option :value="0" label="关闭" />
      </el-select>
    </QueryTime>

    <Flow ref="ChartRef" />
  </el-card>
</template>

<script>
// 组件
import QueryTime from '../components/Query/Time.vue'
import QueryArea from '../components/Query/Area.vue'
import QueryNode from '../components/Query/Node.vue'
import Flow from './Flow.vue'

const menuObj = {
  flow: '流量带宽',
  origin: '来源数据',
  code: '状态码监控',
  upstream: '回源监控',
  hotspot: '热点监控'
}
export default {
  components: {
    QueryTime,
    QueryArea,
    QueryNode,
    Flow
  },
  data() {
    return {
      loading: false,
      menuObj,
      query: {
        // 开启时间
        // gte: '5m',
        // // 结束时间
        // lte: null,
        // // 粒度
        // step: '5s',
        // 节点
        nodes: [],
        // 区域
        area: 'china',
        type: 'flow',
        // 查询次数
        append: 0
      },
      nodeList: [],

      time: 5,
      timer: null
    }
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
      this.getChart()
      if (!this.query.nodes.length) return
      if (this.time == 0) return
      this.timer = setTimeout(this.setTimer, 1000 * this.time)
    },

    // 清除定时器
    clearTimer() {
      clearTimeout(this.timer)
    },

    // 切换后会直接调用查询数据接口
    changeNode({ ids = [], value = [] }) {
      this.query.nodes = value
      this.queryChart()
    },

    changeMenu(key) {
      //   this.queryChart()
    },

    // 切换时间范围
    changeTime(val) {
      this.queryChart()
    },

    // 切换区域
    changeArea(area = 'china') {
      this.query.area = area
      this.queryChart()
    },

    queryChart() {
      this.query.append = 0
      this.setTimer()
    },

    // 查询数据
    getChart() {
      this.query.append++
      this.$nextTick(() => {
        this.$refs.ChartRef.getChart(this.query)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-item {
  // width: 120px;
}
.menu-item.active-menu {
  background-color: theme('colors.ants-bg-1');
  color: theme('colors.primary');
  box-shadow: 0px 0px 15px 1px rgba(23, 125, 255, 0.1);
}
.node-select-active {
  // font-weight: 600;
  color: theme('colors.primary');
}
</style>

<style lang="scss">
.line-chart-box {
  height: 320px;
  display: flex;
  border: 1px solid theme('colors.ants-border-2');
  border-radius: theme('borderRadius.2xl');

  @media screen and (max-width: 991px) {
    height: 250px;
  }

  @media screen and (max-width: 767px) {
    height: 220px;
  }
}
</style>

<style lang="scss">
.node-scrollbar {
  .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
</style>
