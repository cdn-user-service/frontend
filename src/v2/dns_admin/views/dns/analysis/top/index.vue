<template>
  <el-card class="content-box animated fadeIn">
    <div class="flex items-center justify-between">
      <ants-radio-group v-model="time" size="small" @change="getTableData()">
        <ants-radio-button
          v-for="(item, key) in timeObj"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>
      <ants-button
        type="success"
        size="mini"
        icon="el-icon-refresh"
        text="刷新"
        @click="getTableData()"
      />
    </div>

    <el-table :data="tableData" size="small" border v-loading="$root.loading">
      <ants-table-column
        width="120"
        label="排行"
        type="index"
        align="center"
      ></ants-table-column>
      <ants-table-column width="120" label="时长" align="center">
        <template>
          <el-tag size="small" type="primary">
            {{ timeObj[time] }}
          </el-tag>
        </template>
      </ants-table-column>
      <ants-table-column
        min-width="140"
        label="域名"
        prop="domain"
      ></ants-table-column>

      <ants-table-column min-width="120" label="请求数" prop="total">
        <template #default="{ row }"> {{ row.total }} 次 </template>
      </ants-table-column>
    </el-table>
  </el-card>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/dns/monitor`)

export default {
  data() {
    return {
      timeObj: {
        '5m': '近5分钟',
        '1h': '近1小时',
        '1d': '近一天'
      },

      tableData: [],
      time: '5m'
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.$root.loading = true
      const domain = 'wildbee.cn'
      const queryObj = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  '@timestamp': {
                    gte: 'now-' + this.time,
                    lte: 'now'
                  }
                }
              }
            ]
          }
        },
        aggs: {
          domain: {
            terms: {
              field: 'decode_data.domain_name.keyword',
              size: 20
            }
          }
        }
      }
      const { data: res } = await getElastic({
        domain,
        uri: 'query-log/_search',
        postData: JSON.stringify(queryObj)
      })
      this.$root.loading = false
      if (!res.data) return
      const obj = JSON.parse(res.data)

      const arr = []
      obj.aggregations.domain.buckets.forEach(item => {
        arr.push({
          domain: item.key,
          total: item.doc_count
        })
      })

      this.tableData = arr
    }
  }
}
</script>
