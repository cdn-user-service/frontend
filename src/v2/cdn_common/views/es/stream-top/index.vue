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
          'active-menu': query.type === key
        }"
      >
        {{ antsT(item) }}
      </li>
    </ul>

    <div class="flex items-center justify-between">
      <el-radio-group
        v-model="query.gte"
        size="small"
        @change="changeTime"
        :loading="loading"
      >
        <ants-radio-button
          v-for="(item, key) in timeRange"
          :key="key"
          :label="key"
          :text="item.name"
        />
      </el-radio-group>

      <ants-button
        size="mini"
        type="success"
        icon="el-icon-refresh"
        class="refresh-btn"
        @click="getChart"
        :loading="loading"
        text="刷新"
      />
    </div>

    <TopTable ref="TopTableRef" />
  </el-card>
</template>

<script>
// 四层转发-转发排行页面
import TopTable from './TopTable.vue'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getAllPort } = require(`@/v2/${PROCESS_NAME}/api/cdn/stream`)

const timeRange = {
  '1h': {
    name: '近1小时',
    value: 3600,
    step: ['30s', '1m']
  },
  '6h': {
    name: '近6小时',
    value: 3600 * 6,
    step: ['1m', '5m']
  },
  '24h': {
    name: '近24小时',
    value: 3600 * 24,
    step: ['5m', '1h']
  },
  '7d': {
    name: '近7天',
    value: 3600 * 24 * 7,
    step: ['1h', '1d']
  },
  '30d': {
    name: '近30天',
    value: 3600 * 24 * 30,
    step: ['1d', '1d']
  }
}

const menuObj = {
  flow: '流量带宽排行',
  request: '请求数排行'
}
export default {
  components: {
    TopTable
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      loading: false,
      timeRange,
      menuObj,
      query: {
        // 开启时间
        gte: '1h',
        // 结束时间
        lte: null,
        // 以秒为单位
        timeValue: 3600,
        // 粒度
        step: '1m',
        // 区域
        area: 'china',
        type: this.$route.query.type || 'flow',
        // 端口，只有用户端才有，需要过滤过来
        ports: []
      }
    }
  },
  created() {},
  mounted() {
    // 用户端需要过滤端口
    if (!this.isAdmin) {
      this.getUserAllPort()
      return
    }
    this.getChart()
  },
  destroyed() {},
  methods: {
    // 获取用户所有的端口
    async getUserAllPort() {
      this.loading = true
      try {
        const { data: res } = await getAllPort()
        if (res.code !== 1) {
          this.loading = false
          return
        }
        const arr = res.data || []
        if (!arr.length) {
          this.$root.loading = false
          this.loading = false
          return
        }

        this.query.ports = arr
        this.getChart()
      } catch (err) {
        this.$root.loading = false
        this.loading = false
        throw err
      }
    },

    changeMenu(key) {
      this.query.type = key
      this.$router.replace({
        query: {
          type: key
        }
      })
      this.getChart()
    },

    // 切换时间范围
    changeTime(val) {
      // this.query.gte = gte
      // this.query.lte = lte
      // this.query.step = step
      this.query.timeValue = timeRange[val].value
      this.getChart()
    },

    // 切换区域
    changeArea(area = 'china') {
      this.query.area = area
      this.getChart()
    },

    // 查询数据
    getChart() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 500)
      this.$refs.TopTableRef.getChart(this.query)
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
