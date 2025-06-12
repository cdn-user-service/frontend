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
    },
    formatter: params => {
      const { value, name, total, label, tag = '量' } = params.data
      const { marker, color, percent } = params
      const res = `<li>
       <div class="format_name">
        ${marker}总${tag}
       </div>
       <strong style="color:${color}">
        ${total}
       </strong>
    </li>
    <li>
      <div class="format_name">
       ${marker}${name}（${percent}%）
      </div>
      <strong style="color:${color}">
       ${label}
      </strong>
    </li>`

      return `<ul class="ants-format_box">
       <li>${params.seriesName}</li>
       ${res} 
     </ul>`
    }
  },
  series: [
    {
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
    }
  ]
}
