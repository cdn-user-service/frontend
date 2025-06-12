export default {
    title: {
        show: false,
        text: '近7天注册用户',
        top: 0,
        textStyle: {
            fontSize: 12
        }
    },
    tooltip: {
        trigger: 'axis'
    },
    grid: {
        left: 10,
        top: 20,
        right: 10,
        bottom: 0,
        containLabel: true // grid 区域是否包含坐标轴的刻度标签
    },
    legend: {
        show: false
    },
    // toolbox: {
    //     show: false
    // },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [],
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
        splitNumber: 1,
        axisLabel: {
            show: false
        },
        axisLine: {
            show: false
        },
        axisTick: {
            // 坐标轴刻度相关设置，小竖线
            show: false
        },
        // 水平线
        splitLine: {
            show: false
        }
        // boundaryGap: [0, '100%']
    },
    series: [
        {
            name: '注册数',
            type: 'line',
            symbol: 'none',
            smooth: true, // 是否平滑显示曲线
            lineStyle: {
                // color: '#fff'
            },
            label: {
                show: false,
                position: 'top'
            },
            data: []
            // areaStyle: {
                // opacity: 0.8,
                // color: new echartCom.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                //     {
                //       offset: 0,
                //       color: 'rgb(0, 221, 255)'
                //     },
                //     {
                //       offset: 1,
                //       color: 'rgb(77, 119, 255)'
                //     }
                //   ])
            // }
        }
    ]
}
