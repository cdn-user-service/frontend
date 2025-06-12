<template>
  <el-card class="content-box" style="margin-top:0;">
    <ul
      class="menu-wrap flex items-center flex-wrap mb-lg rounded-2xl bg-ants-bg-3 p-3"
    >
      <li
        class="menu-item py-sm px-xl text-center text-sm font-bold text-ants-text-3
         rounded-2xl cursor-color"
        v-for="(item, key) in menuObj"
        :key="key"
        @click="changeMenu(key)"
        :class="{
          'active-menu': currentComponent === key
        }"
      >
        {{ antsT(item) }}
      </li>
    </ul>

    <QueryTime @change="changeTime" v-model="query">
      <QueryPort @change="changePort" class="mr-sm" />
    </QueryTime>

    <component ref="ChartRef" :is="currentComponent" />
  </el-card>
</template>

<script>
// 组件
import QueryTime from '../components/Query/Time.vue'
import QueryPort from '../components/Query/Port.vue'
import { getLocation } from '@/utils/env'
import Flow from './flow/index.vue'
import Code from './code/index.vue'

const menuObj = {
  Flow: '流量带宽',
  Code: '状态码监控'
}
export default {
  components: {
    QueryTime,
    QueryPort,
    Flow,
    Code
  },
  data() {
    return {
      menuObj,
      currentComponent: this.$route.query.type || 'Flow',
      query: {
        // timeValue: 300,
        // // 粒度
        // step: '5s',
        // // 开启时间
        // gte: '5m',
        // // 结束时间
        // lte: null,
        // 四层转发的ID
        streams: [],
        // 区域
        area: 'china'
      }
    }
  },
  mounted() {},
  destroyed() {},
  methods: {
    changeMenu(key) {
      this.currentComponent = key
      this.$router.replace({ query: { type: key } })
      setTimeout(() => {
        this.getChart()
      }, 100)
    },

    // 切换时间范围
    changeTime(val) {
      this.getChart()
    },

    // 切换域名，获取域名后会直接调用查询数据接口
    changePort({ port = [], plan = [] }) {
      this.query.streams = port
      this.getChart()
    },

    // 查询数据
    getChart() {
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
