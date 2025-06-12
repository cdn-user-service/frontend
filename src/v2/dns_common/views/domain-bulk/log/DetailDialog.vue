<template>
  <ants-dialog
    title="操作日志详情"
    v-model="dialogVisible"
    @closed="resetDialog"
    width="1200px"
  >
    <div class="flex justify-between">
      <span>
        {{ rowData.resultText }}：
        <el-tag size="mini" type="primary">{{ rowData.jobProgress }}</el-tag>
      </span>
      <span>{{ rowData.jobStartTime }} </span>
    </div>

    <el-table :data="tableData" v-loading="loading">
      <!-- <div slot="empty">
          <el-empty :description="antsT('暂无数据')"> </el-empty>
        </div> -->
      <ants-table-column
        prop="domain"
        :label="isShowtype ? '记录' : '域名'"
        min-width="140"
      >
      </ants-table-column>
      <ants-table-column
        prop="top"
        label="主机记录"
        min-width="100"
        v-if="isShowRecords"
      >
      </ants-table-column>
      <ants-table-column
        prop="record_type"
        label="记录类型"
        min-width="80"
        v-if="isShowRecords"
      >
      </ants-table-column>
      <ants-table-column
        prop="record_line_name"
        label="线路类型"
        min-width="100"
        v-if="isShowRecords"
      >
      </ants-table-column>
      <ants-table-column
        prop="value"
        label="记录值"
        min-width="100"
        v-if="isShowRecords"
      >
      </ants-table-column>
      <ants-table-column
        prop="weight"
        label="权重"
        min-width="80"
        v-if="isShowRecords"
      >
      </ants-table-column>
      <ants-table-column
        prop="mx"
        label="MX"
        min-width="80"
        v-if="isShowRecords"
      >
        <template #default="{ row }">
          {{ row.mx == 0 ? '--' : row.max }}
        </template>
      </ants-table-column>
      <ants-table-column
        prop="ttl"
        label="TTL"
        min-width="80"
        v-if="isShowRecords"
      >
      </ants-table-column>

      <ants-table-column prop="status" label="状态" min-width="80">
        <template #default="{ row }">
          <el-tag size="mini" type="success" v-if="row.status">{{
            antsT('成功')
          }}</el-tag>
          <el-tag size="mini" type="danger" v-else>{{ antsT('失败') }}</el-tag>
        </template>
      </ants-table-column>
      <ants-table-column prop="result" label="详情" min-width="140">
        <template #default="{ row }">
          {{ row.result || '-' }}
        </template>
      </ants-table-column>
    </el-table>
    <template slot="footer">
      <span></span>
    </template>
  </ants-dialog>
</template>

<script>
// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getBatchLogDetail } = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      isShowRecords: false,
      tableData: [],
      rowData: {
        jobEndTime: '',
        jobFunction: ''
      },
      isShowtype: true
    }
  },
  methods: {
    /**
     * @description: 显示对话框，并获取数据
     */

    show(row) {
      this.rowData = row || {}
      this.isShowRecords = row.type === 3 || row.type === 4
      this.isShowtype = row.type === 5
      this.dialogVisible = true
      this.getTableData(row.id, row.type)
    },

    /**
     * @description: 根据id获取日志详情数据
     */

    async getTableData(id, type) {
      this.loading = true
      try {
        const { data: res } = await getBatchLogDetail({
          id
        })
        this.loading = false
        if (res.code !== 1) return
        const obj = res.data || {}
        // 构造表格数据
        const content = JSON.parse(obj.jobContent)
        const result = JSON.parse(obj.jobResult)
        this.tableData = this.buildTableData(content, result, type)
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    /**
     * @description: 分别构造表格数据
     * @param {*} content 日志内容
     * @param {*} result 日志结果
     */

    buildTableData(content = {}, result = {}, type) {
      let tableData = []

      const contentArr = (content.form || '').split('=')
      const recordsArr = JSON.parse((contentArr[2] || '').slice(0, -1) || '[]')
      switch (type) {
        case 1:
          tableData = (content.domains || '').split(',').map((item, idx) => {
            const resultStr = result[idx + 1] || ''
            return {
              domain: item,
              result: resultStr,
              status: resultStr.indexOf('[success]') != -1,
              info: '批量添加域名'
            }
          })
          break
        case 2:
          tableData = (content.domains || '').split(',').map((item, idx) => {
            const resultStr = result[idx + 1] || ''
            return {
              domain: item,
              result: resultStr,
              status: resultStr.indexOf('[success]') != -1,
              info: '取回域名'
            }
          })
          break
        case 3:
          tableData = recordsArr.map((item, idx) => {
            const resultStr = result[idx + 1] || ''
            return {
              domain: resultStr.split('{')[0].slice(0, -1).split(']')[1],
              result: resultStr.split('{')[0],
              status: resultStr.indexOf('[success]') != -1,
              info: '批量添加记录',
              ...item
            }
          })
          break
        case 4:
          tableData = JSON.parse(content.records).map((item, idx) => {
            const resultStr = result[idx + 1] || ''
            return {
              domain: content.domain,
              result:
                resultStr.indexOf('[success]') != -1 ? '导入成功' : '导入失败',
              status: resultStr.indexOf('[success]') != -1,
              info: '导入记录',
              ...item
            }
          })
          break
        case 5:
          console.log('result', result)
          tableData = result.map((item, idx) => {
            return {
              domain: item.name,
              status: item.status === 1,
              result: item.status === 1 ? '--' : item.msg,
              info: '批量修改记录'
            }
          })
          break
      }
      return tableData
    },

    // 对话框关闭，数据重置
    resetDialog() {
      this.isShowRecords = this.loading = false
      this.tableData = []
    }
  }
}
</script>
