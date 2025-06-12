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
    left: 20,
    top: 70,
    right: 20,
    bottom: 20,
    // grid 区域是否包含坐标轴的刻度标签
    containLabel: true
  },
  // 显示缩放时间轴
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

      return '<ul class="ants-format_box">' +
        `<li>${params[0].axisValueLabel}</li>` +
        res +
        '</ul>'
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
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    // name: '流量',
    type: 'bar',
    // id: '',
    showBackground: true,
    backgroundStyle: {
      color: 'rgba(180, 180, 180, 0.2)'
    }
  }]
}
