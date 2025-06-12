<template>
  <el-card class="content-box" style="margin-top: 0">
    <ul
      class="menu-wrap flex items-center flex-wrap mb-lg rounded-2xl bg-ants-bg-3 p-3"
    >
      <li
        class="menu-item py-sm px-xl text-center text-sm font-bold text-ants-text-3 rounded-2xl cursor-color"
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

    <QueryTime @change="changeTime" v-model="query" hide5m class="mb-lg">
      <QueryDomain @change="changeDomain" class="mr-sm" />
      <QueryArea v-if="currentComponent === 'Origin'" @change="changeArea" />
    </QueryTime>

    <component ref="ChartRef" :is="currentComponent" />
  </el-card>
</template>

<script>
// 组件
import QueryTime from '../components/Query/Time'
import QueryDomain from '../components/Query/Domain'
import QueryArea from '../components/Query/Area'
import { getLocation } from '@/utils/env'

import Flow from './flow'
import Origin from './origin'
import Code from './code'
import Upstream from './upstream'
import { getToken } from '@/utils/auth'

const menuObj = {
  Flow: '流量带宽',
  Origin: '来源数据',
  Code: '状态码监控',
  Upstream: '回源监控'
  // realTime: '实时态势'
  // hotspot: '热点监控'
}

export default {
  components: {
    QueryTime,
    QueryDomain,
    QueryArea,

    Flow,
    Origin,
    Code,
    Upstream
  },
  data() {
    // 自定义的才有 实时态势
    // if (this.$mode[179]) {
    //   menuObj.realTime = '实时态势'
    // }

    return {
      currentComponent: this.$route.query.type || 'Flow',

      menuObj,
      query: {
        // 粒度
        // step: '5s',
        // // 开启时间
        // gte: '5m',
        // // 结束时间
        // lte: null,
        // 域名
        domains: [],
        // 区域
        area: 'china'
      }
    }
  },
  mounted() {},
  destroyed() {},
  methods: {
    changeMenu(key) {
      if (key === 'realTime') {
        // 跳转到实时态势页面
        const token = getToken()
        const { protocol, host, hash, href } = getLocation()
        console.log(hash, href, href.replace(hash, ''))
        const URL = this.debug
          ? `${this.$root.demoWebSite}/admin/`
          : href.replace(hash, '')
        window.open(`${URL}chart/#/orange?token=${token}`, '_blank')
        return
      }

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
    changeDomain({ ids = [], value = [] }) {
      this.query.domains = value
      this.getChart()
    },

    // 切换区域
    changeArea(area = 'china') {
      this.query.area = area
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
