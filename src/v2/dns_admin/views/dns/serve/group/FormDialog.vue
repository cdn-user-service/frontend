<template>
  <ants-dialog
    :title="`${dialogText}服务分组`"
    v-model="dialogVisible"
    width="800px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
    top="5vh"
    class="serve-group--dialog"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
      label-position="right"
      :inline="true"
    >
      <div class="p-df rounded-2xl bg-ants-bg-5 space-y-df">
        <TitleBorder title="基本信息" />

        <ants-form-item
          label="分组名称"
          prop="name"
        >
          <ants-input
            v-model="form.name"
            placeholder="请输入分组名称"
          />
        </ants-form-item>
        <ants-form-item
          label="备注信息"
          prop="remark"
          style="margin:0;"
        >
          <ants-input
            v-model="form.remark"
            placeholder="请输入备注信息"
          />
        </ants-form-item>

        <ants-form-item
          label="排序"
          prop="weight"
        >
          <ants-input-number
            v-model="form.weight"
            :step="1"
            :min="1"
            :precision="0"
            size="small"
            class="mr-sm"
          />
          <span class="text-sm text-ants-text-4">(越大越靠前)</span>
        </ants-form-item>
      </div>

      <!-- <div class="p-df rounded-2xl bg-ants-bg-5 space-y-df">
        <TitleBorder title="Prometheus" />
        <ants-form-item
          label="IP"
          prop="prometheusIp"
        >
          <ants-input
            v-model="form.prometheusIp"
            placeholder="请输入PrometheusIp"
          />
        </ants-form-item>
        <ants-form-item
          label="PORT"
          prop="prometheusPort"
        >
          <ants-input
            v-model="form.prometheusPort"
            placeholder="请输入PrometheusPort"
          />
        </ants-form-item>
      </div> -->

      <div class="p-df rounded-2xl bg-ants-bg-5 space-y-df">
        <TitleBorder title="SOA属性" />
        <ants-form-item
          label="MNAME"
          :rules="formRules.mname"
        >
          <ants-input
            v-model="form.extraSoaJson.mname"
            placeholder="请输入MNAME"
          />
        </ants-form-item>

        <ants-form-item
          label="RNAME"
          :rules="formRules.rname"
        >
          <ants-input
            v-model="form.extraSoaJson.rname"
            placeholder="请输入RNAME"
          />
        </ants-form-item>
      </div>

      <div class="p-df rounded-2xl bg-ants-bg-5 space-y-df">
        <TitleBorder title="NS属性" />
        <ants-form-item
          :label="`NS${idx + 1}`"
          v-for="(item, idx) in nsArr"
          :key="idx"
          :rules="formRules.ns"
          class="relative"
        >
          <ants-input
            v-model="form.extraNsJson[`ns${idx + 1}`]"
            :placeholder="`请输入${`NS${idx + 1}`}`"
          />

          <el-button
            size="mini"
            icon="el-icon-delete"
            type="danger"
            plain
            circle
            class="absolute"
            v-if="idx > 1"
            style="right: -35px;top:4px;"
            @click="doDeleteNs(idx)"
          />
        </ants-form-item>

        <div class="text-center">
          <ants-button
            type="primary"
            plain
            size="mini"
            @click="doAddNs"
            icon="el-icon-plus"
            v-if="nsArr.length < 6"
          >添加NS属性</ants-button>
        </div>
      </div>

    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doUpdateServerGroup } from '@/v2/dns_admin/api/dns/serve'
