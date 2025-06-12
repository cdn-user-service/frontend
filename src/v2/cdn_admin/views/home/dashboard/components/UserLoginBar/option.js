export default {
    title: {
        show: true,
        text: '7天登陆用户',
        top: 0,
        textStyle: {
            fontSize: 12
        }
    },
    grid: {
        left: 10,
        top: 50,
        right: 10,
        bottom: 0,
        containLabel: true // grid 区域是否包含坐标轴的刻度标签
    },
    legend: {
        show: false
    },
    xAxis: {
        type: 'category',
        axisLabel: {
            show: false
        },
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
        axisLabel: {
            show: false
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
    series: [
        {
            name: '7天登录数',
            type: 'bar',
            data: [],
            barWidth: '45%', // 柱图宽度
            // 柱状图顶部数字
            label: {
                show: true,
                position: 'top'
            },
            animationDelay: function (idx) {
                return idx * 10
            }
        }
    ]
}
