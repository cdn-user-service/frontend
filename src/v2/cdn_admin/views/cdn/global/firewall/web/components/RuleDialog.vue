<template>
  <ants-dialog
    :title="title"
    v-model="dialogVisible"
    width="1000px"
    ref="dialogRef"
    top="5vh"
    @reset="resetFrom"
  >
    <div class="-mt-df mb-df">
      <ants-button
        type="primary"
        size="mini"
        icon="el-icon-plus"
        :disabled="$root.loading"
        @click="showAddRow()"
        text="添加规则"
      />
      <ants-button
        type="info"
        size="mini"
        icon="el-icon-delete"
        :loading="btnLoading"
        :disabled="$root.loading"
        @click="batchDelete"
        text="批量删除"
      />
    </div>
    <el-table
      :data="tableData"
      @selection-change="handleSelectionChange"
      v-loading="$root.loading"
      style="margin:0;"
    >
      <ants-table-column
        type="selection"
        width="45"
        align="center"
      ></ants-table-column>
      <ants-table-column label="规则" prop="rule" min-width="300">
        <template #default="{ row }">
          <ants-input
            v-if="row.id === nowUpdateRowId"
            size="small"
            v-model="form.rule"
            placeholder="请输入规则"
          />
          <span v-else>{{ row.rule }}</span>
        </template>
      </ants-table-column>
      <ants-table-column label="描述" prop="remark" min-width="200">
        <template #default="{ row }">
          <ants-input
            v-if="row.id === nowUpdateRowId"
            size="small"
            v-model="form.remark"
            placeholder="请输入描述信息"
          />
          <span v-else>{{ row.remark }}</span>
        </template>
      </ants-table-column>
      <ants-table-column label="状态" width="60">
        <template #default="{ row, $index }">
          <ants-table-switch
            v-if="row.id != nowUpdateRowId"
            v-model="row.status"
            :ref="`tableSwitchRef${$index}`"
            @change="changeStatus(row, `tableSwitchRef${$index}`)"
          >
          </ants-table-switch>
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="170" align="right">
        <template #default="{ row }">
          <div v-if="row.id === nowUpdateRowId">
            <ants-button
              :loading="btnLoading"
              size="mini"
              type="primary"
              @click="submitForm(row)"
              text="确定"
            />
            <ants-button
              size="mini"
              type="info"
              :disabled="btnLoading"
              @click="cancelUpdate(row)"
              text="取消"
            />
          </div>
          <div v-else>
            <span
              class="cursor-pointer text-primary el-icon-edit"
              @click="showUpdateRow(row)"
            >
              {{ antsT('修改') }}</span
            >
            <el-divider direction="vertical"></el-divider>
            <span
              class="text-error cursor-pointer el-icon-delete"
              @click="singleDelete(row)"
            >
              {{ antsT('删除') }}</span
            >
          </div>
        </template>
      </ants-table-column>
    </el-table>
    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        text="关 闭"
        @click="dialogVisible = false"
      />
    </template>
  </ants-dialog>
</template>

<script>
const mokeData = [
  {
    id: 1,
    rule: '\\.\\./\\.\\./',
    remark: '目录保护1',
    status: 1
  },
  {
    id: 2,
    rule: '\\.\\./\\.\\./',
    remark: '目录保护2',
    status: 1
  },
  {
    id: 3,
    rule: '(?:etc\\/\\W*passwd)',
    remark: '目录保护1',
    status: 1
  },
  {
    id: 4,
    rule: '(gopher|doc|php|glob|^file|phar|zlib|ftp|ldap|dict|ogg|data)\\:\\/',
    remark: 'PHP流协议过滤1',
    status: 1
  },
  {
    id: 5,
    rule: 'select.+(from|limit)',
    remark: 'SQL注入过滤2',
    status: 1
  },
  {
    id: 6,
    rule: '(?:(union(.*?)select))',
    remark: 'SQL注入过滤3',
    status: 1
  }
]

