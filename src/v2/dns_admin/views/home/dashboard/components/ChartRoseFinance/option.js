export default {
  title: {
    text: '',
    left: 20,
    top: 18,
    textStyle: {
      fontSize: 12
    }
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
    top: 0,
    right: 0,
    bottom: 0,
    containLabel: true // grid 区域是否包含坐标轴的刻度标签
  },
  tooltip: {
    trigger: 'item',
    className: 'ants-tooltip-box',
    padding: [15, 20],
    borderWidth: 0,
    textStyle: {
      fontSize: 12
    },
    formatter: params => {
      const { value, name } = params.data
      const { marker, color, percent } = params
      const res =
        '<li><div class="format_name">' +
        `${marker}${name}` +
        '</div>' +
        `<strong style="color:${color}">` +
        `${value}` +
        '</strong></li>'

      return (
        '<ul class="ants-format_box">' +
        `<li>${params.seriesName}</li>` +
        res +
        '</ul>'
      )
    }
    // formatter: '{a} <br/>{b} : {c}次 ({d}%)'
  },
  series: [
    {
      name: '收支情况',
      type: 'pie',
      radius: ['30%', '40%'],
      center: ['50%', '40%'],
      // roseType: 'area',
      itemStyle: {
        borderRadius: 4
      },
      data: [],
      animationEasing: 'cubicInOut',
      animationDurationUpdate: 1000,
      animationEasingUpdate: 'cubicInOut'
    }
  ]
}
