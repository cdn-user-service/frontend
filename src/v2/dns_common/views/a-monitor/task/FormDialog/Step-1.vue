<template>
  <div>
    <ants-form
      style="max-width:400px;margin:0 auto;"
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
      label-position="top"
      :status-icon="false"
    >
      <div class="ants-tips_box mb-lg">
        <span class="el-icon-info"></span>
        只显示包含 A 、AAAA 或 CNAME 记录的域名
      </div>
      <ants-form-item
        label=""
        prop="domain"
      >
        <el-table
          size="mini"
          :data="tableData"
          @row-click="onRowClick"
          border
          row-key="id"
          v-loading="loading"
          style="margin:0;"
        >
          <div slot="empty">
            <el-empty :description="antsT('还没有任何域名')">
              <ants-button
                type="primary"
                size="mini"
                @click="$router.push('/dns/domain/list')"
                text="前往添加"
              />
            </el-empty>
          </div>
          <ants-table-column
            prop="domain"
            label="域名"
            min-width="200"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <el-input
                  class="ants-search_input"
                  :placeholder="antsT('检索域名')"
                  clearable
                  v-model="queryInfo.domain"
                  size="small"
                  @change="changeInput"
                  style="width:100%;"
                >
                  <i
                    slot="prefix"
                    class="el-input__icon aicon icon-sousuo"
                    @click="changeInput"
                  />
                </el-input>
              </div>
            </template>

            <template #default="{ row }">
              <el-radio
                v-model="currentRow.id"
                :label="row.id"
              >
                {{ row.domain }}
              </el-radio>
            </template>
          </ants-table-column>
        </el-table>
        <el-pagination
          background
          style="margin-top:10px;"
          layout="total, prev, pager, next"
          :total="total"
          small
          :page-sizes="[10, 20, 50, 100, 200]"
          :page-size="queryInfo.limit"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.page"
        />

        <!-- <SelectDomain
          @change="changeSelectDomain"
          ref="SelectDomainRef"
          :multiple="false"
          size="large"
          style="width:100%;"
        /> -->
        <!-- <ants-select
          placeholder="请选择域名"
          v-model="form.domain"
          style="width:400px;"
        >
          <ants-option
            v-for="item in domainList"
            :key="item.id"
            :label="item.domain"
            :value="item.id"
          />
        </ants-select> -->
      </ants-form-item>
    </ants-form>
  </div>

</template>

<script>
// 组件
import SelectDomain from '@/v2/dns_common/components/SelectDomain'

// API
import { getUserList } from '@/v2/dns_admin/api/account/user'
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getList } = require(`@/v2/${PROCESS_NAME}/api/dns/domain`)

const defaultForm = {
  username: '',
  domain: '',
  domainId: ''
}

export default {
  components: {
    // SelectDomain
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      loading: false,
      form: {
        ...defaultForm
      },
      formRules: {
        username: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ],
        domain: [
          {
            required: true,
            message: '请选择域名',
            trigger: 'change'
          }
        ]
      },

      userList: [],
      tableData: [],
      total: 0,
      queryInfo: {
        domain: '',
        page: 1,
        limit: 10
      },
      currentRow: {}
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    /**
     * @description: 获取域名列表
     */

    async getTableData() {
      this.loading = true
      const { data: res } = await getList(this.queryInfo)
      this.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}

      this.tableData = obj.list || []
      this.total = obj.totalCount || 0
    },

    // 点击下一步，验证表单
    submit(callback) {
      if (!this.currentRow.id) {
        callback()
        this.$msg.error('请选择域名')
        return
      }

      const { domain, id } = this.currentRow
      this.form = {
        ...this.form,
        domain,
        domainId: id
      }
      callback(this.form)
    },

    // 检索
    changeInput() {
      this.queryInfo.domain = this.queryInfo.domain.trim()
      this.queryInfo.page = 1
      this.getTableData()
    },

    // 点击
    onRowClick(row) {
      this.currentRow = row
    },

    // 监听limit 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getTableData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.getTableData()
    },

    // 选择域名
    changeSelectDomain({ domains = [], domainIds }) {
      if (domains.length) {
        this.form.domain = domains[0]
        this.form.domainId = domainIds[0]
        // 移除表单校验
        this.$refs.formRef.clearValidate()
      }
    },

    // 表单重置
    resetForm() {
      this.$refs.formRef.resetFields()
      this.form = {
        ...defaultForm
      }
      // this.$refs.SelectDomainRef.reset()
    },

    /**
     * @description: 远程搜索域名
     */

    async userRemoteMethod(queryString) {
      this.loading = true
      const { data: res } = await getUserList({
        username: queryString.trim(),
        page: 1,
        limit: 50
      })
      this.loading = false
      if (res.code !== 1) return
      this.userList = (res.page || {}).list
    },

    /**
     * @description: 选择用户
     */

    changeUser(val) {
      console.log(val)
      const arr = []
      for (let i = 1; i < 5; i++) {
        arr.push({
          id: i,
          name: '反向解析套餐' + i
        })
      }
      this.planList = arr

      if (this.planList.length) {
        this.form.planId = this.planList[0].id
      }
    }
  }
}
</script>
