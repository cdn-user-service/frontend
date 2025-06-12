import { graphic } from 'echarts'

export default {
  title: {
    text: ''
  },
  legend: {
    show: false
  },
  grid: {
    left: -15,
    right: 10,
    bottom: 0,
    top: 60,
    containLabel: true // grid 区域是否包含坐标轴的刻度标签
  },
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
    formatter: (params) => {
      let res = ''
      const unit = params[0].seriesId
      params.forEach((e, i) => {
        // 如果数据为空
        // if (e.value[1] === null) return
        res +=
          '<li><div class="format_name">' +
          `${e.marker}${e.seriesName}` +
          '</div>' +
          `<strong style="color:${e.color}">` +
          e.value[1] +
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
  // 坐标轴指示器配置项
  axisPointer: {
    show: false,
    label: {
      backgroundColor: '#a8abb2',
      shadowBlur: 0
    }
  },
  xAxis: {
    show: false,
    type: 'time',
    splitLine: {
      show: false
    },
    splitNumber: 4, // 坐标轴分割段数
    // 坐标线
    axisLine: {
      show: true
    },
    // 坐标轴刻度相关设置，小竖线
    axisTick: {
      show: true
    }
  },
  yAxis: {
    show: false,
    type: 'value',
    splitNumber: 3,
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
  series: [
    {
      type: 'line',
      id: '',
      smooth: true, // 是否平滑显示曲线
      showSymbol: false,
      data: [],
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
