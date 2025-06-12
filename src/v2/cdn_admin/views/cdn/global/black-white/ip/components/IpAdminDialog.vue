<template>
  <ants-dialog
    :title="`IP管理【${parentGroupObj.remark}】`"
    v-model="dialogVisible"
    width="1200px"
    ref="dialogRef"
    top="5vh"
    @reset="resetFrom"
  >
    <table-query-form
      class="-mt-df mb-df"
      :search-arr="[
        {
          name: '检索IP',
          key: 'ip',
          value: queryInfo.ip
        }
      ]"
      :queryInfo="queryInfo"
      @changeInput="getTableData"
    >
      <template slot="buttons">
        <ants-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          :disabled="$root.loading"
          @click="showCreateRow()"
          text="添加IP"
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
      ></ants-table-column>
      <ants-table-column label="IP" prop="ip" min-width="160">
        <template #default="{ row }">
          <!-- 添加 -->
          <ants-input
            v-if="isCreateOrUpdate(row.id) === 'create'"
            v-model="form.ip"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            placeholder="请输入IP，一行一个"
          />
          <!-- 修改 -->
          <ants-input
            v-else-if="isCreateOrUpdate(row.id) === 'update'"
            v-model="form.ip"
            size="small"
            placeholder="请输入IP"
          />
          <span v-else>{{ row.ip }}</span>
        </template>
      </ants-table-column>

      <ants-table-column label="备注信息" prop="remark" min-width="160">
        <template #default="{ row }">
          <!-- <ants-input
            v-if="isCreateOrUpdate(row.id) === 'create'"
            type="textarea"
            v-model="form.remark"
            :autosize="{ minRows: 3, maxRows: 10 }"
            placeholder="请输入备注信息"
          />
          <ants-input
            v-else-if="isCreateOrUpdate(row.id) === 'update'"
            v-model="form.remark"
            size="small"
            placeholder="请输入备注信息"
          /> -->
          <span v-if="!isCreateOrUpdate(row.id)">{{ row.remark }}</span>
        </template>
      </ants-table-column>

      <ants-table-column prop="createTime" label="更新时间" min-width="140">
        <template #default="{ row }">
          <span v-if="!isCreateOrUpdate(row.id)">
            {{ row.createTime }}
          </span>
        </template>
      </ants-table-column>

      <ants-table-column label="类型" min-width="100">
        <template #default="{ row }">
          <div v-if="!isCreateOrUpdate(row.id)">
            <el-tag size="small" :type="controlObj[+row.control].type">{{
              controlObj[+row.control].name
            }}</el-tag>
          </div>
        </template>
      </ants-table-column>

      <ants-table-column label="操作" width="170" align="right">
        <template #default="{ row }">
          <div v-if="isCreateOrUpdate(row.id)">
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
            <el-button
              size="mini"
              type="primary"
              circle
              icon="el-icon-edit"
              @click="showUpdateRow(row)"
              class="mr-sm"
            />

            <el-popconfirm
              :title="`确定删除IP：${row.ip} ？`"
              cancel-button-type="info"
              icon-color="red"
              placement="bottom-end"
              @confirm="singleDelete(row)"
            >
              <el-button
                slot="reference"
                type="danger"
                size="mini"
                circle
                icon="el-icon-delete"
              />
            </el-popconfirm>

            <!-- <span
              class="cursor-pointer text-primary el-icon-edit"
              @click="showUpdateRow(row)"
            >
              {{ antsT('修改') }}</span
            >
            <el-divider direction="vertical"></el-divider>

            <el-popconfirm
              :title="`确定删除IP：${row.ip} ？`"
              cancel-button-type="info"
              icon-color="red"
              placement="bottom-end"
              @confirm="singleDelete(row)"
            >
              <span
                slot="reference"
                class="text-error cursor-pointer el-icon-delete"
              >
                {{ antsT('删除') }}</span
              >
            </el-popconfirm> -->
          </div>
        </template>
      </ants-table-column>
    </ants-table>
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
// API
import {
  getIpControlList,
  doSaveIpOrControl,
  doBatchSaveIp,
  doBatchDeleteIpOrControl
} from '@/v2/cdn_admin/api/cdn/ip'

