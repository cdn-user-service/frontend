<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`相关问题类型【${parentData.title}】`"
    width="1000px"
    top="5vh"
    @close="resetForm"
  >
    <div class="-mt-sm">
      <ants-button
        type="primary"
        size="mini"
        icon="el-icon-plus"
        :disabled="loading"
        @click="showCreateRow()"
        text="添加问题类型"
      />
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      class="ants-table_form_error"
    >
      <el-table :data="tableData" v-loading="loading" :row-key="addRowKey">
        <ants-table-column label="问题类型" min-width="140">
          <template #default="{ row }">
            <div v-if="isShoweEditInputIndex != row.id">
              {{ row.title }}
            </div>
            <ants-form-item v-else prop="title">
              <ants-input
                v-model="form.title"
                size="small"
                placeholder="请输入问题类型"
              />
            </ants-form-item>
          </template>
        </ants-table-column>
        <ants-table-column label="说明信息" min-width="200">
          <template #default="{ row }">
            <div v-if="isShoweEditInputIndex != row.id">
              {{ row.description }}
            </div>
            <ants-form-item v-else prop="description">
              <ants-input
                v-model="form.description"
                size="small"
                placeholder="请输入说明信息"
              />
            </ants-form-item>
          </template>
        </ants-table-column>
        <ants-table-column label="启用" width="80">
          <template #default="{ row, $index }">
            <ants-table-switch
              v-model="row.status"
              :ref="`tableSwitchRef${$index}`"
              @change="changeStatus(row, `tableSwitchRef${$index}`)"
            >
            </ants-table-switch>
          </template>
        </ants-table-column>
        <!-- <ants-table-column label="排序" width="150">
          <template #default="{ row }">
            <div v-if="isShoweEditInputIndex != row.id">
              {{ row.weight }}
            </div>
            <ants-form-item v-else prop="weight">
              <ants-input-number
                v-model="form.weight"
                placeholder="排序"
                size="small"
                :min="1"
                :max="999"
              ></ants-input-number>
            </ants-form-item>
          </template>
        </ants-table-column> -->

        <ants-table-column label="操作" width="160" align="right">
          <template #default="{ row }">
            <div v-if="isShoweEditInputIndex != row.id">
              <span
                class="text-primary cursor-pointer el-icon-edit"
                @click="showUpdateRow(row)"
              >
                {{ antsT('修改') }}</span
              >
              <el-divider direction="vertical"></el-divider>

              <el-popconfirm
                title="确定该问题类型删除？"
                cancel-button-type="info"
                icon-color="red"
                @confirm="singleDelete(row)"
              >
                <span
                  slot="reference"
                  class="text-error cursor-pointer el-icon-delete"
                >
                  {{ antsT('删除') }}</span
                >
              </el-popconfirm>
            </div>
            <div v-else>
              <ants-button
                size="mini"
                type="primary"
                :loading="btnLoading"
                @click="submitForm"
                text="保存"
              />
              <ants-button
                size="mini"
                type="info"
                :disabled="btnLoading"
                @click="cancelUpdate(row)"
                text="取消"
              />
            </div>
          </template>
        </ants-table-column>
      </el-table>
    </ants-form>
    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        @click="dialogVisible = false"
        text="关 闭"
      />
    </template>
  </ants-dialog>
</template>

<script>
// api
import {
  getWorkOrderCategoryList,
  doSaveWorkOrderCategory,
  doDeleteWorkOrderCategory
} from '@/v2/cdn_admin/api/cdn/work-order'

const defaultForm = {
  // 添加对话框的表单数据
  id: 0,
  title: '',
  description: '',
  weight: '',
  // 状态，默认为启用
  status: 1
}
export default {
  data() {
    return {
      // 父组件传递过来的数据
      parentData: {},
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        title: [
          {
            required: true,
            message: '问题类型',
            trigger: ['change', 'blur']
          }
        ],
        description: [
          {
            required: true,
            message: '请输入说明信息',
            trigger: ['change', 'blur']
          }
        ],
        weight: [
          {
            required: true,
            message: '请输入排序',
            trigger: ['change', 'blur']
          }
        ]
      },

      tableData: [],
      loading: false,
      btnLoading: false,
      isShoweEditInputIndex: null
    }
  },
  methods: {
    // 指定要当前展开行的值为 id
    addRowKey(row) {
      return row.id
    },

    /**
     * @description: 添加表单显示
     * @param {*} row
     */

    showCreateRow(row = {}) {
      // 限制一次只编辑一行
      if (this.isShoweEditInputIndex === 0) return

      // 给行表单赋值
      this.form = { ...defaultForm }
      // 为表格添加第一行
      this.tableData.unshift({ ...defaultForm })
      // 展示行表单输入框
      this.isShoweEditInputIndex = 0
    },

    /**
     * @description: 修改显示
     * @param {*} row
     */

    showUpdateRow(row = {}) {
      // 如果已打开行为新增行，则移除新增行
      if (this.isShoweEditInputIndex === 0) {
        this.tableData.shift()
      }

      // 给行表单赋值
      this.form = {
        ...defaultForm,
        ...row
      }

      // 展示行表单输入框
      this.isShoweEditInputIndex = row.id
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete({ id }) {
      const { data: res } = await doDeleteWorkOrderCategory({
        id
      })
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
    },

    /**
     * @description: 修改一行或者新增一行数据后，点击取消
     * @param {*} row
     */

    cancelUpdate(row) {
      // 如果为新添加的记录，然后点击取消，则直接删除该行，解除禁止添加记录按钮
      if (row.id === 0) {
        this.tableData.shift()
      }
      this.isShoweEditInputIndex = null
    },

    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.tableData = []
      this.dialogVisible = true
      this.parentData = {
        ...row
      }

      // 获取表格数据
      this.getTableData()
    },

    /**
     * @description: 获取表格数据
     */

    async getTableData() {
      this.loading = true
      const { data: res } = await getWorkOrderCategoryList({
        parentId: this.parentData.id
      })
      this.loading = false
      if (res.code !== 1) return
      this.tableData = res.data || []
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true
        const { data: res } = await doSaveWorkOrderCategory({
          ...this.form,
          parentId: this.parentData.id
        })
        this.btnLoading = false
        if (res.code !== 1) return
        // 隐藏行表单
        this.isShoweEditInputIndex = null
        this.getTableData()
        this.$msg.success('操作成功')
      })
    },

    /**
     * @description: 启动禁用
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      // if (row.status === 0) {
      //   const result = await this.$doDelete({
      //     title: '禁用问题',
      //     content: `此操作将禁用问题“ <strong style="color: #F78989;">${row.title}</strong> ”，是否继续？`
      //   })
      //   if (!result) {
      //     row.status = 1
      //     return
      //   }
      // }
      this.$refs[switchRef].loading = true
      const { data: res } = await doSaveWorkOrderCategory(row)
      this.$refs[switchRef].loading = false

      if (res.code !== 1) {
        row.status = row.status ? 0 : 1
        return
      }

      // this.getTableData()
      this.$msg.success('操作成功')
    },

    // 对话框关闭
    resetForm() {
      this.btnLoading = false
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
<style lang="scss">
.ants-table_form_error {
  .el-form-item {
    padding-bottom: 0;
  }
}
</style>
