<template>
  <div>
    <el-card class="animated fadeIn content-box">
      <table-query-form
        :search-arr="[
          {
            name: '检索日志内容',
            key: 'content',
            value: queryInfo.content
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            size="small"
            type="success"
            icon="el-icon-refresh"
            :loading="$root.loading"
            :disabled="btnLoading"
            @click="getTableData()"
            text="刷新"
          />
          <ants-button
            size="small"
            type="info"
            icon="el-icon-download"
            :loading="btnLoading"
            :disabled="$root.loading"
            @click="downloadBulk()"
            text="批量下载"
          />
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-download"
            :disabled="$root.loading"
            :loading="btnLoading"
            @click="downloadAll()"
            text="全部下载"
          />
        </template>
        <template slot="inputs">
          <el-date-picker
            v-model="datePicker"
            type="daterange"
            align="right"
            unlink-panels
            :range-separator="antsT('至')"
            :start-placeholder="antsT('开始日期')"
            :end-placeholder="antsT('结束日期')"
            :picker-options="datePickerOptions"
            size="small"
            :clearable="false"
            @change="changeDate"
            value-format="timestamp"
            style="margin-right:10px;width:260px;"
          />
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column type="selection" width="45" align="center" />
        <ants-table-column width="180" label="ID" prop="id"></ants-table-column>
        <ants-table-column
          width="160"
          label="时间"
          prop="time"
        ></ants-table-column>
        <ants-table-column width="200" label="域名" prop="domain">
        </ants-table-column>

        <ants-table-column
          min-width="250"
          label="日志内容"
          prop="content"
        ></ants-table-column>
      </ants-table>
    </el-card>
  </div>
</template>

<script>
import { exportXLSX } from '@/utils/download'
import { calendarShortcuts } from '@/utils/shortcuts'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/dns/monitor`)

export default {
  components: {},
  data() {
    return {
      total: 0,
      queryInfo: {
        startDate: '', // 开始日期
        endData: '', // 结束日期
        content: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },
      tableData: [],
      selectArr: [],
      btnLoading: false,

      // 默认查询近一天的数据
      datePicker: [
        new Date().getTime() - 1000 * 3600 * 24,
        new Date().getTime()
      ],
      datePickerOptions: {
        shortcuts: calendarShortcuts,
        firstDayOfWeek: 1
      }
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
      const queryObj = this.buildQueryObj()
      const { page, limit } = this.queryInfo

      const { data: res } = await getElastic({
        // 这里必须要写域名，不然查询不到数据
        domain: 'wildbee.cn',
        uri: `query-log/_search?size=${limit}&from=${(page - 1) * limit}`,
        postData: JSON.stringify(queryObj)
      })
      this.$root.loading = false
      if (!res.data) return

      const obj = JSON.parse(res.data)
      console.log(obj)

      const arr = []
      obj.hits.hits.forEach(item => {
        const dissect = item._source.dissect || {}
        const decodeData = (item._source || {}).decode_data || {}
        arr.push({
          time: dissect.timestamp,
          domain: decodeData.domain_name,
          id: item._id,
          content: dissect.data
        })
      })

      this.tableData = arr
      this.total = obj.hits.total.value
    },

    // 构造查询参数
    buildQueryObj() {
      // 开始时间字符串
      const startStr = this.$dayjs(this.datePicker[0]).format('YYYY-MM-DD')
      // 结束时间要往后加一天
      const endStr = this.$dayjs(this.datePicker[1] + 1000 * 3600 * 24).format(
        'YYYY-MM-DD'
      )
      console.log(startStr, endStr)

      const queryObj = {
        // 通过 _source 来定义返回想要的字段。使用 fields 更高效
        _source: ['dissect', 'decode_data', 'message'],
        // _source: false,
        // fields: ['dissect', 'decode_data', 'message'],
        query: {
          bool: {
            must: [
              {
                range: {
                  'dissect.timestamp.keyword': {
                    gte: startStr, // '2022-12-26'
                    lte: endStr, // '2022-12-27', 表示查询 12-26 当天的
                    format: 'YYYY-MM-DD'
                  }
                }
              }
            ]
          }
        },
        sort: [
          {
            'dissect.timestamp.keyword': {
              // 降序 = desc, 升序 = asc
              order: 'desc'
            }
          }
        ]
      }

      // 搜索框，模糊查询有点问题
      if (this.queryInfo.content !== '') {
        queryObj.query.bool.must.push({
          match: {
            message: {
              query: this.queryInfo.content
              // operator: 'and'
            }
          }
        })
      }

      return queryObj
    },

    // 查询时间
    changeDate(val) {
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 全部下载
    async downloadAll() {
      this.btnLoading = true
      const queryObj = this.buildQueryObj()
      const { data: res } = await getElastic({
        // 这里必须要写域名，不然查询不到数据
        domain: 'wildbee.cn',
        uri: 'query-log/_search?size=10000',
        postData: JSON.stringify(queryObj)
      })
      if (res.code !== 1 || !res.data) {
        this.btnLoading = false
        return
      }
      const obj = JSON.parse(res.data)
      const arr = []
      obj.hits.hits.forEach(item => {
        const dissect = item._source.dissect || {}
        const decodeData = (item._source || {}).decode_data || {}
        arr.push({
          time: dissect.timestamp,
          domain: decodeData.domain_name,
          id: item._id,
          content: dissect.data
        })
      })
      this.downloadLog(arr)
    },

    // 批量下载
    async downloadBulk() {
      if (!this.selectArr.length) {
        return this.$msg.warning('请勾选要下载的数据')
      }

      this.btnLoading = true
      this.downloadLog(this.selectArr)
    },

    // 开始下载日志
    downloadLog(arr = []) {
      // 追加表头
      arr.unshift({
        id: 'ID',
        time: '时间',
        domain: '域名',
        content: '日志内容'
      })

      // 开始时间字符串
      const startStr = this.$dayjs(this.datePicker[0]).format('YYYY-MM-DD')
      // 结束时间要往后加一天
      const endStr = this.$dayjs(this.datePicker[1]).format('YYYY-MM-DD')
      const name = `${startStr}至${endStr} DNS日志`

      exportXLSX(arr, name)
        .then(data => {
          setTimeout(() => {
            this.$msg.success('操作成功')
            this.btnLoading = false
          }, 1000)
        })
        .catch(error => {
          console.log(error)
          this.btnLoading = false
        })
    },

    handleSelectionChange(val) {
      this.selectArr = val
    }
  }
}
</script>
