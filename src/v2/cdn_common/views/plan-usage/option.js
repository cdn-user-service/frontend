import { graphic } from 'echarts'

export default {
    title: {
        text: '',
        top: 20,
        left: 20,
        textStyle: {
            fontSize: 12
        }
    },
    legend: {
        top: 20,
        left: 'center',
        textStyle: {
            fontSize: 11
        }
    },
    grid: {
        left: 20,
        top: 70,
        right: 20,
        bottom: 20,
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
            const unit = params[0].seriesId
            params.forEach((e, i) => {
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
        type: 'time',
        boundaryGap: false,
        splitNumber: 4, // 坐标轴分割段数
        splitLine: {
            show: false
        }
    },
    yAxis: {
        type: 'value',
        splitNumber: 2,
        boundaryGap: false,
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
        axisLabel: {
            margin: 20
        },
        
        // 水平线
        splitLine: {
            // show: false,
            lineStyle: {
                type: 'dashed'
            }
        }
    },
    series: [
        {
            id: '',
            name: '',
            type: 'line',
            // 是否平滑显示曲线
            smooth: true,
            // 是否显示曲线上的小圆圈
            showSymbol: false,
            data: [],
            markPoint: {
                data: [
                    { type: 'max', name: 'Max' },
                    { type: 'min', name: 'Min' }
                ]
            },
            lineStyle: {
                width: 2,
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
