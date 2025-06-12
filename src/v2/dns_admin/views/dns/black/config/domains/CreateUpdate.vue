<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + '黑名单域名'"
    width="650px"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="90px"
    >
      <ants-form-item label="选择分类" prop="label" style="margin:0">
        <ants-radio-group v-model="form.label" size="small">
          <ants-radio
            v-for="item in labelList"
            :label="item"
            :text="item"
            :key="item"
            class="mb-sm"
          />
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item label="处理方式" prop="blMode" style="margin-top:10px">
        <ants-radio-group v-model="form.blMode" size="small">
          <ants-radio
            v-for="(item, key) in blModeObj"
            :label="+key"
            :text="item"
            :key="key"
          />
        </ants-radio-group>
      </ants-form-item>
      <ants-form-item
        prop="returnParam"
        v-if="form.blMode === 1"
        style="margin-top:10px"
      >
        <ants-input
          v-model="form.returnParam"
          placeholder="请输入指定CNAME"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="备注信息" prop="remark">
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
        ></ants-input>
      </ants-form-item>
      <ants-form-item label="黑名单域名" prop="blObjS">
        <ants-input
          v-if="form.id"
          disabled
          v-model="form.blObjS"
          placeholder="请输入黑名单主域名"
        />
        <div v-else>
          <ants-input
            v-model="form.blObjS"
            placeholder="请输入黑名单主域名，一行一个，不能有空格。
例如：domain.com"
            type="textarea"
            :autosize="{ minRows: 8, maxRows: 16 }"
          />
          <div class="text-sm text-ants-text-4">
            一行一个黑名单主域名，不能有空格。形如：domain.com
          </div>
        </div>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doSaveBlackList } from '@/v2/dns_admin/api/dns/black'

const defaultForm = {
  // 添加对话框的表单数据
  id: 0,
  // 分类
  label: '违法',
  // 处理方式 1 = 指定CNAME， 2 = 随机活肤
  blMode: 1,
  // 指定CNAME
  returnParam: '',
  // 黑名单域名，多个以逗号分隔
  blObjS: '',
  // 备注信息
  remark: ''
}

const blModeObj = {
  1: '指定CNAME',
  2: '随机回复'
}

const labelList = [
  '违法',
  '涉黄',
  '诈骗',
  '赌博',
  '低俗',
  '暴力',
  '反人类',
  '其他'
]
export default {
  props: {
    serverId: [Number, String]
  },
  data() {
    // 验证规则
    const { isName } = this.$validator

    return {
      title: '添加',
      blModeObj,
      labelList,
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        // 添加用户对话框的规则
        blObjS: [
          {
            required: true,
            message: '请输入黑名单域名',
            trigger: ['change', 'blur']
          }
          //   {
          //     validator: isName(),
          //     trigger: 'blur'
          //   }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ],
        label: [
          {
            required: true,
            message: '请选择分类',
            trigger: 'change'
          }
        ],
        blMode: [
          {
            required: true,
            message: '请选择处理方式',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 对话框显示
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = '添加'
      if (row.id) {
        this.title = '修改'
        this.form = {
          ...defaultForm,
          ...row,
          blObjS: row.blObj
        }
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true

        const { id, blObjS } = this.form
        const postObj = id
          ? this.form
          : {
              ...this.form,
              blObjS: blObjS.trim().replace(/[\r\n]+/g, ',')
            }

        const { data: res } = await doSaveBlackList(postObj)

        this.$refs.dialogRef.btnLoading = false

        if (res.code !== 1) return
        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.title + '成功')
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
