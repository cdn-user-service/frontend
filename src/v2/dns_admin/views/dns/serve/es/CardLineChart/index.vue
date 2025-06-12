<template>
  <el-row :gutter="20">
    <el-col
      :xs="{ span: 24 }"
      :sm="{ span: 12 }"
      :md="{ span: 6 }"
      :lg="{ span: 6 }"
      :xl="{ span: 6 }"
      v-for="(item, key) in averageObj"
      :key="key"
    >
      <div
        class="rounded-2xl border border-ants-border-2 relative overflow-hidden mb-sm"
        style="height:150px;"
        v-loading="item.loading"
      >
        <Chart :ref="`ChartRef${key}`" />

        <div class="absolute h-full w-full p-df z-10 top-0 left-0">
          <div class="font-semibold">
            {{ item.title }}
          </div>
          <div class="text-sm text-ants-text-4 pt-1">
            Average
          </div>
        </div>
        <span class="absolute bottom-0 right-0 p-df z-10">
          <strong class="text-3xl">{{ item.avg }}</strong>
          {{ item.unit }}
        </span>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { getElastic } from '@/v2/dns_admin/api/dns/monitor'

import Chart from './Chart.vue'

const averageAggs = {
  cpu: {
    // 查询图表
    aggsTime: {
      1: {
        avg: {
          field: 'system.cpu.user.pct'
        }
      },
      2: {
        avg: {
          field: 'system.cpu.system.pct'
        }
      },
      3: {
        max: {
          field: 'system.cpu.cores'
        }
      }
    },
    // 查询平均值
    aggsAvg: {
      user: {
        avg: {
          field: 'system.cpu.user.pct'
        }
      },
      system: {
        avg: {
          field: 'system.cpu.system.pct'
        }
      },
      cores: {
        max: {
          field: 'system.cpu.cores'
        }
      }
    }
  },
  memory: {
    aggsTime: {
      1: {
        avg: {
          field: 'system.memory.actual.used.pct'
        }
      }
    },
    aggsAvg: {
      used: {
        avg: {
          field: 'system.memory.actual.used.pct'
        }
      }
    }
  },
  rx: {
    aggsTime: {
      1: {
        avg: {
          field: 'host.network.ingress.bytes'
        }
      },
      '2-bucket': {
        filter: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    {
                      exists: {
                        field: 'host.network.ingress.bytes'
                      }
                    }
                  ],
                  minimum_should_match: 1
                }
              }
            ]
          }
        },
        aggs: {
          '2-metric': {
            max: {
              field: 'metricset.period'
            }
          }
        }
      }
    },
    aggsAvg: {
      'ingress-avg': {
        avg: {
          field: 'host.network.ingress.bytes'
        }
      },
      'ingress-avg-bucket': {
        filter: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    {
                      exists: {
                        field: 'host.network.ingress.bytes'
                      }
                    }
                  ],
                  minimum_should_match: 1
                }
              }
            ]
          }
        },
        aggs: {
          '1-metric': {
            max: {
              field: 'metricset.period'
            }
          }
        }
      }
    }
  },
  tx: 'Network outbound (TX)'
}

export default {
  components: {
    Chart
  },
  data() {
    return {
      loading: false,
      averageObj: {
        cpu: {
          title: 'CPU Usage',
          loading: true,
          unit: '%',
          avg: 0
        },
        memory: {
          title: 'Memory Usage',
          loading: true,
          unit: '%',
          avg: 0
        },
        rx: {
          title: 'Network inbound (RX)',
          loading: true,
          unit: 'kbit',
          avg: 0
        },
        tx: {
          title: 'Network outbound (TX)',
          loading: true,
          unit: 'kbit',
          avg: 0
        }
      }
    }
  },
  created() {},
  methods: {
    // 获取表格数据
    async getChartData({ range, step, nodes }) {
      Object.keys(this.averageObj).forEach(async (key) => {
        this.averageObj[key].loading = true

        const queryObj = {
          aggs: {
            0: {
              date_histogram: {
                field: '@timestamp',
                fixed_interval: step,
                // calendar_interval: '1m',
                time_zone: 'Asia/Shanghai'
                //   extended_bounds: {
                //     min: 1689043400404,
                //     max: 1689047000404
                //   }
              },
              aggs: {
                1: {
                  avg: {
                    field: 'system.cpu.user.pct'
                  }
                },
                2: {
                  avg: {
                    field: 'system.cpu.system.pct'
                  }
                },
                3: {
                  max: {
                    field: 'system.cpu.cores'
                  }
                }
              }
            },
            user: {
              avg: {
                field: 'system.cpu.user.pct'
              }
            },
            system: {
              avg: {
                field: 'system.cpu.system.pct'
              }
            },
            cores: {
              max: {
                field: 'system.cpu.cores'
              }
            }
          },
          size: 0,
          query: {
            bool: {
              must: [],
              filter: [
                //   {
                //     terms: {
                //       'host.name': [
                //         '192.168.1.110',
                //         'QLc7etlu3fnrwh',
                //         'localhost.localdomain'
                //       ]
                //     }
                //   },
                {
                  exists: {
                    field: 'host.name'
                  }
                },
                {
                  range: {
                    '@timestamp': {
                      gte: 'now-' + range,
                      lte: 'now'
                    }
                  }
                }
              ]
            }
          }
        }

        try {
          const { data: res } = await getElastic({
            uri: 'metricbeat-*/_search',
            postData: JSON.stringify(queryObj)
          })
          this.averageObj[key].loading = false
          // 如果有数据
          if (res.data) {
            const obj = JSON.parse(res.data)
            console.log('card', obj)
            const aggs = obj.aggregations || {}
            // 计算平均百分比
            const userAvg = (aggs.user || {}).value || 0
            const sysAvg = (aggs.system || {}).value || 0
            const totalAvg = (aggs.cores || {}).value || 1
            this.averageObj[key].avg = (
              ((userAvg + sysAvg) / totalAvg) *
              100
            ).toFixed(2)

            // 绘制图表
            const buckets = (aggs[0] || {}).buckets || []
            const arr = buckets.map((item) => {
              const user = item[1].value || 0
              const sys = item[2].value || 0
              const total = item[3].value || 1
              return [item.key, (((user + sys) / total) * 100).toFixed(2)]
            })
            this.$nextTick(() => {
              this.$refs[`ChartRef${key}`][0].initChart(arr)
            })
          }
        } catch (error) {
          this.averageObj[key].loading = false
          throw error
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
