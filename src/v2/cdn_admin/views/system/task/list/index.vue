<template>
  <div class="work_item_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '检索定时任务',
            key: 'beanName',
            value: queryInfo.beanName
          }
        ]"
        :queryInfo="queryInfo"
        @changeInput="getTableData"
      >
        <template slot="buttons">
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            :loading="btnLoading"
            @click="showCreateUpdateDialog()"
            text="添加"
          />

          <ants-button
            type="primary"
            size="small"
            icon="el-icon-position"
            :loading="btnLoading"
            @click="batchOperation('run')"
            text="执行"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-video-pause"
            :loading="btnLoading"
            @click="batchOperation('pause')"
            text="暂停"
          />
          <ants-button
            type="primary"
            size="small"
            icon="el-icon-video-play"
            :loading="btnLoading"
            @click="batchOperation('resume')"
            text="恢复"
          />
          <ants-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="batchDelete"
            text="删除"
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
        <ants-table-column
          type="selection"
          width="45"
          align="center"
          key="0"
        ></ants-table-column>

        <ants-table-column prop="jobId" label="任务ID" min-width="100">
        </ants-table-column>

        <ants-table-column prop="beanName" label="beanName" min-width="140">
          <template #default="{ row }">
            {{ jobBeanObj[row.beanName] }}
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

        <ants-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span v-if="row.status == 1" class="text-success">{{
              antsT('正常')
            }}</span>
            <span v-else class="text-error">{{ antsT('异常') }}</span>
          </template>
        </ants-table-column>

        <ants-table-column label="操作" width="150">
          <template #default="{ row }">
            <ants-button
              type="primary"
              size="mini"
              @click="showCreateUpdateDialog(row)"
              text="编辑"
            />
            <ants-button
              type="danger"
              size="mini"
              @click="singleDelete(row)"
              text="删除"
            />
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      :job-bean-obj="jobBeanObj"
    />
  </div>
</template>

<script>
// api
import {
  getList,
  doBatch,
  doCreateUpdateSchedule,
  doDelete,
  getJobBeanList
} from '@/v2/cdn_admin/api/system/schedule'

import CreateUpdateDialog from './components/CreateUpdateDialog'

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        beanName: '', // 定时任务标题
        page: 1, // 当前的页数
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      selectArr: [],
      tableData: [],
      btnLoading: false,
      // 任务对象
      jobBeanObj: {}
    }
  },
  created() {
    this.getTableData()
    this.getJobBeanObj()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取定时任务列表数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getList({
        ...this.queryInfo,
        page: this.queryInfo.page + '',
        limit: this.queryInfo.limit + ''
      })

      this.$root.loading = false
      if (res.code !== 1) return

      this.tableData = res.page.list || []
      this.total = res.page.totalCount || 0
    },

    /**
     * @description: 获取任务类型列表
     */

    async getJobBeanObj() {
      this.btnLoading = true
      const { data: res } = await getJobBeanList()
      this.btnLoading = false
      if (res.code !== 1) return
      this.jobBeanObj = res.data || {}
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    // 添加修改对话框显示
    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(row)
    },

    /**
     * @description: 批量执行-暂停-恢复
     * @param {*} url
     */

    async batchOperation(type) {
      if (!this.selectArr.length) return this.$msg.warning('请选择要操作的定时任务！')
      this.btnLoading = true

      const idsArr = this.selectArr.map(e => {
        return e.jobId
      })

      const { data: res } = await doBatch(
        {
          ids: idsArr + ''
        },
        type
      )
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

      const { data: res } = await doDelete({
        ids: idsArr + ''
      })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个定时任务')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete(row) {
      const result = await this.$doDelete({
        name: row.title,
        tag: '定时任务'
      })
      if (!result) return

      const { data: res } = await doDelete({
        ids: row.jobId
      })

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除定时任务成功')
    },

    async changeStatus(row, switchRef) {
      if (row.status === 0) {
        const result = await this.$doDelete({
          title: '禁用定时任务',
          content: `此操作将禁用定时任务“ <strong style="color: #F78989;">${row.beanName}</strong> ”，是否继续？`
        })
        if (!result) return
      }
      this.$refs[switchRef].loading = true
      const { data: res } = await doCreateUpdateSchedule(row, 'update')
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }

      // this.getTableData()
      this.$msg.success('操作成功')
    }
  }
}
</script>
