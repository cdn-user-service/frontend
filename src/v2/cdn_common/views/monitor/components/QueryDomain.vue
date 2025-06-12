<template>
  <el-dropdown
    placement="bottom-start"
    trigger="click"
    class="max-w-full"
    ref="dropdownRef"
  >
    <ants-button
      size="small"
      icon="el-icon-plus"
      :loading="loading"
      :text="buttonText"
    />

    <el-dropdown-menu slot="dropdown">
      <li style="width:300px;height:500px;" class="px-df relative">
        <!-- <div class="p-1 bg-ants-bg-3 rounded-xl mb-lg">
          <el-row>
            <el-col :span="12" v-for="item in tabList" :key="item.value">
              <div
                @click="changeTab(item.value)"
                class="py-xs text-center rounded-xl cursor-color"
                :class="{
                  'bg-ants-bg-1 text-primary font-bold':
                    activeTab === item.value
                }"
              >
                {{ item.title }}
              </div>
            </el-col>
          </el-row>
        </div> -->

        <div class="flex items-center">
          <ants-input
            class="ants-search_input"
            style="width:100%;"
            :placeholder="`检索${activeTab === 'domain' ? '域名' : '分组'}`"
            clearable
            v-model="queryInfo.mainServerName"
            size="small"
            @change="searchDomain"
          >
            <!-- <i
              slot="prefix"
              class="el-input__icon aicon icon-sousuo"
              @click="searchDomain"
            ></i> -->
            <el-button slot="append" icon="aicon icon-sousuo" @click="searchDomain"></el-button>
          </ants-input>
        </div>

        <div class="mt-lg" v-loading="loading">
          <div
            class="flex items-center justify-between pb-sm border-b border-ants-border-4"
          >
            <ants-checkbox
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="changeCheckAll"
              text="全选"
            />
            <span class="text-sm">
              <strong>{{ checkDomain.length }}</strong> /
              {{ total }}
            </span>
          </div>
          <div
            class="overflow-y-auto"
            style="max-height:340px;"
          >
            <el-empty
              description="暂无数据"
              v-if="total == 0"
              style="transform: scale(0.8)"
            ></el-empty>
            <ants-checkbox-group
              v-else
              v-model="checkDomain"
              @change="changeCheckDomain"
            >
              <ants-checkbox
                v-for="item in domainData"
                :label="
                  JSON.stringify({
                    id: item.id,
                    domain: item.domain
                  })
                "
                :key="item.id"
                :text="item.domain"
                class="block my-sm"
              />
            </ants-checkbox-group>
          </div>

          <div class="text-center">
            <el-pagination
              background
              layout="prev, pager, next"
              small
              :page-size="queryInfo.limit"
              :current-page="queryInfo.page"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :total="total"
              :hide-on-single-page="total === 0"
              style="margin-top:5px;margin-left: -10px;"
            />
          </div>
        </div>

        <div
          class="absolute bottom-0 left-0 right-0 
          text-center pt-sm border-t 
          bg-ants-bg-1 border-ants-border-4"
        >
          <ants-button
            size="small"
            type="info"
            @click="hideDropdown"
            text="取 消"
          />
          <ants-button
            size="small"
            type="primary"
            @click="querySubmit"
            :loading="$root.loading || loading"
            text="查询"
          />
        </div>
      </li>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getSiteList } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  data() {
    return {
      loading: false,
      activeTab: 'domain',
      tabList: [
        {
          title: '按域名',
          value: 'domain'
        },
        {
          title: '按分组',
          value: 'group'
        }
      ],
      
      // 总共多少条
      total: 0,
      // 当前有多少条
      nowPageTotal: 0,
      queryInfo: {
        user: '',
        mainServerName: '',
        page: 1,
        limit: 10
      },
      // 列表数据
      domainData: [],
      // 是否全选
      checkAll: false,
      // 是否半选
      isIndeterminate: false,
      // 选中域名
      checkDomain: [],
      // 全部域名
      domainAllArr: []
    }
  },
  computed: {
    buttonText() {
      let txt = this.antsT('请选择域名')
      const checkSum = this.checkDomain.length
      if (checkSum === 0) {
        txt = this.antsT('请选择域名')
      }
      if (checkSum > 0 && checkSum <= this.total) {
        txt = `${this.antsT('已选择')} ${checkSum} / ${this.total} ${this.antsT(
          '个域名'
        )}`
      }
      // if (checkSum === this.total) {
      //   txt = '全部域名'
      // }
      return txt
    }
  },
  created() {},
  mounted() {
    this.getDomainData(true)
  },
  methods: {
    // tab 切换
    changeTab(value) {
      this.activeTab = value
      this.checkAll = this.isIndeterminate = false
      this.checkDomain = []
      this.domainData = []
      this.total = 0
      this.nowPageTotal = 0
      this.queryInfo.domain = ''
      this.queryInfo.page = 1

      if (value === 'domain') {
        this.getDomainData()
      } else {
        this.getGroupData()
      }
    },

    // 点击全选
    changeCheckAll(checked) {
      this.checkDomain = checked ? this.domainAllArr : []
      this.isIndeterminate = false
    },

    // 勾选
    changeCheckDomain(val) {
      const checkedCount = val.length
      this.checkAll = checkedCount === this.nowPageTotal
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.nowPageTotal
    },

    getGroupData() {},

    /**
     * @description: 获取表格数据
     */

    async getDomainData(isGetChart = false) {
      this.loading = true
      const { data: res } = await getSiteList(this.queryInfo)
      this.loading = false
      if (res.code !== 1) return
      this.domainAllArr = []
      const obj = res.data || {}
      const arr = (obj.list || []).map(item => {
          const value = {
            id: item.id,
            domain: item.mainServerName
          }
          // 赋值给默认全选
          this.domainAllArr.push(JSON.stringify(value))
          return value
        })
      this.domainData = arr
      this.total = obj.totalCount || 0
      this.nowPageTotal = arr.length

      if (isGetChart && arr.length > 0) {
        // 默认选中当前页的全部域名
        this.checkDomain = this.domainAllArr
        this.checkAll = true
        // 如果有节点则查询所有节点
        this.$listeners.getChart()
      }
    },

    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getDomainData()
    },

    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      // this.checkAll = false
      // 获取数据，并自动查询数据
      this.getDomainData(true)
    },

    /**
     * @description: 点击查询
     */

    querySubmit() {
      if (!this.checkDomain.length) return this.$msg.error(this.antsT('请选择域名'))
      this.hideDropdown()
      this.$listeners.getChart()
    },

    // 隐藏 dropdown
    hideDropdown() {
      this.$refs.dropdownRef.hide()
    },

    // 检索域名
    async searchDomain() {
      this.queryInfo.page = 1
      this.domainAllArr = []
      this.checkDomain = []
      this.checkAll = false
      this.getDomainData()
    }
  }
}
</script>
<style lang="scss">
.el-input-group__append {
  padding: 0 15px;
}
</style>
