<template>
  <ants-dialog
    title="批量解析格式生成工具"
    width="650px"
    v-model="dialogVisible"
    ref="dialogRef"
    top="10vh"
    @closed="resetForm"
    @submit="submit"
    submit-btn-text="生 成"
  >
    <div class="ants-tips_box mb-lg -mt-sm">
      <span class="el-icon-info"></span>
      快速帮您把您要批量解析的域名格式生成好，方便您进行二次编辑，大大节省了您的操作时间。
    </div>
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      class="-mb-df"
      :status-icon="false"
      space-class="space-y-6"
    >
      <!-- <ants-form-item label="导入分组域名" prop="group">
        <ants-select placeholder="请选择分组域名" v-model="form.group">
          <ants-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ants-select>
      </ants-form-item> -->
      <ants-form-item
        label="域名列表"
        prop="domains"
      >
        <div class="relative">
          <ants-input
            type="textarea"
            rows="8"
            placeholder="输入一级域名，每行一个。例如：
  domain1.com
  domain2.com"
            v-model="form.domains"
          />
          <span class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs">
            已输入(<span class="text-primary">{{ domainRows }}</span>)行
          </span>
        </div>
      </ants-form-item>
      <ants-form-item
        label="主机记录"
        prop="tops"
      >
        <ants-input
          placeholder="多个可用逗号“,” 分割，例如 www,@,wap"
          v-model="form.tops"
        />
      </ants-form-item>
      <ants-form-item
        label="记录类型"
        prop="type"
      >
        <TypeSelect
          v-model="form.type"
          ref="sortRef"
          size="medium"
          style="width:100%;"
        />
      </ants-form-item>
      <ants-form-item
        label="记录值"
        prop="value"
      >
        <ants-input
          :placeholder="valuePlaceholder[form.type]"
          v-model="form.value"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import TypeSelect from '../../domain-admin/record/TypeSelect.vue'

const defaultForm = {
  // 分组域名
  group: '',
  // 域名列表
  domains: '',
  // 主机记录
  tops: '',
  // 记录类型
  type: 'A',
  // 记录值
  value: ''
}

const formRules = {
  group: [
    {
      required: true,
      message: '请选择分组域名',
      trigger: 'change'
    }
  ],
  domains: [
    {
      required: true,
      message: '请输入域名列表',
      trigger: ['blur', 'change']
    }
  ],
  tops: [
    {
      required: true,
      message: '请输入主机记录',
      trigger: ['blur', 'change']
    }
  ],
  type: [
    {
      required: true,
      message: '请选择记录类型',
      trigger: 'change'
    }
  ],
  value: [
    {
      required: true,
      message: '请输入记录值',
      trigger: ['blur', 'change']
    }
  ]
}

const valuePlaceholder = {
  A: '将域名指向一个IPv4地址',
  CNAME: '将域名指向另一个域名',
  MX: '将域名指向邮件服务器地址',
  TXT: '文本长度限制255。通常做SPF记录（反垃圾邮件）',
  NS: '域名服务器记录，把子域名交给其他DNS服务商解析',
  AAAA: '将域名指向一个IPv6地址',
  SPF: '用于指定发送邮件的服务器（反垃圾邮件）',
  SRV: '记录哪台计算机提供了某项服务',
  CAA: '用于指定域名的证书颁发机构（CA）'
}

export default {
  components: {
    TypeSelect
  },
  data() {
    return {
      dialogVisible: false,
      groupList: [
        {
          name: '测试分组',
          id: 1
        }
      ],
      form: {
        ...defaultForm
      },
      formRules,
      valuePlaceholder
    }
  },
  computed: {
    // 已输入多少行域名
    domainRows() {
      if (this.form.domains === '') return 0
      return this.form.domains.trim().split(/[\r\n]+/).length
    }
  },
  methods: {
    // 打开弹窗
    show() {
      this.dialogVisible = true
    },

    /**
     * @description: 表单提交
     */

    submit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        // 构造HTML
        const { domains, tops, type, value } = this.form
        const domainArr = domains.trim().split(/[\r\n]+/g)
        const topArr = tops.split(',')

        const records = []
        domainArr.forEach((domain) => {
          topArr.forEach((top) => {
            if (top !== '') {
              records.push(`${domain}|${top}|${type}|${value}`)
            }
          })
        })

        this.$msg.success('生成成功')
        const win = window.open()
        win.document.write(records.join('<br>'))
        this.$refs.dialogRef.btnLoading = false
      })
    },

    // 添加分组表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
