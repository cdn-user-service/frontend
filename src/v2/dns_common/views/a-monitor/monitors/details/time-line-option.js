export default {
  darkMode: 'auto',
  title: {
    text: '',
    textStyle: {
      fontSize: 12
    },
    left: '0',
    top: '15'
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
    left: 0,
    top: 60,
    right: 20,
    bottom: 10,
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
    formatter: (params) => {
      const dangColor = '#F52443'
      let res = ''
      // const unit = params[0].seriesId
      params.forEach((e) => {
        const values = e.value || []
        res += `<li>
                  <div class="format_name">
                    ${e.marker}${e.seriesName}
                  </div>
                  <strong style="color:${
                    values[2] == '宕机' ? dangColor : e.color
                  }">
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

    splitNumber: 2,
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
  // visualMap: [
  //   {
  //     // type: 'continuous',
  //     show: false,
  //     dimension: 1,
  //     // orient: 'horizontal',
  //     // range: [0.1, 0.1],
  //     // inRange: {
  //     //   color: ['#ff6666', '#ff6666']
  //     // },
  //     // outOfRange: {
  //     //   color: [
  //     //     '#02B340',
  //     //     '#177DFF'
  //     //     // '#fac858',
  //     //     // '#ee6666',
  //     //     // '#73c0de',
  //     //     // '#3ba272',
  //     //     // '#fc8452',
  //     //     // '#9a60b4',
  //     //     // '#ea7ccc'
  //     //   ]
  //     // },

  //     pieces: [
  //       {
  //         gt: -1,
  //         lte: 0,
  //         color: 'red'
  //       },
  //       // {
  //       //   gt: 1714116344000,
  //       //   lte: 1714116344000,
  //       //   color: 'red'
  //       // },
  //       {
  //         gt: 1,
  //         color: '#409eff'
  //       }

  //       // {
  //       //   gt: 0,
  //       //   lte: 1714116344000,
  //       //   color: '#333333'
  //       // },
  //       // // {
  //       // //   gt: 1714116344000,
  //       // //   lte: 1714116344000,
  //       // //   color: 'red'
  //       // // },
  //       // {
  //       //   gt: 1714116344000,
  //       //   color: '#409eff'
  //       // }
  //     ]
  //   }
  // ],
  series: [
    // {
    //   // name: 'cpu',
    //   type: 'line',
    //   id: '',
    //   smooth: false, // 是否平滑显示曲线
    //   showSymbol: false,
    //   data: [],
    //   z: 1,
    //   zlevel: 1
    //   //   areaStyle: {
    //   //     opacity: 0.8,
    //   //     color: new graphic.LinearGradient(0, 0, 0, 1, [{
    //   //         offset: 0,
    //   //         color: 'rgba(23,125,255, 0.16)'
    //   //       },
    //   //       {
    //   //         offset: 1,
    //   //         color: 'rgba(23,125,255, 0)'
    //   //       }
    //   //     ])
    //   //   }
    // }
    // {
    // name: '',
    // type: 'line',
    // id: '',
    // smooth: true, // 是否平滑显示曲线
    // showSymbol: false,
    // data: [],
    // markPoint: {
    //   data: [{
    //       type: 'max',
    //       name: '最大值'
    //     },
    //     {
    //       type: 'min',
    //       name: '最小值'
    //     }
    //   ]
    // }
    // markLine: {
    //     data: [{ type: 'average', name: '平均值' }]
    // }
    // itemStyle: {
    //     color: 'rgb(255, 70, 131)'
    // },
    // areaStyle: {
    //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    //     {
    //       offset: 0,
    //       color: 'rgb(121, 162, 228)'
    //     },
    //     {
    //       offset: 1,
    //       color: 'rgb(88, 118, 216)'
    //     }
    //   ])
    // },
    // itemStyle: {
    //   // 普通样式。
    //   normal: {
    //     // 点的颜色。
    //     color: '#419EFF'
    //   },
    //   // 高亮样式。
    //   emphasis: {
    //     // 高亮时点的颜色。
    //     color: '#419EFF'
    //   }
    // },
    // lineStyle: {
    //   width: 1
    // }
  ]
}
