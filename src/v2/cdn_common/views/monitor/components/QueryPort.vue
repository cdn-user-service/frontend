<template>
  <el-dropdown
    placement="bottom"
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

        <ants-input
          class="ants-search_input"
          style="width:100%;"
          :placeholder="`检索${activeTab === 'port' ? '端口' : '用户'}`"
          clearable
          v-model="queryInfo.port"
          size="small"
          @change="searchPort"
        >
          <!-- <i
            slot="prefix"
            class="el-input__icon aicon icon-sousuo"
            @click="searchPort"
          ></i> -->
          <el-button
            slot="append"
            icon="aicon icon-sousuo"
            @click="searchPort"
          ></el-button>
        </ants-input>

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
              <strong>{{ checkPort.length }}</strong> /
              {{ total }}
            </span>
          </div>
          <div
            class="overflow-y-auto"
            style="max-height:340px;"
          >
            <el-empty
              :description="antsT('暂无数据')"
              v-if="total == 0"
              style="transform: scale(0.8)"
            ></el-empty>
            <ants-checkbox-group
              v-else
              v-model="checkPort"
              @change="changeCheckPort"
            >
              <ants-checkbox
                v-for="item in portData"
                :label="
                  JSON.stringify({
                    id: item.id,
                    port: item.port
                  })
                "
                :key="item.id"
                :text="item.port"
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
            text="查 询"
          />
        </div>
      </li>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getStreamList } = require(`@/v2/${PROCESS_NAME}/api/cdn/stream`)

export default {
  data() {
    return {
      loading: false,

      activeTab: 'port',
      tabList: [
        {
          title: '请选择端口',
          value: 'port'
        },
        {
          title: '按用户',
          value: 'user'
        }
      ],

      // 总共多少条
      total: 0,
      // 当前有多少条
      nowPageTotal: 0,
      queryInfo: {
        user: '',
        port: '',
        page: 1,
        limit: 10
      },
      // 列表数据
      portData: [],
      // 是否全选
      checkAll: false,
      // 是否半选
      isIndeterminate: false,
      // 选中端口
      checkPort: [],
      // 全部端口
      portAllArr: []
    }
  },
  computed: {
    buttonText() {
      let txt = this.antsT('请选择端口')
      const checkSum = this.checkPort.length
      if (checkSum === 0) {
        txt = this.antsT('请选择端口')
      }
      if (checkSum > 0 && checkSum <= this.total) {
        txt = `${this.antsT('已选择')} ${checkSum} / ${this.total} ${this.antsT(
          '个端口'
        )}`
      }
      // if (checkSum === this.total) {
      //   txt = '全部端口'
      // }
      return txt
    }
  },
  created() {},
  mounted() {
    this.getPortData(true)
  },
  methods: {
    // tab 切换
    changeTab(value) {
      this.activeTab = value
      this.checkAll = this.isIndeterminate = false
      this.checkPort = []
      this.portData = []
      this.total = 0
      this.nowPageTotal = 0
      this.queryInfo.port = ''
      this.queryInfo.page = 1

      // if (value === 'port') {
      //   this.getPortData()
      // } else {
      //   this.getGroupData()
      // }
    },

    // 点击全选
    changeCheckAll(checked) {
      this.checkPort = checked ? this.portAllArr : []
      this.isIndeterminate = false
    },

    // 勾选
    changeCheckPort(val) {
      const checkedCount = val.length
      this.checkAll = checkedCount === this.nowPageTotal
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.nowPageTotal
    },

    getGroupData() {},

    /**
     * @description: 分页获取端口列表数据
     */

    async getPortData(isGetChart = false) {
      this.loading = true
      const { data: res } = await getStreamList(this.queryInfo)
      this.loading = false
      if (res.code !== 1) return
      this.portAllArr = []
      const obj = res.data || {}
      const arr = (obj.list || []).map(item => {
          const confInfo = JSON.parse(item.confInfo)
          const value = {
            id: item.id,
            port: confInfo.listen
          }
          // 赋值给默认全选
          this.portAllArr.push(JSON.stringify(value))

          return value
        })

      this.portData = arr || []
      this.total = obj.totalCount || 0
      this.nowPageTotal = arr.length

      if (isGetChart && arr.length > 0) {
        // 默认选中当前页的全部端口
        this.checkPort = this.portAllArr
        this.checkAll = true

        // 如果有端口则查询所有端口
        this.$listeners.getChart()
      }
    },

    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getPortData()
    },

    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      // this.checkAll = false
      // 获取数据，并自动查询数据
      this.getPortData(true)
    },

    /**
     * @description: 点击查询
     */

    querySubmit() {
      if (!this.checkPort.length) return this.$msg.error(this.antsT('请选择端口'))
      this.hideDropdown()
      this.$listeners.getChart()
    },

    // 隐藏 dropdown
    hideDropdown() {
      this.$refs.dropdownRef.hide()
    },

    // 查询端口
    async searchPort() {
      this.queryInfo.page = 1
      this.portAllArr = []
      this.checkPort = []
      this.checkAll = false
      this.getPortData()
    }
  }
}
</script>

<style lang="scss">
.el-input-group__append {
  padding: 0 15px;
}
</style>
