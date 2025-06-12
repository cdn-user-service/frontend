import {
  graphic
} from 'echarts'

export default {
  title: {
    show: false
  },
  legend: {
    show: false
  },
  grid: {
    left: 0,
    right: 0,
    bottom: -10,
    top: 10,
    containLabel: false // grid 区域是否包含坐标轴的刻度标签
  },
  tooltip: {
    show: false
  },
  xAxis: {
    show: false,
    type: 'category',
    boundaryGap: false,
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    splitLine: {
      show: false
    },
    // 坐标线
    axisLine: {
      show: false
    },
    // 坐标轴刻度相关设置，小竖线
    axisTick: {
      show: false
    }
  },
  yAxis: {
    show: false,
    type: 'value',
    splitNumber: 4,
    axisLabel: {
      formatter: '{value}'
    },
    axisLine: {
      show: false,
      lineStyle: {
        //   color: 'rgba(0, 0, 0, 0)'
      }
    },
    axisTick: {
      // 坐标轴刻度相关设置，小竖线
      show: false,
      length: 10
    },
    // 水平线
    splitLine: {
      show: false,
      lineStyle: {
        type: 'dashed'
      }
    }
  },
  series: [{
      name: 'Highest',
      type: 'line',
      smooth: true, // 是否平滑显示曲线
      data: [],
      markPoint: {
        symbol: 'none'
      },
      areaStyle: {
        opacity: 0.8,
        color: new graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(23,125,255, 0.16)'
          },
          {
            offset: 1,
            color: 'rgba(23,125,255, 0)'
          }
        ])
      }
    }
  ]
}
