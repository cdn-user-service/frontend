<template>
  <el-card class="content-box animated fadeIn">
    <div class="mb-lg">
      <ants-input
        v-model="domain"
        placeholder="请选择域名进行查询"
        style="width:250px;"
        size="small"
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
      <el-col :span="12" v-for="(item, key) in timeObj" :key="key">
        <div class="p-2 bg-ants-bg-3 rounded-2xl mb-df" style="height:320px;">
          <div class="rounded-2xl bg-ants-bg-1 h-full w-full">
            <LineChart :ref="`LineChart${key}`" :title="item.label" />
          </div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import LineChart from './LineChart.vue'
export default {
  components: {
    LineChart
  },
  data() {
    return {
      domain: 'wildbee.cn',
      timeObj: {
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
    }
  },
  mounted() {
    this.renderChart()
  },
  methods: {
    renderChart() {
      this.$nextTick(() => {
        Object.keys(this.timeObj).forEach(key => {
          const query = {
            domain: this.domain,
            ...this.timeObj[key],
            time: key
          }

          this.$refs[`LineChart${key}`][0].getChart(query)
        })
      })
    }
  }
}
</script>
