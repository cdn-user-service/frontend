<template>
  <el-card class="content-box animated fadeIn">
    <div slot="header">
      <TitleBorder title="导出记录" />
    </div>

    <ants-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="0"
      label-position="top"
      status-icon
    >
      <ants-form-item label="选择域名">
        <QueryDomainSelect ref="QueryDomainSelectRef" style="width:360px;" />
      </ants-form-item>
      <ants-form-item prop="type" label="选择导出格式">
        <ants-radio-group v-model="form.type">
          <ants-radio label="xlsx" text="XLSX 表格" />
          <ants-radio label="txt" text="TXT 文本" />
          <!-- <ants-radio label="zone" text="ZONE 文件"/> -->
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item>
        <ants-button
          type="primary"
          size="small"
          :loading="btnLoading"
          @click="submitForm"
          icon="el-icon-check"
          text="导出文件"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import QueryDomainSelectAdmin from '@/v2/dns_admin/components/QueryDomainSelect'
import QueryDomainSelectUsers from '@/v2/dns_users/components/QueryDomainSelect'

// api
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getList: getRecordsList
} = require(`@/v2/${PROCESS_NAME}/api/dns/record`)

export default {
  components: {
    QueryDomainSelect:
      PROCESS_NAME === 'dns_admin'
        ? QueryDomainSelectAdmin
        : QueryDomainSelectUsers
  },

  data() {
    return {
      form: {
        domain: '',
        type: 'xlsx'
      },
      formRules: {
        domain: [
          {
            required: true,
            message: '请选择域名',
            trigger: 'change'
          }
        ],
        type: [
          {
            required: true,
            message: '选择导出格式',
            trigger: 'change'
          }
        ]
      },

      loading: false,
      btnLoading: false,
      domainList: [],
      recordsList: []
    }
  },
  methods: {
    /**
     * @description: 导出记录提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.getRecordsByDomainId()
      })
    },

    /**
     * @description: 根据域名id获取记录数
     */
    async getRecordsByDomainId() {
      const domainStr = this.$refs.QueryDomainSelectRef.value
      if (!domainStr) return this.$msg.error('请选择域名！')

      this.btnLoading = true
      const { data: res } = await getRecordsList({
        domain: domainStr,
        page: 1,
        limit: 500
      })

      if (res.code !== 1) {
        this.btnLoading = false
        return
      }

      // 解析json 字符串
      const recordArr = (res.data || []).map((item, idx) => {
        return JSON.parse(item + '')
      })

      this.recordsList = recordArr.sort(this.compareNum)

      // 构造表头
      this.recordsList.unshift({
        record_id: '记录ID',
        top: '主机记录',
        record_type: '记录类型',
        record_line_name: '线路类型',
        value: '记录值',
        weight: '权重',
        mx: 'MX',
        ttl: 'TTL'
      })

      this.checkOutLog(this.recordsList, domainStr)
    },

    /**
     * @description: 列表按记录类型排序, ns 记录要排在首位
     * @param {*} x
     * @param {*} y
     */

    compareNum(x, y) {
      if (y.record_type == 'NS') return 1
      if (x.record_type == 'NS') return -1
      if (x.record_type < y.record_type) return -1
      if (x.record_type == y.record_type) return 0
      if (x.record_type > y.record_type) return 1
    },

    checkOutLog(data, name) {
      switch (this.form.type) {
        case 'xlsx':
          this.checkOutLogToXlsx(data, name)
          break
        case 'txt':
          this.checkOutLogToTxt(data, name)
          break
      }
    },

    /**
     * @description: 导出日志为 txt
     */
    checkOutLogToTxt(data, name) {
      const TXT_BLOB = new Blob([JSON.stringify(data)], {
        type: 'text/plain;charset=utf-8'
      })
      saveAs(TXT_BLOB, name + '.txt')

      this.finishCheck()
    },

    /**
     * @description: 导出日志为 xlsx
     */
    checkOutLogToXlsx(data, name) {
      // 创建一个新的空的 workbook
      const wb = XLSX.utils.book_new()

      // sheet 名称
      const sheetName = [name]
      sheetName.map((item, idx) => {
        // 将json数据转为sheet
        const sheet = XLSX.utils.json_to_sheet(data, {
          // header: ['id', 'users', 'age', 'address'],
          skipHeader: true // 是否显示表头
        })

        XLSX.utils.book_append_sheet(wb, sheet, item)
      })

      const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' }
      const wbout = XLSX.write(wb, wopts)

      saveAs(
        new Blob([wbout], {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }),
        name + '.xlsx'
      )

      this.finishCheck()
    },

    finishCheck() {
      this.recordsList = []
      setTimeout(() => {
        this.btnLoading = false
        this.$msg.success('导出记录成功')
      }, 1000)
    }
  }
}
</script>
