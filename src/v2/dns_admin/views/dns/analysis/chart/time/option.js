import { graphic } from 'echarts'

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
    series: [
        {
            // name: '流量',
            type: 'line',
            id: '',
            smooth: true, // 是否平滑显示曲线
            showSymbol: false,
            data: [],
            markPoint: {
                data: [
                    { type: 'max', name: '最大值' },
                    { type: 'min', name: '最小值' }
                ]
            },
            lineStyle: {
                width: 1
                // color: '#177DFF'
            },
            // markLine: {
            //     data: [{ type: 'average', name: '平均值' }]
            // }
            // itemStyle: {
            //     color: 'rgb(255, 70, 131)'
            // },
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
