<template>
  <el-card class="content-box animated fadeIn">
    <div class="mb-lg">
      <SelectDomain
        @change="changeSelectDomain"
        ref="SelectDomainRef"
        :multiple="false"
        class="mr-sm"
      />
      <ants-button
        text="查 询"
        icon="el-icon-search"
        type="primary"
        size="small"
        @click="renderChart()"
      />
    </div>

    <el-row :gutter="15">
      <el-col
        :span="12"
        v-for="(item, key) in timeObj"
        :key="key"
      >
        <div
          class="p-2 bg-ants-bg-3 rounded-2xl mb-df"
          style="height:320px;"
        >
          <div class="rounded-2xl bg-ants-bg-1 h-full w-full">
            <LineChart
              :ref="`LineChart${key}`"
              :title="item.label"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import SelectDomain from '@/v2/cdn_common/components/SelectDomain'
import LineChart from './LineChart.vue'

const timeObj = {
  '1h': {
    label: '近1小时',
    step: '1m',
    stepVal: 60,
    unit: '分钟'
  },
  '1d': {
    label: '近24小时',
    step: '1h',
    stepVal: 60 * 60,
    unit: '小时'
  },
  '7d': {
    label: '近7天',
    step: '1h',
    stepVal: 60 * 60,
    unit: '小时'
  // },
  // '30d': {
  //   label: '近30天',
  //   step: '24h',
  //   stepVal: 60 * 60 * 24,
  //   unit: '天'
  }
}
export default {
  components: {
    SelectDomain,
    LineChart
  },
  data() {
    return {
      domain: '',
      timeObj
    }
  },
  mounted() {
    this.renderChart()
  },
  methods: {
    // 选择域名
    changeSelectDomain({ domains = [] }) {
      console.log(domains)
      this.domain = domains[0]
      this.renderChart()
    },

    // 渲染图表
    renderChart() {
      this.$nextTick(() => {
        Object.keys(this.timeObj).forEach((key) => {
          const query = {
            domain: this.domain,
            ...this.timeObj[key],
            range: key
          }

          this.$refs[`LineChart${key}`][0].getChart(query)
        })
      })
    }
  }
}
</script>
