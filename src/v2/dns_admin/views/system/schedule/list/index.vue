<template>
  <div class="work_item_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入定时任务名搜索',
            key: 'title',
            value: queryInfo.title
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :loading="btnLoading"
            @click="
              toEdit({
                jobId: 0,
                beanName: '', // 定时任务名称
                params: '', // 参数
                cronExpression: '', // cron表达式
                remark: '', // 描述信息
                methodName: '', // 方法名
                status: 0 // 任务状态
              })
            "
            >添加</el-button
          >

          <el-button
            type="primary"
            size="small"
            icon="el-icon-position"
            :loading="btnLoading"
            @click="batchOperation('run')"
            >执行</el-button
          >
          <el-button
            type="primary"
            size="small"
            icon="el-icon-video-pause"
            :loading="btnLoading"
            @click="batchOperation('pause')"
            >暂停</el-button
          >
          <el-button
            type="primary"
            size="small"
            icon="el-icon-video-play"
            :loading="btnLoading"
            @click="batchOperation('resume')"
            >恢复</el-button
          >
          <el-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="batchDelete"
            >删除</el-button
          >
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <ants-table-column
          type="selection"
          width="45"
          align="center"
          key="0"
        ></ants-table-column>

        <ants-table-column prop="beanName" label="任务" min-width="120">
          <template #default="{ row }">
            {{ taskEnumObj[row.beanName] || row.beanName }}
          </template>
        </ants-table-column>
        <ants-table-column prop="params" label="参数" min-width="120">
        </ants-table-column>
        <ants-table-column
          prop="cronExpression"
          label="cron表达式"
          min-width="120"
        >
        </ants-table-column>
        <ants-table-column prop="remark" label="描述信息" min-width="120">
        </ants-table-column>
        <ants-table-column
          prop="createTime"
          sortable
          label="创建时间"
          min-width="140"
        >
        </ants-table-column>

        <ants-table-column prop="status" label="任务状态" min-width="60">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              inactive-color="#F52443"
              active-color="#13ce66"
              :inactive-value="1"
              :active-value="0"
              :ref="`tableSwitchRef${$index}`"
              @change="toggleStatus(row, `tableSwitchRef${$index}`)"
            />
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="toEdit(row)"
              text="编辑"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="toDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加定时任务对话框弹窗 -->
    <ants-dialog
      :title="dialogText + '定时任务'"
      v-model="dialogVisible"
      width="600px"
      ref="dialogRef"
      @closed="resetForm"
      @submit="submitForm"
    >
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
        :status-icon="false"
      >
        <ants-form-item label="选择任务" prop="beanName">
          <ants-select v-model="form.beanName" placeholder="请选择任务">
            <ants-option
              v-for="item in taskEnumList"
              :key="item.name"
              :label="item.remark"
              :value="item.name"
            />
          </ants-select>
        </ants-form-item>
        <ants-form-item label="任务参数" prop="params">
          <ants-input
            v-model="form.params"
            placeholder="请输入任务参数"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="cron表达式" prop="cronExpression">
          <ants-input
            v-model="form.cronExpression"
            placeholder="请输入cron表达式"
          >
            <el-select
              v-model="cronSelect"
              slot="prepend"
              placeholder="请选择"
              @change="changeCron"
              style="width:120px;"
            >
              <el-option label="每天一次" value="0 0 0 * * ?"></el-option>
              <el-option label="每小时一次" value="0 0 * * * ?"></el-option>
              <el-option label="每分钟一次" value="0 * * * * ?"></el-option>
              <el-option label="自定义" value="other"></el-option>
            </el-select>
          </ants-input>
        </ants-form-item>
        <ants-form-item label="描述信息" prop="remark">
          <ants-input
            v-model="form.remark"
            placeholder="请输入描述信息"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 10 }"
          ></ants-input>
        </ants-form-item>
      </ants-form>
    </ants-dialog>
  </div>
</template>

<script>
// api
import {
  getList,
  doUpdate,
  doBatch,
  doSwitch,
  doDelete,
  getTaskEnum
} from '@/v2/dns_admin/api/system/schedule'

