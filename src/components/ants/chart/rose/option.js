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
    bottom: 10,
    textStyle: {
      fontSize: 12
    }
  },
  grid: {
    left: 30,
    top: 30,
    right: 30,
    bottom: 30,
    // grid 区域是否包含坐标轴的刻度标签
    containLabel: true
  },
  tooltip: {
    trigger: 'item',
    className: 'ants-tooltip-box',
    padding: [15, 20],
    borderWidth: 0,
    textStyle: {
      fontSize: 12
    }
    // formatter: '{a} <br/>{b} : {c}次 ({d}%)'
  },
  series: [{
    type: 'pie',
    radius: ['0%', '60%'],
    center: ['50%', '50%'],
    // roseType: 'area',
    itemStyle: {
      borderRadius: 4
    },
    label: {
      show: true,
      textBorderWidth: 0
    },
    data: []
    // animationEasing: 'cubicInOut',
    // animationDurationUpdate: 1000,
    // animationEasingUpdate: 'cubicInOut'
  }]
}
