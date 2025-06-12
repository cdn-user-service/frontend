export default {
    title: {
        text: '访问用户区域分布',
        textStyle: {
            fontSize: 12
        },
        top: 18,
        left: 20
    },
    grid: {
        left: 0,
        top: 20,
        right: 0,
        bottom: 20,
        containLabel: true // grid 区域是否包含坐标轴的刻度标签
    },
    tooltip: {
        className: 'ants-tooltip-box',
        padding: 15,
        borderWidth: 0,
        textStyle: {
            fontSize: 12
        },
        trigger: 'item',
        formatter: (params) => {
            // console.log(params)
            const nowValue = params.value || 0
            const res =
                '<li><div class="format_name">' +
                params.name +
                '<strong style="color:#177DFF;margin-left:20px;">' +
                nowValue +
                ' 次</strong></div></li>'

            const html =
                '<ul class="ants-format_box">' +
                '<li>' +
                params.seriesName +
                '：</li>' +
                res +
                '</ul>'
            return html
        }
    },
    visualMap: {
        min: 0,
        max: 1500,
        left: 20,
        bottom: 20,
        text: ['高', '低'], // 取值范围的文字
        inRange: {
            color: ['#CFE4FF', '#1A73E8'] // 取值范围的颜色
        },
        textStyle: {
            color: '#909399'
            // textBorderColor: '#ffffff',
            // textBorderWidth: 1
        },
        // type: 'piecewise', // 类型 ： piecewise， 默认为 continuous
        calculable: true, // 是否使用拖拽手柄
        show: true // 图注
    },
    geo: {
        map: 'china',
        roam: false, // 开启缩放和平移
        zoom: 1.1, // 视角缩放比例
        label: {
            // normal: {
            //     show: false,
            //     fontSize: 10,
            //     color: 'rgba(0,0,0,0.7)'
            // }
            // emphasis: {
            //     textStyle: {
            //         color: '#fff'
            //     }
            // }
        },
        itemStyle: {
            borderColor: 'rgba(0, 0, 0, 0.2)',
            areaColor: '#eee'
            // emphasis: {
            //     areaColor: '#F3B329', // 鼠标选择区域颜色
            //     shadowOffsetX: 0,
            //     shadowOffsetY: 0,
            //     shadowBlur: 20,
            //     borderWidth: 0,
            //     shadowColor: 'rgba(0, 0, 0, 0.5)'
            // }
        }

    },
    series: [
        {
            name: '访问次数',
            type: 'map',
            geoIndex: 0,
            data: null
        }
    ]
}
