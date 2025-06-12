<template>
  <el-dialog
    :title="`选择要购买${text}的域名`"
    :visible.sync="dialogVisible"
    width="500px"
    @close="resetForm"
    center
    append-to-body
    top="10vh"
  >
    <div style="min-height: 400px" class="-my-lg">
      <el-input
        class="ants-search_input mr-xs"
        :placeholder="antsT('检索域名')"
        clearable
        v-model="queryInfo.domain"
        size="small"
        @change="changeInput"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
          @click="changeInput"
        ></i>
      </el-input>
      <el-table
        size="mini"
        :data="domainList"
        max-height="420"
        @selection-change="handleSelectionChange"
        border
        v-loading="loading"
      >
        <div slot="empty">
          <el-empty :description="antsT('还没有任何域名')"> </el-empty>
        </div>
        <el-table-column
          type="selection"
          align="center"
          width="60"
        ></el-table-column>
        <el-table-column prop="domain" label="域名" min-width="200">
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        small
        :page-sizes="[10, 20, 50, 100, 200]"
        :page-size="queryInfo.limit"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
      />
    </div>

    <span slot="footer">
      <ants-button
        type="info"
        size="small"
        @click="dialogVisible = false"
        text="取 消"
      />
      <ants-button
        type="primary"
        :loading="btnLoading"
        size="small"
        @click="submit()"
        :text="`选择域名(${selectArr.length})`"
      />
    </span>
  </el-dialog>
</template>

<script>
// api
import {
  GetUserFreeDomainConsume,
  GetUserFreeDomainConsumePage,
  getUserDomainByLevels
} from '@/v2/dns_users/api/dns/plan'

// api
import { getList } from '@/v2/dns_users/api/dns/domain'

export default {
  name: 'SelectDomainDialog',
  props: {
    text: {
      type: String,
      default: 'DNS解析套餐'
    },
    // 购买产品类型，plan = dns套餐， vas = 增值业务
    goodType: {
      type: String,
      default: 'plan'
    }
  },
  data() {
    return {
      total: 0,
      dialogVisible: false,
      loading: false,
      btnLoading: false,
      domain: '',
      domainList: [],
      selectArr: [],

      queryInfo: {
        domain: '',
        page: 1,
        limit: 50
      }
    }
  },
  computed: {},
  created() {},
  methods: {
    /**
     * @description: 对话框显示
     */

    showDialog() {
      this.dialogVisible = true
      this.selectArr = []
      this.getTableData()
    },

    getTableData() {
      this.goodType === 'vas' ? this.getAllDomain() : this.getFreeDomain()
    },

    // 选择域名提交
    submit() {
      this.btnLoading = true
      const domainsArr = this.selectArr.map((item) => item.domain)
      this.$emit('getSelectDomains', domainsArr)
      this.btnLoading = false
      this.dialogVisible = false
    },

    /**
     * @description: 获取当前用户免费域名列表，用于套餐购买
     */

    async getFreeDomain() {
      this.loading = true
      const { data: res } = await GetUserFreeDomainConsumePage({
        page: this.queryInfo.page,
        limit: this.queryInfo.limit,
        keyword: this.queryInfo.domain
      })
      this.loading = false

      this.domainList = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    /**
     * @description: 获取所有域名列表，用于增值业务购买
     */

    async getAllDomain() {
      this.loading = true
      const { data: res } = await getList(this.queryInfo)
      this.loading = false

      this.domainList = res.data.list || []
      this.total = res.data.totalCount || 0
    },

    // 检索
    changeInput() {
      this.queryInfo.domain = this.queryInfo.domain.trim()
      this.queryInfo.page = 1
      this.getTableData()
    },

    handleSelectionChange(val) {
      this.selectArr = val
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

    resetForm() {
      this.btnLoading = false
    },

    /**
     * @description: 根据产品ID，获取用户的域名；增值业务购买时传 -1
     */

    async getDomainsByGoodsId(levels = -1) {
      this.loading = true
      const { data: res } = await getUserDomainByLevels({
        levels
      })
      this.loading = false

      this.domainList = (res.data && res.data.all_domain) || []
    }
  }
}
</script>

<style lang="scss">
.search_input {
  max-width: 250px;

  .el-input__icon {
    /* 搜索输入框左侧图标样式 */
    display: inline-block;
    line-height: 32px;
    padding: 0px 0px 0 1px;
    cursor: pointer;
    color: theme('colors.ants-text-1');
    font-weight: 700;
  }
}
</style>
