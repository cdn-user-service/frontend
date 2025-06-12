<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '业务分组'"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >
      <ants-form-item label="选择DNS" prop="dnsConfigId">
        <ants-select
          v-model="form.dnsConfigId"
          placeholder="请选择DNS"
          style="width: 100%"
        >
          <ants-option
            v-for="item in dnsList"
            :key="item.id"
            :label="item.remark"
            :value="item.id"
          >
            <div class="flex items-center justify-between">
              <span>{{ item.remark }}</span>
              <el-tag size="mini" type="primary">{{ item.source }}</el-tag>
            </div>
          </ants-option>
        </ants-select>
      </ants-form-item>

      <ants-form-item label="分组名称" prop="name">
        <ants-input v-model="form.name" placeholder="请输入分组名称" />
      </ants-form-item>

      <ants-form-item label="节点分组" prop="areaId">
        <ants-select
          v-model="form.areaId"
          placeholder="请选择节点分组"
          filterable
        >
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ants-select>
      </ants-form-item>

      <!-- 修改才有 -->
      <ants-form-item label="HASH值" prop="hash" v-if="form.id">
        <ants-input
          maxlength="20"
          v-model.trim="form.hash"
          placeholder="请输入HASH值"
        />
        <div class="text-ants-text-4 text-sm -mb-df">
          6 ~ 20 位字母和数字
          <span
            class="underline text-primary cursor-pointer pl-sm"
            @click="createHash()"
          >
            <i class="el-icon-document-checked" />
            随机生成
          </span>
        </div>
      </ants-form-item>

      <ants-form-item label="排序" prop="weight">
        <ants-input-number
          v-model="form.weight"
          :min="0"
          :max="999"
          :precision="0"
          placeholder="排序"
        />
        <span class="text-ants-text-4 text-sm ml-xs"> 越大越靠前 </span>
      </ants-form-item>

      <ants-form-item
        label="调度方式"
        prop="recordMode"
        style="margin-top: 10px"
      >
        <ants-radio-group size="small" v-model="form.recordMode">
          <ants-radio :label="0" text="CDN系统调度" />
          <ants-radio :label="1" text="GTM调度(DNS系统)" />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item
        label="记录值"
        prop="rdata"
        style="margin-top: 10px"
        v-if="form.recordMode == 1"
      >
        <ants-input v-model="form.rdata" placeholder="请输入记录值" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// api
import { doCreateUpdateGroup } from '@/v2/cdn_admin/api/cdn/node'
import { getDnsApiAll } from '@/v2/cdn_admin/api/cdn/dns'

const defaultForm = {
  // 创建时 id = 0
  id: 0,
  // dns配置ID
  dnsConfigId: '',
  name: '',
  hash: '',
  // 节点分组id
  areaId: '',
  weight: 999,
  // 调度方式: 0 = CDN系统调度， 1 = DNS系统 GTM调度
  recordMode: 0,
  // 记录值
  rdata: ''
}

export default {
  props: {
    // 节点分组列表
    groupList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      dnsList: [],
      form: {
        ...defaultForm
      },
      formRules: {
        dnsConfigId: [
          {
            required: true,
            message: '请选择DNS类型',
            trigger: 'change'
          }
        ],
        name: [
          {
            required: true,
            message: '请输入分组名称',
            trigger: ['change', 'blur']
          }
        ],
        areaId: [
          {
            required: true,
            message: '请选择节点分组',
            trigger: 'change'
          }
        ],
        weight: [
          {
            required: true,
            message: '请输入排序',
            trigger: ['change', 'blur']
          }
        ],
        hash: [
          {
            required: true,
            message: '请输入HASH值',
            trigger: ['change', 'blur']
          },
          {
            validator: (rule, value, callback) => {
              const reg = /^[a-zA-Z0-9]{6,20}$/
              if (reg.test(value)) return callback()
              callback(new Error('6 ~ 20 位字母和数字'))
            },
            trigger: 'blur'
          }
        ],
        recordMode: [
          {
            required: true,
            message: '请选择调度方式',
            trigger: ['change', 'blur']
          }
        ],
        rdata: [
          {
            required: true,
            message: '请输入记录值',
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

    showDialog(row) {
      this.getDnsApiAllData()
      this.dialogVisible = true
      this.title = '添加'
      if (row.id) {
        this.title = '修改'
      }
      this.form = {
        ...defaultForm,
        ...row,
        recordMode: row.recordMode || 0
      }
    },

    /**
     * @description: 获取DNS设置数据
     */

    async getDnsApiAllData() {
      this.$refs.dialogRef.bodyLoading = true
      const { data: res } = await getDnsApiAll()
      this.$refs.dialogRef.bodyLoading = false
      if (res.code !== 1) return
      this.dnsList = res.data.data || []
    },

    /**
     * @description: 添加业务分组 提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        try {
          const { id, hash } = this.form
          const { data } = await doCreateUpdateGroup({
            ...this.form,
            hash: id ? hash : null
          })
          if (data.code !== 1) return
          this.dialogVisible = false
          this.$emit('refresh')
          this.$msg.success('保存成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 添加DNS表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    },

    // 随机生成hash值： 10 位数字和字母的组合
    createHash() {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
      let hash = ''
      for (let i = 0; i < 10; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      this.form.hash = hash
    }
  }
}
</script>
