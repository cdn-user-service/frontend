<template>
  <el-card>
    <div class="flex items-center justify-between" slot="header">
      <div class="flex items-center">
        <div class="pr-lg mr-lg border-r border-ants-border-3">
          <el-button
            icon="el-icon-back"
            plain
            circle
            size="mini"
            @click="$router.push('./settings')"
          ></el-button>
          <strong class="text-2xl ml-sm"> 实时监控详情 </strong>
        </div>

        <div>
          <TaskPopover
            @change="changeTask"
            :disabled="loading"
            ref="TaskPopoverRef"
          />

          <span v-if="taskResult.status == 1" class="text-success">
            <i class="el-icon-success"></i>
            监控中
          </span>

          <span v-else-if="taskResult.status == 0" class="text-error">
            <i class="el-icon-error"></i>
            已暂停
          </span>
        </div>
      </div>

      <ants-button
        type="primary"
        size="small"
        text="监控设置"
        :loading="loading"
        icon="el-icon-monitor"
        @click="toRules()"
      />
    </div>

    <div class="flex" v-loading="loading">
      <div
        class="p-df mr-lg border border-ants-border-3 rounded-2xl"
        style="width: 400px"
      >
        <TitleBorder title="监控详情" class="pb-sm"> </TitleBorder>
        <ul class="space-y-6 mt-sm">
          <li v-for="(item, key) in taskResultLabel" :key="key">
            <span class="text-ants-text-4">{{ item }}：</span>
            <span>{{ taskResult[key] || '-' }}</span>
          </li>
        </ul>
      </div>

      <div class="flex-1 p-df border border-ants-border-3 rounded-2xl">
        <TitleBorder title="探测记录" class="pb-sm"> </TitleBorder>

        <el-table
          size="mini"
          style="margin: 0"
          :data="tableData"
          max-height="400"
          row-key="rdata"
          :tree-props="{
            children: 'children',
            hasChildren: 'hasChildren'
          }"
        >
          <el-empty
            slot="empty"
            description="暂无数据"
            style="transform: scale(0.8)"
          />

          <ants-table-column
            min-width="100"
            show-overflow-tooltip
            prop="top"
            label="主机记录"
          >
          </ants-table-column>

          <ants-table-column prop="domain" label="域名" min-width="150">
          </ants-table-column>

          <ants-table-column prop="recordType" label="记录类型" min-width="100">
          </ants-table-column>

          <ants-table-column prop="recordLineName" label="线路" min-width="100">
          </ants-table-column>

          <ants-table-column prop="rdata" label="记录值" min-width="150">
          </ants-table-column>

          <ants-table-column width="140" prop="publish" label="监测时间">
            <template #default="{ row }">
              <span v-if="row.publish">
                {{ (row.publish * 1000) | dateFormat }}
              </span>
              <span v-else>-</span>
            </template>
          </ants-table-column>

          <ants-table-column prop="time" label="响应时间" min-width="100">
            <template #default="{ row }">
              {{ row.time || '-' }}
            </template>
          </ants-table-column>
        </el-table>
      </div>
    </div>

    <RuleDialog ref="RuleDialogRef" @refresh="getDetail" />
  </el-card>
</template>

<script>
import LineChartOption from './yong-line-option.js'
import TimeLineChartOption from './time-line-option.js'

// 组件
import TaskPopover from './TaskPopover.vue'
import RuleDialog from '../RuleDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getCallbackInfo } = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const taskResultLabel = {
  taskId: '任务ID',
  monitorType: '探测类型',
  url: '探测地址',
  httpPort: '探测端口',
  frequency: '探测频率',
  timeoutThreshold: '响应超时',
  rule: '切换规则'
}

const typeList = {
  1: 'HTTP',
  2: 'HTTPS',
  3: 'TCP',
  4: 'UDP',
  5: 'PING'
}

const rateObj = {
  10: '10秒',
  15: '15秒',
  30: '30秒',
  60: '1分钟',
  300: '5分钟',
  900: '15分钟'
}

const ruleObj = {
  'no-change': '不对该域名记录做任何修改（不切换）',
  'smart-stop': '停止解析该域名记录（智能暂停）',
  'smart-change': '切换到其他可用IP（智能切换）',
  'self-define': '切换到您设置的备用IP（自定义切换）'
}

