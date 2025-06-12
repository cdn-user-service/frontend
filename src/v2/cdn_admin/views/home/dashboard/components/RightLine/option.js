import {
  graphic
} from 'echarts'

export default {
  title: {
    text: ''
  },
  legend: {
    bottom: 0,
    left: 'center',
    textStyle: {
      fontSize: 12
    }
  },
  grid: {
    left: 0,
    right: 10,
    containLabel: true // grid 区域是否包含坐标轴的刻度标签
  },
  // toolbox: {
  //     show: false,
  //     feature: {
  //         dataZoom: {
  //             yAxisIndex: 'none'
  //         },
  //         dataView: { readOnly: false },
  //         magicType: { type: ['line', 'bar'] },
  //         restore: {},
  //         saveAsImage: {}
  //     }
  // },
  tooltip: {
    // 自定义类名
    className: 'ants-tooltip-box',
    padding: [15, 20],
    borderWidth: 0,
    textStyle: {
      fontSize: 12
    },
    trigger: 'axis',
    // 一直显示
    // alwaysShowContent: true,
    axisPointer: {
      animation: false,
      type: 'cross',
      snap: true,
      label: {
        // 坐标轴指示器的文本标签
        precision: 1 // 精度
      }
    },
    formatter: params => {
      let res = ''
      const unit = 's'
      params.forEach((e, i) => {
        res +=
          '<li><div class="format_name">' +
          `${e.marker}${e.seriesName}` +
          '</div>' +
          `<strong style="color:${e.color}">` +
          e.value +
          ' <span>' +
          unit +
          '</span></strong></li>'
      })

      return (
        '<ul class="ants-format_box">' +
        `<li>${params[0].axisValueLabel}</li>` +
        res +
        '</ul>'
      )
    }
  },
  xAxis: {
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
        data: [{
            type: 'max',
            name: 'Max'
          },
          {
            type: 'min',
            name: 'Min'
          }
        ]
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
    },
    {
      name: 'Lowest',
      type: 'line',
      smooth: true, // 是否平滑显示曲线
      data: [],
      markPoint: {
        data: [{
          name: '周最低',
          value: -2,
          xAxis: 1,
          yAxis: -1.5
        }]
      },
      areaStyle: {
        opacity: 0.8,
        color: new graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(2,179,64, 0.16)'
          },
          {
            offset: 1,
            color: 'rgba(2,179,64, 0)'
          }
        ])
      }
    }
  ]
}
