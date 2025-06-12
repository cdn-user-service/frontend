<template>
  <div class="inline-block pl-lg">
    <ants-button
      type="primary"
      plain
      size="mini"
      text="添加监控"
      :disabled="$root.loading"
      icon="el-icon-plus"
      @click="show()"
    />

    <ants-dialog
      v-model="dialogVisible"
      width="500px"
      ref="dialogRef"
      @closed="closed"
      title="添加监控"
      @submit="doSave"
    >
      <div class="ants-tips_box mb-lg -mt-df">
        <span class="el-icon-info"></span>
        只显示 A 、AAAA 或 CNAME 记录的域名
      </div>

      <ants-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="110px"
        label-position="top"
        space-class="space-y-2"
        :status-icon="false"
      >
        <ants-form-item label="选择用户" prop="userId" v-if="isAdmin">
          <UsersPopover
            v-model="form.userId"
            ref="UsersPopoverRef"
            @change="changeUser"
            width="100%"
          />
        </ants-form-item>

        <ants-form-item label="选择域名" prop="domain">
          <ants-select
            v-model="form.domain"
            :loading="loading"
            placeholder="请选择域名"
          >
            <el-option
              v-for="item in domainList"
              :key="item.domain"
              :label="item.domain"
              :value="item.domain"
            />
          </ants-select>
        </ants-form-item>

        <ants-form-item label="选择子域名" prop="subDomain">
          <ants-select
            :loading="childLoading"
            v-model="form.subDomain"
            placeholder="请选择子域名"
            value-key="id"
          >
            <el-option
              v-for="item in recordList"
              :key="item.id"
              :label="`${item.top}.${item.domain}`"
              :value="{
                id: item.id,
                domain: item.domain,
                domainId: item.domainId,
                rdata: item.rdata,
                recordType: item.recordType,
                top: item.top,
                status: item.status
              }"
            />
          </ants-select>
        </ants-form-item>
      </ants-form>
    </ants-dialog>
  </div>
</template>

<script>
import UsersPopover from '@/v2/dns_admin/components/UsersPopover'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  getDomainOrRecordList,
  saveRule
} = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const defaultForm = {
  id: 0,
  domain: '',
  domainId: 0,
  recordCount: 0, // 不传
  recordType: '',
  status: 0,
  taskMode: 'no-change',
  userId: null,
  username: '',
  subDomain: null
}

export default {
  components: {
    UsersPopover
  },
  props: {},
  data() {
    const rules = {
      userId: [
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
      ],
      subDomain: [
        {
          required: true,
          message: '请选择子域名',
          trigger: 'blur'
        }
      ],
      taskMode: [
        {
          required: true,
          message: '请选择切换规则',
          trigger: 'change'
        }
      ]
    }

    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      dialogVisible: false,

      form: {
        ...defaultForm
      },
      rules,

      domainList: [],
      recordList: [],
      loading: false,
      childLoading: false
    }
  },
  watch: {
    // 监听用户选择改变
    'form.userId': function (newVal, oldVal) {
      this.domainList = []
      this.recordList = []
      this.form.domain = null
      this.form.subDomain = null
      if (!newVal) return
      this.getDomainList()
    },

    // 监听域名改变
    'form.domain': function (newVal, oldVal) {
      this.recordList = []
      this.form.subDomain = null
      if (!newVal) return
      this.getRecordList()
    }
  },
  created() {
    if (!this.isAdmin) {
      this.getDomainList()
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
    },

    // 选择用户
    changeUser(obj = {}) {
      console.log(obj)
      this.form.username = obj.username
      // 清除校验
      this.$refs.formRef.clearValidate('userId')
    },

    // 获取域名列表
    async getDomainList() {
      this.loading = true
      try {
        const { data: res } = await getDomainOrRecordList({
          limit: 200,
          page: 1,
          // 查询域名
          domain: '',
          // 0 = 查询域名列表 | 1 = 查询记录
          type: 0,
          // 后台需要传递用户ID
          userId: this.form.userId,
          username: ''
        })
        if (res.code !== 1) return
        const { list = [] } = res.data || {}
        this.domainList = list.map((item) => {
          return {
            domain: item.domain,
            status: item.status,
            id: item.id
          }
        })

        if (this.domainList.length) {
          this.form.domain = this.domainList[0].domain
        }
      } finally {
        this.loading = false
      }
    },

    // 获取记录列表
    async getRecordList() {
      const { domain } = this.form
      if (!domain) return
      this.childLoading = true
      try {
        const { data: res } = await getDomainOrRecordList({
          limit: 200,
          page: 1,
          // 查询域名
          domain,
          // 0 = 查询域名列表 | 1 = 查询记录
          type: 1,
          // 后台需要传递用户ID
          userId: this.form.userId,
          username: ''
        })
        if (res.code !== 1) return
        // 如果为查询记录列表，过滤掉 status != 1 的记录
        const arr = res.data || []
        this.recordList = arr.filter((item) => item.status == 1)

        if (this.recordList.length) {
          const item = this.recordList[0]
          this.form.subDomain = {
            id: item.id,
            domain: item.domain,
            domainId: item.domainId,
            rdata: item.rdata,
            recordType: item.recordType,
            top: item.top,
            status: item.status
          }
        }
      } finally {
        this.childLoading = false
      }
    },

    // 保存
    doSave() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { subDomain, taskMode, userId, username } = this.form
          console.log(this.form)
          const { data: res } = await saveRule({
            id: 0,
            domain: subDomain.domain,
            domainId: subDomain.domainId,
            top: subDomain.top,
            recordCount: 0, // 不传
            recordType: subDomain.recordType,
            status: subDomain.status,
            taskMode,
            userId,
            username
          })
          if (res.code !== 1) return
          this.$msg.success('保存成功')
          this.$emit('refresh')
          this.dialogVisible = false
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 表单重置
    closed() {
      this.form = {
        ...defaultForm
      }
      if (this.$refs.UsersPopoverRef) {
        this.$refs.UsersPopoverRef.reset()
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
