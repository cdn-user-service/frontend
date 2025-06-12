<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`导出管理员日志【${logTypeText}】`"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
    submitBtnText="导 出"
  >
    <div class="ants-tips_box mb-xl">
      <span class="el-icon-info"></span>
      将导出为
      <el-tag size="mini" type="danger">.xlsx</el-tag>
      类型文件，如需导出为其他类型，请联系我们。
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="120px"
    >
      <ants-form-item label="时间范围" prop="timeValue">
        <el-date-picker
          v-model="form.timeValue"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          :range-separator="antsT('至')"
          :start-placeholder="antsT('开始日期')"
          :end-placeholder="antsT('结束日期')"
          align="center"
          unlink-panels
          :picker-options="pickerOptions"
        />
      </ants-form-item>
      <ants-form-item label="筛选管理员">
        <ants-input
          v-model="form.username"
          placeholder="管理员账号（非必填）"
        />
      </ants-form-item>
      <ants-form-item label="筛选日志信息">
        <ants-input v-model="form.key" placeholder="日志信息（非必填）" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// API
import { getAdminLogList } from '@/v2/cdn_admin/api/cdn/log'

// 表单基础数据
const defaultForm = {
  // 时间范围，默认选择今日，必填
  timeValue: [
    // new Date(new Date().setTime(new Date().getTime())).setHours(0, 0, 0, 0),
    // new Date().getTime()
  ],
  // 筛选管理员，非必填
  username: '',
  // 筛选日志信息，非必填
  key: ''
}

// 操作日志类型
const logTypeObj = {
  type_1: '登录日志',
  type_2: '操作日志',
  type_3: '产品日志',
  type_4: '财务日志',
  type_5: '调度日志',
  type_0: '其他日志'
}

export default {
  data() {
    return {
      dialogVisible: false,
      pickerOptions: {
        // 禁用当前时间之后的时间选项
        disabledDate: nowtime => {
          return nowtime.getTime() > Date.now()
        }
      },
      form: {
        ...defaultForm
      },
      formRules: {
        timeValue: [
          {
            required: true,
            message: '请选择时间范围',
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {
    // 日志类型
    logTypeText({ $route }) {
      return logTypeObj[`type_${$route.params.logType}`]
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
    },

    /**
     * @description: 构造时间范围格式
     * @param {*} val
     */

    makeTime(val) {
      return {
        startDate: val && val[0].slice(0, 10) + ' 00:00:00',
        endData: val && val[1].slice(0, 10) + ' 23:59:59'
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        // 构造时间范围
        const { startDate, endData } = this.makeTime(this.form.timeValue)

        this.$refs.dialogRef.btnLoading = true

        const { data: res } = await getAdminLogList({
          // 1 = 管理员， 2 = 用户
          userType: 1,
          // 日志分类， 0 = 其他， 1 = 登录日志， 2 = 操作， 3 = 产品， 4 = 财务， 5 = 调度
          logType: +this.$route.params.logType,
          // 筛选 用户名
          username: this.form.username,
          // 删选日志信息
          key: this.form.key,
          // 开始时间
          start_date: startDate,
          // 结束时间
          end_date: endData,
          page: '1',
          limit: '500'
        })

        if (res.code !== 1) {
          this.$refs.dialogRef.btnLoading = false
          return
        }

        // 如果有数据，则构造要导出的表格数据
        if (res.page && res.page.list && res.page.list.length) {
          this.biuldData(res.page.list)
        } else {
          this.$msg.error('该条件下没有任何日志数据')
        }
      })
    },

    /**
     * @description: 构造要导出的表格数据
     */

    biuldData(baseArr = []) {
      // 指定要导出的每列数据
      const jsonArr = baseArr.map(item => {
        return {
          createDate: item.createDate,
          username: item.username,
          ip: item.ip,
          area: item.area,
          method: item.method
        }
      })

      // 追加表头
      jsonArr.unshift({
        createDate: '时间',
        username: '用户名',
        ip: 'IP地址',
        area: '区域',
        method: '日志信息'
      })
      
      this.exportLog(jsonArr)
    },

    /**
     * @description: 将 json 数据转为 sheet，并导出
     * @return {*}
     */

    exportLog(jsonArr = []) {
      // 第一步：将json数据转为sheet
      const sheet = XLSX.utils.json_to_sheet(jsonArr, {
        // 是否显示表头
        skipHeader: true
        // header: ['id', 'users', 'age', 'address']
      })

      // 构造名称
      const startDate = this.form.timeValue[0].slice(0, 10)
      const endData = this.form.timeValue[1].slice(0, 10)
      const xName = `${startDate}至${endData}CDN系统${this.logTypeText}`

      // 第二步：创建一个新的空的 workbook，向其中添加 sheet
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, sheet, xName)
      const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' }
      const wbout = XLSX.write(wb, wopts)

      // 弹出下载表格文件
      saveAs(
        new Blob([wbout], {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }),
        xName + '.xlsx'
      )

      setTimeout(() => {
        this.$msg.success('导出日志成功')
        this.$refs.dialogRef.btnLoading = false
        this.dialogVisible = false
      }, 1000)
    },

    // 表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

<style lang="scss">
.el-date-editor .el-range-separator {
  white-space: nowrap;
}
</style>
