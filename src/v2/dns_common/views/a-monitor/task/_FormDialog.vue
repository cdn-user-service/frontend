<template>
  <ants-dialog
    title="添加监控任务"
    v-model="dialogVisible"
    width="800px"
    ref="dialogRef"
    @closed="closed"
    @submit="submitForm"
    top="10vh"
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
        <ants-form
          style="max-width:500px;margin:0 auto;"
          :model="form0"
          :rules="formRules"
          ref="formRef0"
          label-width="90px"
        >
          <div class="ants-tips_box mb-lg">
            <span class="el-icon-info"></span>
            只显示包含 A 或 CNAME 记录的域名
          </div>
          <ants-form-item
            label="选择域名"
            prop="domain"
          >
            <ants-select
              placeholder="请选择域名"
              v-model="form0.domain"
              style="width:400px;"
            >
              <ants-option
                v-for="item in domainList"
                :key="item.id"
                :label="item.domain"
                :value="item.id"
              />
            </ants-select>
          </ants-form-item>
          <ants-form-item
            label="子域名"
            prop="subdomain"
          >
            <ants-select
              placeholder="请选择子域名"
              v-model="form0.subdomain"
              style="width:400px;"
            >
              <ants-option
                v-for="item in subdomainList"
                :key="item.id"
                :label="item.domain"
                :value="item.id"
              />
            </ants-select>
          </ants-form-item>
        </ants-form>
      </li>

      <li v-show="currentStep === 1">
        <div>
          <TitleBorder>
            子域名：<strong>www.subdomain.com</strong>
          </TitleBorder>

          <el-table
            :data="recordTableData"
            border
            size="mini"
            row-key="id"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              align="center"
              width="50"
            />
            <ants-table-column
              width="150"
              label="主机记录"
              prop="name"
            >
              www
            </ants-table-column>
            <ants-table-column
              width="150"
              label="记录类型"
              prop="type"
            >
              A
            </ants-table-column>
            <ants-table-column
              width="150"
              label="线路类型"
              prop="line"
            >
              默认
            </ants-table-column>
            <ants-table-column
              min-width="150"
              label="记录值"
              prop="value"
            >
              12.23.6.23
            </ants-table-column>
          </el-table>
        </div>
      </li>

      <li v-show="currentStep === 2">
        <ants-form
          style="max-width:600px;margin:0 auto;"
          :model="form2"
          :rules="formRules"
          ref="formRef1"
          label-width="90px"
        >
          <el-divider content-position="left">
            <strong class="text-primary">基本设置</strong>
          </el-divider>
          <ants-form-item
            label="任务类型"
            prop="type"
          >
            <el-radio-group
              v-model="form2.type"
              size="small"
            >
              <el-radio-button
                v-for="(item, key) in typeList"
                :key="key"
                :label="key"
              >{{ item }}</el-radio-button>
            </el-radio-group>
          </ants-form-item>

          <ants-form-item
            label="任务名称"
            prop="name"
          >
            <ants-input
              v-model="form2.name"
              placeholder="请输入任务名称"
              maxlength="30"
              show-word-limit
            />
          </ants-form-item>

          <!-- <ants-form-item
            label="监控地址"
            prop="url"
          >
            <ants-input
              v-model="form2.url"
              placeholder="请输入监控地址"
            />
          </ants-form-item> -->
          <ants-form-item
            label="监控端口"
            prop="port"
          >
            <ants-input
              v-model="form2.port"
              placeholder="请输入监控端口"
            />
          </ants-form-item>
          <ants-form-item
            label="监控频率"
            prop="rate"
          >
            <el-radio-group v-model="form2.rate">
              <el-radio
                v-for="(item, key) in rateObj"
                :key="key"
                :label="+key"
              >{{ item }}</el-radio>
            </el-radio-group>
          </ants-form-item>

          <el-divider content-position="left">
            <strong class="text-primary">切换规则</strong>
          </el-divider>
          <ants-form-item>
            <div class="font-semibold">当域名记录无法访问时：</div>
            <el-radio-group v-model="form2.rule">
              <el-radio
                class="block my-xs"
                v-for="(item, key) in ruleList"
                :key="key"
                :label="+key"
              >{{ item }}</el-radio>
            </el-radio-group>
            <div class="font-semibold">TTL设置</div>
            <el-checkbox
              v-model="form2.ttl"
              :true-label="1"
              :false-label="0"
            >启用D监控后不修改当前TTL设置</el-checkbox>
          </ants-form-item>

          <el-divider content-position="left">
            <strong class="text-primary">通知设置</strong>
          </el-divider>
          <ants-form-item>
            <el-checkbox-group v-model="form2.noticeStatus">
              <el-checkbox :label="1">邮件通知</el-checkbox>
              <el-checkbox :label="2">短信通知</el-checkbox>
            </el-checkbox-group>
          </ants-form-item>
        </ants-form>
      </li>
    </ul>

    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        @click="dialogVisible = false"
        icon="el-icon-close"
        text="取消"
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
        @click="doSave()"
        v-if="currentStep == 2"
        text="保 存"
      />
    </template>
  </ants-dialog>
