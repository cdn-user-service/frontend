import { graphic } from 'echarts'

export default {
  title: {
    show: true,
    text: ''
  },
  legend: {
    show: false
  },
  grid: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    containLabel: false // grid 区域是否包含坐标轴的刻度标签
  },
  tooltip: {
    show: false
  },
  xAxis: {
    show: false,
    type: 'category'
  },
  yAxis: {
    show: false,
    type: 'value'
  },
  series: [
    {
      name: 'Highest',
      type: 'line',
      smooth: true, // 是否平滑显示曲线
      data: [],
      markPoint: {
        symbol: 'none'
      },
      areaStyle: {
        opacity: 0.8,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
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
