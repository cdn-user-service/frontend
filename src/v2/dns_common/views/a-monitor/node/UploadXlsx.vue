<template>
  <div>
    <el-upload
      action=""
      ref="uploadRef"
      :auto-upload="false"
      accept=".xlsx,.xls"
      :multiple="false"
      :limit="1"
      :on-change="onChange"
      :show-file-list="false"
    >
      <el-button
        :loading="loading"
        size="small"
        type="primary"
        icon="el-icon-upload2"
      >节点</el-button>
    </el-upload>

    <ants-dialog
      title="查看导入数据"
      v-model="dialogVisible"
      width="1200px"
      ref="dialogRef"
      top="10vh"
    >
      <el-table
        :data="tableData"
        border
        style="margin:0;"
        size="mini"
      >
        <el-table-column
          type="index"
          label="序号"
          width="60"
        >
        </el-table-column>
        <el-table-column
          v-for="item in tableColumn"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          min-width="100"
          show-overflow-tooltip
        >
        </el-table-column>
      </el-table>
      <span slot="footer"></span>
    </ants-dialog>
  </div>
</template>

<script>
import { read, utils } from 'xlsx'

const propObj = {
  name: '员工姓名',
  idCard: '身份证号码',
  tel: '电话号码',
  post: '所在岗位',
  status: '在职状态',
  address: '家庭住址',
  entryTime: '入职时间',
  leaveTime: '离职时间',
  department: '所属部门',
  shebaoTime: '上社保时间',
  xiashebaoTime: '下社保时间',
  gongjijinTime: '上公积金时间',
  xiagongjijinTime: '下公积金时间',
  shangyiwaixianTime: '上意外险时间',
  xiayiwaixianTime: '下意外险时间'
}

export default {
  data() {
    return {
      fileList: [],
      loading: false,
      dialogVisible: false,
      tableData: [],
      tableColumn: []
    }
  },
  created() {
    for (const key in propObj) {
      this.tableColumn.push({
        prop: key,
        label: propObj[key]
      })
    }
  },
  methods: {
    async onChange(file, fileList) {
      console.log('change', file, fileList)
      this.loading = true
      try {
        const data = await this.readWorkbookFromLocalFile(file)
        console.log(data)
        // 构造表格数据
        this.tableData = data.map((item) => {
          const obj = {}
          for (const key in propObj) {
            obj[key] = item[propObj[key]]
          }
          return obj
        })
        this.loading = false
        this.dialogVisible = true
      } catch (error) {
        this.loading = false
      }

      // 保持只有一个文件
      this.$refs.uploadRef.clearFiles()
    },

    // 读取上传的文件，并将上传的xlsx文件转成json
    readWorkbookFromLocalFile(file) {
      return new Promise((resolve, reject) => {
        try {
          const reader = new FileReader()
          reader.readAsBinaryString(file.raw)
          reader.onload = (e) => {
            const data = e.target.result
            const workbook = read(data, {
              type: 'binary'
            })
            const sheetNames = workbook.SheetNames // 工作表名称集合
            const worksheet = workbook.Sheets[sheetNames[0]] // 这里我们只读取第一张sheet
            const json = utils.sheet_to_json(worksheet)

            resolve(json)
          }
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