export default {
  components: {
    TaskPopover,
    RuleDialog
  },
  data() {
    return {
      taskId: this.$route.query.id,
      taskResultLabel,
      taskResult: {
        taskId: '',
        url: '',
        monitorType: '',
        httpPort: '',
        frequency: '',
        timeoutThreshold: '',
        rule: '',
        // 监控状态
        status: -1,
        top: '',
        domain: ''
      },
      LineChartOption,
      TimeLineChartOption,
      loading: false,
      query: {
        time: '6h',
        name: '',
        isp: 'all',
        type: '全部',
        record: '错误'
      },

      // 用于监控设置回显
      ruleEntity: {},

      allMainList: [],
      defineConf: {},
      salveData: {}
    }
  },
  computed: {
    // 表格数据
    tableData() {
      const arr = []
      this.allMainList.forEach((item) => {
        // 响应时间
        const salveItem = this.salveData[item.id + ''] || {}
        const children = this.defineConf[item.id] || []
        arr.push({
          ...item,
          // 监测时间
          publish: salveItem.publish,
          // 主用响应时间
          time: salveItem.mainTime,
          children: children.map((rdata, idx) => {
            return {
              rdata,
              publish: salveItem.publish,
              time: (salveItem.backupTime || [])[idx]
            }
          })
        })
      })
      console.log('arr', arr)
      return arr
    }
  },
  created() {
    this.getDetail()
  },
  mounted() {},
  methods: {
    // 获取详情数据
    async getDetail() {
      this.loading = true
      try {
        const { data: res } = await getCallbackInfo({
          taskId: this.taskId
        })
        if (res.code !== 1) return
        // 监控详情
        const monitor = res.monitor || {}
        // 响应时间
        const slaveData = res.data || []

        const ruleEntity = monitor.ruleEntity || {}
        this.ruleEntity = ruleEntity

        const {
          monitorType,
          taskId,
          httpPort,
          tcpUdpPorts,
          httpServerName,
          httpPath,
          frequency,
          timeoutThreshold,
          status
        } = monitor

        this.taskResult.taskId = taskId
        this.taskResult.monitorType = typeList[monitorType] || '-'
        this.taskResult.url =
          monitorType == 1 || monitorType == 2
            ? `${httpServerName}${httpPath}`
            : '-'
        this.taskResult.httpPort = [1, 2].includes(monitorType)
          ? httpPort
          : [3, 4].includes(monitorType)
          ? tcpUdpPorts
          : '-'
        this.taskResult.frequency = rateObj[frequency] || '-'
        this.taskResult.timeoutThreshold = timeoutThreshold + 'ms'
        this.taskResult.rule = ruleObj[ruleEntity.taskMode]
        this.taskResult.status = status
        this.taskResult.top = ruleEntity.top
        this.taskResult.domain = ruleEntity.domain

        // 表格数据
        this.buildTableData(ruleEntity)
        // 监测时间数据
        this.buildSlaveData(slaveData)

        this.$nextTick(() => {
          this.$refs.TaskPopoverRef.setDefaultData({
            taskId: this.taskResult.taskId,
            name: `${this.taskResult.top}.${this.taskResult.domain}`
          })
        })
      } finally {
        this.loading = false
      }
    },

    // 构造表格的基础数据
    buildTableData({ defaultList = [], otherList = [], defineConf = '' }) {
      // 所有的主IP
      this.allMainList = [...defaultList, ...otherList]

      // 所有的备IP
      const defineConfObj = JSON.parse(defineConf || '{}')

      const newDefineConf = {}
      this.allMainList.forEach((item) => {
        const childrenIps = defineConfObj[item.id]
        newDefineConf[item.id] = childrenIps ? childrenIps.split(',') : []
      })

      this.defineConf = {}
      this.defineConf = Object.assign({}, this.defineConf, newDefineConf)
    },

    // 构造响应时间对象
    buildSlaveData(data = []) {
      const obj = {}
      data.forEach((item) => {
        // 表格每一项所对应的ID
        const { taskId = '', publish } = item
        if (!taskId) return
        // 拆分 taskId   13_self-define_860
        const taskIdArr = taskId.split('_')
        const newTaskId = taskIdArr[taskIdArr.length - 1]

        const slaveQueryTime = item.slaveQueryTime || []

        obj[newTaskId] = {
          // 监测时间
          publish,
          // 响应时间，第一项为主的时间，后面一次为备的时间
          mainTime: slaveQueryTime[0],
          backupTime: slaveQueryTime.slice(1) || []
        }
      })
      this.salveData = {}
      this.salveData = Object.assign({}, this.salveData, obj)
    },

    // 查询
    changeTask(taskData = {}) {
      this.taskId = taskData.id
      this.$router.replace({ query: { id: this.taskId } })
      this.getDetail()
    },

    toRules() {
      this.$refs.RuleDialogRef.show(this.ruleEntity)
    }
  }
}
</script>

<style lang="scss" scoped></style>