const defaultForm = {
  // 添加时 id = 0
  id: 0,
  // 多个IP地址，以逗号分隔的字符串
  ip: '',
  // 备注信息
  remark: '',
  status: 1
}
export default {
  props: {
    // 类型
    controlObj: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      btnLoading: false,
      total: 0,
      queryInfo: {
        group: 0,
        parentId: 0,
        // 分组类型： -1 = 所有, 0 = 未定义, 1 = 白名单（7层）, 2 = 7层黑名单, 3 = 3层黑名单
        control: -1,
        ip: '',
        page: 1,
        limit: 20
      },

      // 父分组数据
      parentGroupObj: {},

      // 表格数据
      tableData: [],
      // 勾选数据
      selectArr: [],

      // 修改线路select 是否显示
      nowUpdateRowId: null,
      // 添加修改表单
      form: {
        ...defaultForm
      }
    }
  },
  computed: {
    /**
     * @description: 当前操作为创建IP 还是 更新IP，
     */

    isCreateOrUpdate() {
      return id => {
        if (id === 0) return 'create'
        if (this.nowUpdateRowId === id) return 'update'
        return false
      }
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     * @param {*} row
     */
    showDialog(row = {}) {
      this.dialogVisible = true
      // 数据初始化
      this.tableData = []
      this.total = 0
      this.queryInfo.ip = ''
      this.queryInfo.page = 1
      this.queryInfo.parentId = row.id
      this.queryInfo.control = row.control

      this.parentGroupObj = {
        ...row
      }
      this.getTableData()
    },

    /**
     * @description: 根据 parentId 获取表格数据
     */

    async getTableData() {
      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getIpControlList(this.queryInfo)
      this.$refs.dialogRef.bodyLoading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      this.tableData = obj.list || []
      this.total = obj.totalCount || 0
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 表单提交
     * @param {*} row
     */

    async submitForm(row) {
      if (this.form.ip === '') return this.$msg.error('请输入IP')
      // if (this.form.remark === '') return this.$msg.error('请输入备注信息')
      this.btnLoading = true
      const { id, ip, remark, status } = this.form
      const parentId = this.parentGroupObj.id

      // 如果为添加
      if (id === 0) {
        const { data: res } = await doBatchSaveIp({
          parentId,
          ips: ip.trim().replace(/[\r\n]+/g, ','),
          remark
        })
        this.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success('添加成功')
      } else {
        // 如果为修改
        const { data: res } = await doSaveIpOrControl({
          parentId,
          id,
          ip,
          remark,
          status
        })
        this.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success('修改成功')
      }

      this.nowUpdateRowId = null
      this.getTableData()
      this.$parent.getTableData()
    },

    /**
     * @description: 单个删除
     */

    async singleDelete({ id, ip }) {
      this.btnLoading = true
      const { data: res } = await doBatchDeleteIpOrControl({
        ids: id
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success(this.antsT('删除成功'))
      this.$parent.getTableData()
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length

      const result = await this.$batchDelete(selectLength, {
        tag: 'IP'
      })
      if (!result) return

      this.btnLoading = true
      const idsArr = this.selectArr.map(e => e.id)
      const { data: res } = await doBatchDeleteIpOrControl({
        ids: idsArr + ''
      })
      this.btnLoading = false
      if (res.code !== 1) return
      this.$msg.success('删除成功')
      this.getTableData()
      this.selectArr = []
      this.$parent.getTableData()
    },

    /**
     * @description: 添加表单显示
     */

    showCreateRow() {
      // 限制一次只第一行显示添加
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

    /**
     * @description: 修改表单显示
     */

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

    /**
     * @description: 添加修改点击取消
     */

    cancelUpdate(row) {
      // 如果为新添加的记录，然后点击取消，则直接删除该行，解除禁止添加记录按钮
      if (row.id === 0) {
        this.tableData.shift()
      }
      this.nowUpdateRowId = null
    },

    // 对话框关闭，数据重置
    resetFrom() {
      this.nowUpdateRowId = null
      this.selectArr = []
      this.form = {
        ...defaultForm
      }
    }
  }
}
</script>