const defaultForm = {
  // 添加对话框的表单数据
  jobId: 0,
  beanName: '', // 定时任务名称
  params: '', // 参数
  cronExpression: '', // cron表达式
  remark: '', // 描述信息
  methodName: '', // 方法名
  status: 0 // 任务状态
}
export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        title: '', // 定时任务标题
        page: 1, // 当前的页数
        sidx: 'job_id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      selectArr: [],
      tableData: [],
      btnLoading: false,

      dialogText: '添加',
      dialogVisible: false, // 添加定时任务对话框弹窗显示
      form: {
        ...defaultForm
      },
      cronSelect: '0 0 0 * * ?',

      formRules: {
        beanName: [
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur'
          }
        ],
        params: [
          {
            required: true,
            message: '参数不能为空',
            trigger: 'blur'
          }
        ],
        cronExpression: [
          {
            required: true,
            message: 'cron表达式不能为空',
            trigger: 'blur'
          }
        ],
        remark: [
          {
            required: true,
            message: '描述信息不能为空',
            trigger: 'blur'
          }
        ]
      },

      taskEnumList: [],
      taskEnumObj: []
    }
  },
  created() {
    this.getTaskEnumData()
    this.getTableData()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取定时任务列表数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getList(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return

      this.tableData = res.page.list || []
      this.total = res.page.totalCount || 0
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    // 获取任务名称列表
    async getTaskEnumData() {
      const { data: res } = await getTaskEnum()
      console.log(res)
      if (res.code !== 1) return
      this.taskEnumList = res.data || []
      const obj = {}
      this.taskEnumList.forEach(item => {
        obj[item.name] = item.remark
      })
      this.taskEnumObj = obj
    },

    /**
     * @description: 点击添加-修改定时任务员信息
     * @param {*} row
     */

    async toEdit(row) {
      this.dialogText = !row.id ? '添加' : '编辑'
      this.form = {
        ...row
      }
      if (row.id) {
        if (
          ['0 0 0 * * ?', '0 0 * * * ?', '0 * * * * ?'].includes(
            row.cronExpression
          )
        ) {
          this.cronSelect = row.cronExpression
        } else {
          this.cronSelect = 'other'
        }
      }
      this.dialogVisible = true
    },

    /**
     * @description: 添加-修改定时任务提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        let type = 'update'
        if (!this.form.roleId) {
          type = 'save'
        }
        const { data: res } = await doUpdate(this.form, type)
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return

        this.getTableData()
        this.dialogVisible = false
        this.$msg.success(this.dialogText + '定时任务成功')
      })
    },

    changeCron(val) {
      if (val === 'other') {
        this.form.cronExpression = ''
      } else {
        this.form.cronExpression = val
      }
    },

    // 添加分组表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    },

    /**
     * @description: 批量执行-暂停-恢复
     * @param {*} url
     */

    async batchOperation(type) {
      if (!this.selectArr.length) {
        return this.$msg.warning('请选择要操作的定时任务！')
      }
      this.btnLoading = true

      const idsArr = this.selectArr.map(e => {
        return e.jobId
      })

      const { data: res } = await doBatch(idsArr, type)
      this.btnLoading = false

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('操作成功')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '定时任务'
      })
      if (!result) return

      this.btnLoading = true

      const idsArr = this.selectArr.map(e => {
        return e.jobId
      })
      this.btnLoading = false

      const { data: res } = await doDelete(idsArr)

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个定时任务')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     */

    async toDelete(row) {
      const result = await this.$doDelete({
        name: row.title,
        tag: '定时任务'
      })
      if (!result) return

      const { data: res } = await doDelete([row.jobId])

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除定时任务成功')
    },

    // 切换状态
    async toggleStatus(row) {
      if (row.status === 1) {
        const confirmResult = await this.$confirm(
          '此操作将暂停定时任务，是否继续？',
          '暂停任务',
          {
            dangerouslyUseHTMLString: true,
            center: true,
            type: 'error'
          }
        ).catch(err => err)

        if (confirmResult !== 'confirm') {
          row.status = 0
          this.$msg.info('已取消操作')
          return
        }
      }

      const { data: res } = await doSwitch(row)
      if (res.code !== 1) {
        row.status = row.status === 1 ? 0 : 1
        return
      }
      this.$msg.success('操作成功')
    }
  }
}
</script>
