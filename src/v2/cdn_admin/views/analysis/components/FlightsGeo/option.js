export default {
    geo3D: {
        map: 'world',
        shading: 'realistic',
        silent: true,
        environment: false,
        // environment: new echarts.graphic.LinearGradient(
        //   0,
        //   0,
        //   0,
        //   0.1,
        //   [
        //     {
        //       offset: 0,
        //       color: '#cbe2e4' // 天空颜色
        //     },
        //     {
        //       offset: 0.7,
        //       color: '#409eff' // 地面颜色
        //     },
        //     {
        //       offset: 1,
        //       color: '#111' // 地面颜色
        //     }
        //   ],
        //   false
        // ),
        realisticMaterial: {
            roughness: 0.8,
            metalness: 0
        },
        postEffect: {
            enable: true
        },
        groundPlane: {
            show: false
        },
        light: {
            main: {
                intensity: 1,
                alpha: 30
            },
            ambient: {
                intensity: 0
            }
        },
        viewControl: {
            distance: 70,
            alpha: 89,

            panMouseButton: 'left',
            rotateMouseButton: 'right'
        },

        itemStyle: {
            // 地图配置
            color: '#323c48',
            borderWidth: 0.5,
            borderColor: '#111'
        },

        regionHeight: 0.5
    },
    series: [
        {
            type: 'lines3D',

            coordinateSystem: 'geo3D',

            effect: {
                show: true,
                period: 10,
                // 轨道宽度
                trailWidth: 1,
                // 轨道透明
                trailOpacity: 0.5,
                // 轨道长度
                trailLength: 0.2,
                // 动点运行速度
                constantSpeed: 2
            },

            blendMode: 'lighter',

            lineStyle: {
                width: 0.2,
                opacity: 0.05
            },

            data: null
        }
    ]
}