const defaultForm = {
  // 添加时 id = 0
  id: 0,
  rule: '',
  remark: null
}
export default {
  data() {
    return {
      // 标识，[c_m_text]
      keyStr: 'web_rule_regx_detail',
      // 父ID
      parentId: null,

      title: '站点规则',
      dialogVisible: false,
      btnLoading: false,
      tableData: [],
      selectArr: [],

      // 修改线路select 是否显示
      nowUpdateRowId: null,
      form: {
        ...defaultForm
      }
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} row
     */
    showDialog(row = {}) {
      this.tableData = []
      this.dialogVisible = true
      this.title = `站点规则【${row.name}】`
      this.parentId = row.id
      this.getTableData()
    },

    /**
     * @description: 根据 parentId 获取表格数据
     */

    async getTableData() {
      // this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await this.$parent.getGlobalKeyDetail(
        this.keyStr,
        this.parentId
      )
      // this.$refs.dialogRef.bodyLoading = false
      if (!res) return
      const arr = res.map(item => {
        const obj = JSON.parse(item.pvalue)
        return {
          ...item,
          ...obj
        }
      })
      this.tableData = arr.reverse()
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 切换状态
     * @param {*} row
     */

    async changeStatus(row, switchRef) {
      this.$refs[switchRef].loading = true
      const data = await this.$parent.changeGlobalAttrStatus(
        row.status,
        this.keyStr,
        row.id
      )
      this.$refs[switchRef].loading = false

      if (!data) {
        row.status = row.status ? 0 : 1
      }
    },

    /**
     * @description: 添加修改线路提交
     * @param {*} row
     */

    async submitForm(row) {
      if (this.form.rule === '') return this.$msg.error('请输入规则')
      if (this.form.remark === '') return this.$msg.error('请输入描述信息')
      this.btnLoading = true
      this.form.parentId = this.parentId
      const { id, rule, remark } = this.form

      const data = await this.$parent.saveGlobalAttr({
        [this.keyStr]: [
          {
            parentId: this.parentId,
            id,
            value: JSON.stringify({
              rule,
              remark
            })
          }
        ]
      })
      this.btnLoading = false
      if (!data) return
      this.nowUpdateRowId = null
      this.getTableData()
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async singleDelete(row) {
      const data = await this.$parent.deleteGlobalAttr(row.id, '规则')
      if (!data) return
      this.getTableData()
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      this.btnLoading = true
      const idsArr = this.selectArr.map(e => {
        return e.id
      })
      const data = await this.$parent.deleteGlobalAttr(idsArr + '', '规则', this.selectArr.length)
      this.btnLoading = false

      if (!data) return
      this.getTableData()
      this.selectArr = [] // 释放
    },

    // 添加
    showAddRow() {
      // 限制一次只允许添加一行
      if (this.tableData.length && this.tableData[0].id === 0) return
      // 给表单赋值
      this.form = {
        ...defaultForm
      }
      // 表格添加第一行
      this.tableData.unshift(this.form)
      // 展示添加输入框
      this.nowUpdateRowId = 0
    },

    // 修改行显示
    showUpdateRow(row) {
      // 如果已打开行为新增行，则移除新增行，解除禁止添加记录按钮
      if (this.nowUpdateRowId === 0) {
        this.tableData.shift()
      }
      // 展示修改输入框
      this.nowUpdateRowId = row.id
      // 给表单赋值
      this.form = {
        ...row
      }
    },

    // 添加修改点击取消
    cancelUpdate(row) {
      // 如果为新添加的记录，然后点击取消，则直接删除该行，解除禁止添加记录按钮
      if (row.id === 0) {
        this.tableData.shift()
      }
      this.nowUpdateRowId = null
    },

    // 表单重置
    resetFrom() {
      this.nowUpdateRowId = null
      this.form = {
        ...defaultForm
      }
    }
  }
}
</script>
