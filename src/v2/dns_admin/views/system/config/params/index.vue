<template>
  <div class="work_item_box">
    <el-card class="content-box animated fadeIn">
      <table-query-form
        :search-arr="[
          {
            name: '输入参数名搜索',
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
            @click="
              addParamsShow({
                id: 0,
                paramKey: '', // 参数名
                paramValue: '', // 参数值
                remark: '' // 描述信息
              })
            "
            >{{ antsT('添加参数') }}</el-button
          >
          <!-- <el-button
            type="info"
            size="small"
            icon="el-icon-delete"
            :loading="btnLoading"
            @click="batchDelete"
            >{{ antsT('批量删除') }}</el-button
          > -->
        </template>
      </table-query-form>

      <ants-table
        :data="tableData"
        @getTableData="getTableData"
        @selection-change="handleSelectionChange"
        :total="total"
        :queryInfo="queryInfo"
      >
        <!-- <ants-table-column
            type="selection"
            width="45"
            align="center"
            key="0"
          ></ants-table-column> -->
        <ants-table-column prop="id" label="ID" width="70"> </ants-table-column>
        <ants-table-column prop="remark" label="描述信息" min-width="100">
        </ants-table-column>

        <ants-table-column prop="paramKey" label="参数名" min-width="120">
        </ants-table-column>

        <ants-table-column prop="status" label="状态" min-width="60">
          <template #default="{ row }">
            <span v-if="row.status === 1" class="text-success el-icon-success">
              开启</span
            >
            <span v-else class="text-error el-icon-remove"> 停用</span>
          </template>
        </ants-table-column>

        <!-- <ants-table-column
            prop="paramValue"
            label="参数值"
            min-width="300"
            
          >
            <template #default="{ row }">
              <div class="param_value_div">
                {{ row.paramValue }}
              </div>
            </template>
          </ants-table-column> -->

        <ants-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="primary" size="mini" @click="goDetail(row)"
              >详情</el-button
            >
            <!-- <el-button
                type="primary"
                size="mini"
                @click="addParamsShow(row)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                size="mini"
                @click="deleteWork(row)"
                >删除</el-button
              > -->
          </template>
        </ants-table-column>
      </ants-table>
    </el-card>

    <!-- 添加参数对话框弹窗 -->
    <ants-dialog
      :title="dialogText + '参数'"
      v-model="dialogVisible"
      ref="dialogRef"
      @closed="resetForm"
      @submit="submitForm"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="80px"
      >
        <ants-form-item label="参数描述" prop="remark">
          <ants-input
            v-model="form.remark"
            placeholder="请输入参数描述"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="参 数 名" prop="paramKey">
          <ants-input
            v-model="form.paramKey"
            placeholder="请输入参数名"
          ></ants-input>
        </ants-form-item>
        <ants-form-item label="参 数 值" prop="paramValue">
          <ants-input
            v-model="form.paramValue"
            placeholder="请输入参数值"
            type="textarea"
            :autosize="{ minRows: 8, maxRows: 20 }"
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
  doCreate,
  doUpdate,
  doDelete
} from '@/v2/dns_admin/api/system/config'

const defaultForm = {
  // 添加对话框的表单数据
  id: 0,
  paramKey: '', // 参数名
  paramValue: '', // 参数值
  remark: '' // 描述信息
}
export default {
  data() {
    return {
      total: 0,
      queryInfo: {
        title: '', // 参数标题
        page: 1, // 当前的页数
        sidx: 'id', // 排序字段
        order: 'desc', // 排序方式，如：asc、desc
        limit: this.$store.state.tabelConfig.pagesize // 当前每页显示多少条数据
      },

      selectArr: [],
      tableData: [],
      btnLoading: false,

      dialogText: '添加',
      dialogVisible: false, // 添加参数对话框弹窗显示
      form: {
        ...defaultForm
      },

      formRules: {
        paramKey: [
          {
            required: true,
            message: '参数名不能为空',
            trigger: 'blur'
          }
        ],
        paramValue: [
          {
            required: true,
            message: '参数值不能为空',
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
      }
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取参数列表数据
     */

    async getTableData() {
      this.$root.loading = true
      const { data: res } = await getList(this.queryInfo)

      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.page || {}
      const arr = obj.list || []

      if (this.$mode['176_179']) {
        this.tableData = arr
      } else {
        this.tableData = arr.filter(
          item => !['STRIPE_PAY_CONF', 'TOKEN_PAY_CONF'].includes(item.paramKey)
        )
      }

      this.total = obj.totalCount || 0
    },

    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 点击查看详情
     */

    goDetail({ paramKey }) {
      const ROUTE_OBJ = {
        WEB_DIR_CONF: 'site/dir',
        WEB_SITE_CONFIG_KEY: 'site/basic',
        WEB_AGREEMENT: 'site/agreement',
        WXLOGIN_CONFIG_KEY: 'wechatCode',
        MAIL_CONFIG_KEY: 'email/config',
        SMS_CONFIG_KEY: 'sms',
        SMS_BAO: 'sms',
        ALIYUN_SMS_CONFIG_KEY: 'sms',
        TENCENTUSERCERTIFY_CONFIG_KEY: 'verification/wechat',
        ALIPAYUSERCERTIFY_CONFIG_KEY: 'verification/ali',
        WXPAY_CONFIG_KEY: 'payment/wechat',
        ALIPAY_CONFIG_KEY: 'payment/alipay',
        STRIPE_PAY_CONF: 'payment/stripe',
        TOKEN_PAY_CONF: 'payment/tokenpay',
        CCCYUN_PAY_CONF: 'payment/cccyun',
        SYS_APP_LOGIN: 'token',
        CDN_USER_API_ROOT_URI: 'other-url'
      }
      if (ROUTE_OBJ[paramKey]) {
        this.$router.push(`/system/config/${ROUTE_OBJ[paramKey]}`)
      } else {
        this.$msg.warning('该配置暂未设置！！！')
      }
    },

    /**
     * @description: 点击添加-修改参数员信息
     * @param {*} row
     */

    async addParamsShow(row) {
      this.dialogText = !row.id ? '添加' : '编辑'
      this.form = {
        ...row
      }
      this.dialogVisible = true
    },

    /**
     * @description: 添加-修改参数提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { data: res } = (await !this.form.id)
          ? doCreate(this.form)
          : doUpdate(this.form)
        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return

        this.getTableData()
        this.dialogVisible = false
        this.$msg.success(this.dialogText + '参数成功')
      })
    },

    // 添加分组表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    },

    /**
     * @description: 批量删除
     */

    async batchDelete() {
      const selectLength = this.selectArr.length
      const result = await this.$batchDelete(selectLength, {
        tag: '参数'
      })
      if (!result) return
      this.btnLoading = true
      const idsArr = this.selectArr.map(e => {
        return e.id
      })
      this.btnLoading = false

      const { data: res } = await doDelete(idsArr)

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('已成功删除 ' + selectLength + ' 个参数')
      this.selectArr = [] // 释放
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteWork(row) {
      const result = await this.$doDelete({
        name: row.remark,
        tag: '参数'
      })
      if (!result) return

      const { data: res } = await doDelete([row.id])

      if (res.code !== 1) return
      this.getTableData()
      this.$msg.success('删除参数成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.param_value_div {
  overflow-y: auto;
  max-height: 200px;
}
</style>
