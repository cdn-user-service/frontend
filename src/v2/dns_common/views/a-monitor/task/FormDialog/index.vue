<template>
  <ants-dialog
    title="添加监控任务"
    v-model="dialogVisible"
    width="800px"
    ref="dialogRef"
    @closed="closed"
    top="5vh"
  >
    <ul class="step-box flex items-center">
      <li
        v-for="(item, idx) in ['选择域名', '选择记录', '监控设置']"
        :key="idx"
        class="flex-1 flex items-center text-ants-text-1 justify-center relative"
      >
        <div class="flex items-center relative bg-ants-bg-1 z-10 px-df">
          <span
            class="inline-block rounded-full text-center text-3xl"
            :class="stepClass(idx)"
            style="height:40px;line-height:40px;width:40px;"
          >
            <i
              v-if="currentStep > idx"
              class="el-icon-check"
            ></i>
            <span v-else>{{ idx + 1 }}</span>
          </span>
          <div class="pl-df font-semibold text-2xl">
            {{ item }}
          </div>
        </div>

        <span
          v-if="idx < 2"
          class="absolute border-t-4 border-ants-border-2 border-dashed w-full"
          style="left:50%;"
        ></span>
      </li>
    </ul>

    <ul
      style="min-height:300px;"
      class="pt-xl"
    >
      <li v-show="currentStep === 0">
        <Step1 ref="Step1Ref" />
      </li>

      <li v-show="currentStep === 1">
        <Step2
          ref="Step2Ref"
          :pForm="form"
        />
      </li>

      <li v-show="currentStep === 2">
        <Step3
          ref="Step3Ref"
          :pForm="form"
        />
      </li>
    </ul>

    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        @click="dialogVisible = false"
        icon="el-icon-close"
        text="取 消"
      />
      <ants-button
        size="small"
        type="primary"
        icon="el-icon-arrow-left"
        @click="toPrev()"
        v-if="currentStep > 0"
        text="上一步"
      />
      <ants-button
        size="small"
        type="primary"
        @click="toNext()"
        v-if="currentStep < 2"
        text="下一步"
      >
        <i class="el-icon-arrow-right ml-xs"></i>
      </ants-button>
      <ants-button
        size="small"
        type="primary"
        icon="el-icon-check"
        :loading="btnLoading"
        @click="doSave()"
        v-if="currentStep == 2"
        text="保 存"
      />
    </template>
  </ants-dialog>
</template>

<script>
// 组件
import Step1 from './Step-1.vue'
import Step2 from './Step-2.vue'
import Step3 from './Step-3.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doCreateTask,

  getPollList,
  doCreatePoll
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const defaultForm = {
  // 选择的域名
  domain: '',
  domainId: null,
  // 记录ID
  rdataIds: null,
  id: 0,
  status: 0,

  // 任务类型 http, https, ping, dns
  type: 'http',
  // 协议 TCP = 1, UDP = 2, TCP + UDP = 3
  protocol: 1,
  // 任务名称
  name: '',
  // 监控端口
  port: 80,
  // 监控频率
  rate: 15,
  // 监控规则
  rule: 1,
  ttl: 1,
  // 通知设置： 1 = mail，2 = mobile，mail + mobile = 3
  noticeStatus: 0,
  // 通知邮箱
  mail: '',
  // 通知手机号
  mobile: '',

  // 监控地址
  server_name: '',
  // 路径
  path: '',
  // 请求方法
  method: 'GET',

  // 任务类型为 TCP 或者 UDP时 需要
  ports: ''
}

export default {
  components: {
    Step1,
    Step2,
    Step3
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,
      loading: false,
      btnLoading: false,

      currentStep: 0,

      form: {
        ...defaultForm
      },

      // 选中记录的记录值
      rdata: ''
    }
  },
  computed: {
    stepClass() {
      return (step) => {
        const classObj = {
          default: 'bg-ants-bg-5 text-ants-text-1',
          current: 'bg-primary text-white',
          done: 'bg-primary-light text-primary'
        }
        if (this.currentStep === step) {
          return classObj.current
        } else if (this.currentStep > step) {
          return classObj.done
        } else {
          return classObj.default
        }
      }
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
    },

    // 点击下一步
    toNext() {
      // 第一步
      if (this.currentStep === 0) {
        this.$refs.Step1Ref.submit((data) => {
          console.log(data)
          if (!data) return
          this.form.domain = data.domain
          this.form.domainId = data.domainId
          this.currentStep++
          // 获取第二步的表格数据
          this.$refs.Step2Ref.getTableData()
        })
        return
      }

      // 第二步
      if (this.currentStep === 1) {
        this.$refs.Step2Ref.submit((data = {}) => {
          console.log(data)
          if (!data.id) return
          this.form.rdataIds = data.id
          this.rdata = data.value
          this.currentStep++

          // 第三步 sever_name 表单赋值
          this.$refs.Step3Ref.init({
            server_name: data.top + '.' + this.form.domain
          })
        })
      }
    },

    // 点击上一步
    toPrev() {
      if (this.currentStep <= 0) return
      this.currentStep--
    },

    // 保存
    doSave() {
      this.$refs.Step3Ref.submit(async (data) => {
        console.log(data)
        if (!data) return
        this.form = {
          ...this.form,
          ...data
        }

        // 发起请求
        this.btnLoading = true
        try {
          const { data: res } = await doCreateTask({
            ...this.form,
            portScanParamVo: {
              ports: this.form.ports
            },
            httpParamVo: {
              server_name: this.form.server_name,
              path: this.form.path,
              method: this.form.method
            }
          })
          this.btnLoading = false
          if (res.code !== 1) return
          // 检查是否需要创建一条轮询任务
          this.checkHasPollingList()
        } catch (error) {
          this.btnLoading = false
          throw error
        }
      })
    },

    // 创建监控任务时，检查是否有轮询列表，若没有则默认创建一条
    async checkHasPollingList() {
      this.btnLoading = true
      try {
        const { data: res } = await getPollList({
          rdataId: this.form.rdataIds,
          limit: 1,
          page: 1
        })
        if (res.code !== 1) {
          this.btnLoading = false
          return
        }
        const obj = res.data || {}
        // 如果没有轮询列表，则创建一条
        if (!obj.totalCount) {
          try {
            const { data: res2 } = await doCreatePoll({
              rdataId: this.form.rdataIds,
              ipTtlList: [this.rdata],
              ttl: 60,
              remark: '默认'
            })
            this.btnLoading = false
            if (res2.code !== 1) return
            this.afterSave()
          } catch (error) {
            this.btnLoading = false
            throw error
          }
        } else {
          this.afterSave()
        }
      } catch (error) {
        this.btnLoading = false
        throw error
      }
    },

    // 保存成功后
    afterSave() {
      this.$msg.success('添加成功')
      this.dialogVisible = false
      this.$emit('refresh')
    },

    // 表单重置
    closed() {
      this.currentStep = 0
      this.form = {
        ...defaultForm
      }
      this.$refs.Step1Ref && this.$refs.Step1Ref.resetForm()
      this.$refs.Step2Ref && this.$refs.Step2Ref.resetForm()
      this.$refs.Step3Ref && this.$refs.Step3Ref.resetForm()
    }
  }
}
</script>
