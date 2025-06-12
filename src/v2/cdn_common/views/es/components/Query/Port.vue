<template>
  <div class="inline-block">
    <span class="">端口：</span>
    <el-select
      style="vertical-align: middle;width:200px;"
      v-model="selectPort"
      :multiple="true"
      collapse-tags
      size="small"
      placeholder="查询端口"
      @change="handerChange"
      filterable
      clearable
      :loading="loading"
      class="port-select"
      ref="selectPortRef"
    >
      <el-option
        v-for="item in tableData"
        :key="item"
        :label="item"
        :value="item"
      >
      </el-option>
      <div class="flex items-center justify-center pt-2 border-t border-ants-border-2">
        <el-button type="primary" size="mini" @click="doSubmit">查询（{{ selectPort.length }}）</el-button>
      </div>
    </el-select>

    <!-- <span class="pl-sm">套餐：</span>
    <el-select
      style="vertical-align: middle;width:200px;"
      v-model="selectPlanId"
      :multiple="false"
      size="small"
      placeholder="查询套餐"
      @change="handerChangePlan"
      filterable
      :loading="loading"
      class="port-select"
    >
      <el-option
        v-for="(item, key) in plans"
        :key="key"
        :label="item"
        :value="key"
      >
      </el-option>
    </el-select> -->
  </div>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getStreamList } = require(`@/v2/${PROCESS_NAME}/api/cdn/stream`)

export default {
  data() {
    return {
      loading: false,
      query: {
        port: '',
        user: '', // 搜索框内容
        page: 1, // 当前的页数
        limit: 500 // 当前每页显示多少条数据
      },
      total: 0,
      // 端口列表
      tableData: [],
      // 已经选择的端口
      selectPort: [],
      plans: {},
      selectPlanId: null
    }
  },
  created() {
    this.$root.loading = true
    // 初始化的时候，勾选当前页全部端口，并查询图表数据
    this.getTableData()
  },
  methods: {
    // 获取端口列表
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getStreamList(this.query)
        if (res.code !== 1) return
        const obj = res.data || {}
        this.total = obj.totalCount || 0
        const arr = []
        const list = obj.list || []
        const planObj = {}
        list.forEach(item => {
          const confInfo = JSON.parse(item.confInfo || '{}')
          if (confInfo.listen) {
            const listen = confInfo.listen + ''
            const ports = listen.split('|')
            arr.push(...ports)
          }
          if (!planObj[item.serialNumber]) {
            planObj[item.serialNumber] = (item.suit || {}).suitName
          }
        })

        this.tableData = arr
        this.plans = planObj
        // 初始化时，勾选当前页全部端口，并查询数据
        if (!this.tableData.length) {
          return this.$msg.error('暂无端口')
        }
        this.selectPort = arr.slice(0, 9)
        this.submit()
      } finally {
        this.loading = false
        this.$root.loading = false
      }
    },

    handerChangePlan(val) {
      console.log(val)
      this.submit()
    },

    handerChange(val) {
      // this.submit()
    },

    doSubmit() {
      this.$refs.selectPortRef.handleClose()
      this.submit()
    },

    submit() {
      this.$emit('change', {
        port: this.selectPort,
        plan: [this.selectPlanId]
      })
    }
  }
}
</script>
