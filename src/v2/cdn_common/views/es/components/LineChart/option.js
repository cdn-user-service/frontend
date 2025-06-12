export default {
  darkMode: 'auto',
  title: {
    text: '',
    textStyle: {
      fontSize: 12
    },
    left: '20',
    top: '20'
  },
  // legend 指示器
  legend: {
    data: [''],
    textStyle: {
      fontSize: 11
    },
    top: 20
  },
  // 图表边距
  grid: {
    left: 10,
    top: 70,
    right: 20,
    bottom: 20,
    // grid 区域是否包含坐标轴的刻度标签
    containLabel: true
  },
  // 显示缩放时间轴
  // dataZoom: [
  //   {
  //     startValue: '2021-05-12'
  //   },
  //   {
  //     type: 'inside'
  //   }
  // ],
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
      // e.value[2] 为带单位的值
      params.forEach(e => {
        const values = e.value || []
        res += `<li>
                  <div class="format_name">
                    ${e.marker}${e.seriesName}
                  </div>
                  <strong style="color:${e.color}">
                    ${values[2] || values[1] || 0} 
                  </strong>
                </li>`
      })

      return `<ul class="ants-format_box">
                <li>${params[0].axisValueLabel}</li>
                ${res}
              </ul>`
    }
  },
  // 坐标轴指示器配置项
  axisPointer: {
    show: true,
    label: {
      backgroundColor: '#a8abb2',
      shadowBlur: 0
    }
  },
  xAxis: {
    type: 'time',
    splitLine: {
      show: false
    },
    boundaryGap: false,
    splitNumber: 4 // 坐标轴分割段数
    // minInterval: 3600 * 2 * 1000,
    // maxInterval: 3600 * 2 * 1000,
    // interval: 3600 * 2 * 1000
    // boundaryGap: ['10%', '10%'], // 坐标轴两边留白
  },
  yAxis: {
    // name: '(Mbps)',
    // nameLocation: 'end',

    // splitNumber: 2,
    type: 'value',
    boundaryGap: false,
    // 零 坐标轴
    axisLine: {
      show: false,
      lineStyle: {
        //   color: 'rgba(0, 0, 0, 0)'
      }
    },
    // 坐标轴刻度相关设置，小竖线
    axisTick: {
      show: false,
      length: 10
    },
    // 坐标轴刻度标签的相关设置
    axisLabel: {
      margin: 20
      // color: 'red'
    },
    //   axisTick: {
    //     // 坐标轴刻度相关设置
    //     lineStyle: {
    //       type: 'dashed'
    //     }
    //   },
    splitLine: {
      // show: false,
      lineStyle: {
        type: 'dashed'
      }
    }
  },
  series: []
}
