import { graphic } from 'echarts'

export default {
    title: {
        text: ''
    },
    legend: {
        show: false,
        top: 0,
        left: 'center',
        textStyle: {
            fontSize: 12
        }
    },
    grid: {
        left: 20,
        top: 20,
        right: 20,
        bottom: 2,
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

            return '<ul class="ants-format_box">' +
                `<li>${params[0].axisValueLabel}</li>` +
                res +
                '</ul>'
        }
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        splitLine: {
            show: false
        },
        axisLabel: {
            show: true
        },
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
        type: 'value',
        splitNumber: 4,
        axisLabel: {
            show: false,
            formatter: '{value}'
        },
        axisLine: {
            show: true,
            lineStyle: {
                //   color: 'rgba(0, 0, 0, 0)'
            }
        },
        axisTick: {
            // 坐标轴刻度相关设置，小竖线
            show: true,
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
            name: '带宽',
            type: 'line',
            // 是否平滑显示曲线
            smooth: true,
            // 是否显示曲线上的小圆圈
            showSymbol: false,
            data: [],
            lineStyle: {
                width: 1,
                color: '#177DFF'
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