</template>

<script>
// API
import { getUserList } from '@/v2/dns_admin/api/account/user'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doCreateTask,
  doUpdateTask,
  doDelTask
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const defaultForm = {
  id: 0,
  // 任务类型
  type: 'http',
  // 任务名称
  name: '',
  // 监控地址
  url: '',
  // 监控频率
  rate: 15
}

const defaultForm0 = {
  domain: '',
  subdomain: ''
}

const defaultForm1 = {
  rdataId: []
}

const typeList = {
  http: 'HTTP(s)',
  ping: 'PING',
  tcp: 'TCP',
  udp: 'UDP',
  dns: 'DNS'
}

const rateObj = {
  //   0.15: '15秒',
  1: '1分钟',
  5: '5分钟',
  15: '15分钟',
  30: '30分钟',
  60: '60分钟'
}

const ruleList = {
  0: '不对该域名记录做任何修改（不切换）',
  1: '停止解析该域名记录（智能暂停）',
  2: '切换到您设置的备用IP（自定义切换）',
  3: '切换到其他可用IP（智能切换，可能会出现跨运营商切换，谨慎选择）'
}
const defaultForm2 = {
  id: 0,
  // 任务类型
  type: 'http',
  // 任务名称
  name: '',
  // 监控地址
  url: '',
  // 监控频率
  rate: 15,
  // 端口
  port: 80,
  rule: 0,
  ttl: 1,
  // 通知设置
  noticeStatus: [1]
}

export default {
  data() {
    const isIp = (rule, value, callback) => {
      // const regIpv61 = /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/
      const regIpv6 = /^[\da-fA-F:.]{1,39}$/
      const regIpv4 =
        /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){0,3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/

      if (regIpv4.test(value) || regIpv6.test(value)) {
        return callback()
      }
      callback(new Error('网段格式错误'))
    }

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',

      dialogVisible: false,
      loading: false,

      currentStep: 0,
      form0: {
        ...defaultForm0
      },
      domainList: [],
      subdomainList: [],

      form1: {
        ...defaultForm1
      },

      recordTableData: [
        {
          id: 1
        }
      ],

      typeList,
      rateObj,
      ruleList,
      form2: {
        ...defaultForm2
      },
      form: {
        ...defaultForm
      },

      formRules: {
        groupName: [
          {
            required: true,
            message: '请输入网段',
            trigger: ['change', 'blur']
          },
          {
            validator: isIp,
            trigger: 'blur'
          }
        ],
        planId: [
          {
            required: true,
            message: '请选择套餐',
            trigger: 'change'
          }
        ],
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ]
      },

      userList: [],
      planList: []
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
    /**
     * @description: 点击添加，编辑
     */

    show(row = {}) {
      this.dialogVisible = true
    },

    // 点击下一步
    toNext() {
      if (this.currentStep >= 2) return
      this.currentStep++
    },

    // 点击上一步
    toPrev() {
      if (this.currentStep <= 0) return
      this.currentStep--
    },

    doSave() {},

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
    },

    //
    // 勾选操作
    handleSelectionChange(val) {
      this.selectArr = val || []
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        // if (!valid) return
        // this.$refs.dialogRef.btnLoading = true
        // const { data: res } = await doCreateTask(this.form)
        // this.$refs.dialogRef.btnLoading = false
        // if (res.code !== 1) return
        // this.$parent.getTableData()
        // this.$msg.success('添加成功')
        // this.dialogVisible = false
      })
    },

    // 表单重置
    closed() {
      this.currentStep = 0

      //   this.form = {
      //     ...defaultForm
      //   }
      //   this.$refs.formRef.resetFields()
    }
  }
}
</script>
