<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '精准规则'"
    width="1000px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
    destroy-on-close
  >
    <!-- FOCS:: 必须加上 destroy-on-close="true" 关闭时销毁内部组件，不然会造成组件数据覆盖 -->

    <ul class="ants-tips_box space-y-3 mb-lg -mt-df">
      <li>
        1、同一条规则中多个匹配条件为 “与”
        逻辑，即必须多个条件同时满足才算匹配中规则；
      </li>
      <li>
        2、匹配目标具有多个时，用 “|” 隔开；
      </li>
      <li>
        3、同一条规则最多 6个 匹配条件组合；
      </li>
      <li>
        4、涉及字符串匹配时，字符串不区分大小写。
      </li>
    </ul>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="left"
      label-width="80px"
      :status-icon="false"
      hide-required-asterisk
    >
      <!-- <ants-form-item prop="mode" label="选择行为">
        <ants-radio-group size="small" v-model="form.mode">
          <ants-radio-button
            v-for="item in modeArr"
            :key="item.label"
            :label="item.label"
            :text="item.text"
          />
        </ants-radio-group>
      </ants-form-item> -->

      <ants-form-item prop="remark" label="备注信息">
        <ants-input v-model="form.remark" placeholder="请输入备注信息" />
      </ants-form-item>

      <ants-form-item label="匹配规则">
        <WafRuleTable ref="WafRuleTableRef" />
      </ants-form-item>

      <ants-form-item label="处置方式">
        <HandleMode ref="HandleModeRef" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import WafRuleTable from '@/v2/cdn_common/components/WafRule'
import HandleMode from '@/v2/cdn_common/components/WafRule/HandleMode'

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 行为
  // mode: 'pass',
  // 匹配规则，一行一个
  rule: '',
  // 备注信息
  remark: ''
}

// 行为数组
const modeArr = [
  {
    label: 'pass',
    text: '放行'
  },
  {
    label: 'forbid',
    text: '封禁'
  },
  {
    label: 'suspicious',
    text: '可疑'
  }
]

export default {
  components: {
    WafRuleTable,
    HandleMode
  },
  data() {
    return {
      // 父ID
      parentId: this.$route.query.id,

      title: '添加',
      dialogVisible: false,
      modeArr,

      form: {
        ...defaultForm
      },

      formRules: {
        mode: [
          {
            required: true,
            message: '请选择行为',
            trigger: 'change'
          }
        ],
        rule: [
          {
            required: true,
            message: '请输入匹配内容，一行一个',
            trigger: ['change', 'blur']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = row.id ? '修改' : '添加'

      this.form = {
        ...defaultForm,
        ...row
      }

      let arr = [
        {
          type: '',
          handle: '',
          content: ''
        }
      ]

      // 匹配规则
      if (row.rule) {
        arr = []
        row.rule.forEach(item => {
          const { type, handle, content } = item
          arr.push({
            type,
            handle,
            content
          })
        })
      }

      this.$nextTick(() => {
        // 处置方式
        if (row.waf_op) {
          this.$refs.HandleModeRef.handle = row.waf_op.handle
          this.$refs.HandleModeRef.activeKey = row.waf_op.key
          this.$refs.HandleModeRef.activeParam = row.waf_op.param
        }

        this.$refs.WafRuleTableRef.tableForm.tableData = arr
      })
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        // 验证匹配规则表格表单规则
        const ruleArr = this.$refs.WafRuleTableRef.submitTabelForm()
        console.log(ruleArr)
        if (!ruleArr) return

        // 处置方式
        const handleObj = this.$refs.HandleModeRef.submitForm()
        if (!handleObj) return

        this.$refs.dialogRef.btnLoading = true
        const { id, mode, remark } = this.form

        const res = await this.$listeners.saveSiteAttr({
          pri_precise_waf_details: [
            {
              ...this.form,
              // 匹配规则
              rule: ruleArr,
              // 处置方式
              waf_op: handleObj
            }
          ]
        })

        this.$refs.dialogRef.btnLoading = false

        if (!res) return
        this.dialogVisible = false
        this.$listeners.refreshData()
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