const defaultForm = {
  id: null,
  // 分组名称
  name: '',
  // 排序
  weight: '',
  // 桩体
  status: 1,
  // 备注信息
  remark: '',
  isDelete: 0,

  // 后面加的数据
  // ELK SERVER
  elasticsearchServerIp: null,
  elasticsearchServerPort: null,
  elasticsearchServerAuth: null,

  // Prometheus
  prometheusIp: null,
  prometheusPort: null,

  // SOA属性，传递JSON数据
  extraSoaJson: {
    mname: '', // 域名格式
    rname: '' // 域名格式
  },

  // NS属性，传递JSON数据
  extraNsJson: {
    ns1: '', // 域名格式
    ns2: '' // 域名格式
  }
}
export default {
  data() {
    return {
      // 添加修改分组数据
      dialogText: '添加',
      dialogVisible: false,

      form: {
        ...defaultForm
      },
      nsArr: ['ns1', 'ns2'],

      formRules: {
        // 添加用户对话框的规则
        name: [
          {
            required: true,
            message: '请输入分组名称',
            trigger: ['change', 'blur']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ],
        weight: [
          {
            required: true,
            message: '请输入权重',
            trigger: ['change', 'blur']
          }
        ],

        elasticsearchServerIp: [
          {
            required: true,
            message: '请输入ElkServerIp',
            trigger: ['blur', 'change']
          }
        ],
        elasticsearchServerPort: [
          {
            required: true,
            message: '请输入ElkServerPort',
            trigger: ['blur', 'change']
          }
        ],
        elasticsearchServerAuth: [
          {
            required: true,
            message: '请输入ElkServerAuth',
            trigger: ['blur', 'change']
          }
        ],

        prometheusIp: [
          {
            required: true,
            message: 'PrometheusIp不能为空',
            trigger: ['blur', 'change']
          }
        ],
        prometheusPort: [
          {
            required: true,
            message: 'PrometheusPort不能为空',
            trigger: ['blur', 'change']
          }
        ],

        mname: [
          {
            required: true,
            message: 'MNAME属性不能为空',
            trigger: ['blur', 'change']
          }
        ],
        rname: [
          {
            required: true,
            message: 'RNAME属性不能为空',
            trigger: ['blur', 'change']
          }
        ],

        ns: [
          {
            required: true,
            message: 'NS属性不能为空',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  computed: {
    // ns长度
    nsLength() {
      return Object.keys(this.form.extraNsJson).length
    }
  },
  methods: {
    /**
     * @description: 点击添加，编辑
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.dialogText = '添加'

      // 添加
      if (row.id) {
        this.dialogText = '编辑'

        // 解构数据
        const { extraNsJson = '', extraSoaJson = '' } = row

        let extraNsObj = {
          ...this.form.extraNsJson
        }

        if (extraNsJson) {
          extraNsObj = JSON.parse(extraNsJson)
          this.nsArr = Object.keys(extraNsObj)
        }

        this.form = {
          ...row,
          extraNsJson: extraNsObj,
          extraSoaJson: extraSoaJson
            ? JSON.parse(extraSoaJson)
            : this.form.extraSoaJson
        }
      }

      console.log('form', this.form, this.nsArr)
    },

    /**
     * @description: 添加编辑参数提交
     */

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const postForm = {
            ...this.form
          }
          postForm.extraNsJson = JSON.stringify(postForm.extraNsJson)
          postForm.extraSoaJson = JSON.stringify(postForm.extraSoaJson)
          const { data: res } = await doUpdateServerGroup(postForm)

          this.$refs.dialogRef.btnLoading = false
          if (res.code !== 1) return
          this.$parent.getTableData()
          this.$msg.success('操作成功')
          this.dialogVisible = false
        } catch (error) {
          this.$refs.dialogRef.btnLoading = false
          console.log(error)
        }
      })
    },

    // 追加一行NS属性
    doAddNs() {
      // extraNsJson追加属性 ns3,ns4,ns6
      const nsLength = this.nsArr.length
      if (nsLength >= 6) return this.$msg.warning('最多添加6个NS属性')
      this.nsArr.push(`ns${nsLength + 1}`)
      this.$set(this.form.extraNsJson, `ns${nsLength + 1}`, '')
      console.log(this.form.extraNsJson)
    },

    // 删除一行NS属性
    doDeleteNs(delIdx) {
      this.nsArr.splice(delIdx, 1)
      const newNsArr = []
      const newNsObj = {}
      this.nsArr.forEach((item, idx) => {
        newNsArr.push(`ns${idx + 1}`)
        newNsObj[`ns${idx + 1}`] = this.form.extraNsJson[item]
      })
      this.nsArr = [...newNsArr]
      this.form.extraNsJson = { ...newNsObj }
      console.log(this.form.extraNsJson, this.nsArr)
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.nsArr = ['ns1', 'ns2']
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

<style lang="scss">
.serve-group--dialog {
  .ants-form.el-form--inline {
    .el-form-item {
      margin-right: 50px;
    }
    .el-input {
      width: 220px;
    }
    .el-input-number {
      .el-input {
        width: 130px;
      }
    }
  }
}
</style>
