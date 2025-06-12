<template>
  <ants-dialog
    title="修改产品参数"
    v-model="dialogVisible"
    @closed="resetForm"
    @submit="doSave"
    ref="dialogRef"
    width="500px"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
      label-position="left"
      :status-icon="false"
    >

      <ants-form-item
        prop="attrKeyName"
        label="参数名称"
      >
        <ants-input
          v-model="form.attrKeyName"
          placeholder="请输入参数名称"
          maxlength="50"
          style="width:200px;"
          disabled
        />
      </ants-form-item>
      <ants-form-item
        prop="attrValue"
        label="默认值"
      >
        <div v-if="form.attrType === 'int'">
          <ants-input-number
            v-model="form.attrValue"
            :step="1"
            :min="0"
            :precision="0"
            placeholder="请输入默认值"
          />
          <span class="ml-sm text-sm">{{form.attrUnit}}</span>
        </div>

        <div v-if="form.attrType === 'bool'">
          <span class="text-success">
            <i class="el-icon-success"></i>
            支持</span>
        </div>

      </ants-form-item>

      <ants-form-item
        prop="attrPrice"
        label="价 格"
      >
        <ants-input-number
          v-model="form.attrPrice"
          :step="100"
          :min="0"
          :precision="2"
          placeholder="请输入价格"
        />
        <span class="ml-sm text-sm">{{ $root.priceUnit }}</span>
      </ants-form-item>

      <ants-form-item
        prop="attrKeyWeight"
        label="排 序"
      >
        <ants-input-number
          v-model="form.attrKeyWeight"
          :step="100"
          :min="0"
          :precision="0"
          placeholder="排序"
        />
        <span class="text-sm ants-font-4 ml-sm">(越大越靠前)</span>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doUpdateAttr } from '@/v2/dns_admin/api/dns/plan'

const defaultForm = {
  // 添加对话框的表单数据
  id: null,
  attrGroupName: '', // 属性分组，选填，不填则为顶级分组
  attrGroupWeight: 1, // 分组排序
  attrKeyName: '', // 属性名
  attrKeyWeight: 1, // 排序
  attrType: 'int', // 属性类型，bool、int
  attrValue: '', // 属性值
  attrUnit: '', // 属性单位
  attrPrice: 0, // 属性价格
  attrSuperposition: 1, // 属性级别 0=套餐内不可叠加 1=套餐内可叠加
  status: 1 // 状态
}
export default {
  data() {
    return {
      dialogVisible: false,
      loading: false,
      form: {
        ...defaultForm
      },
      formRules: {
        attrKeyName: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: ['blur', 'change']
          }
        ],
        attrValue: [
          {
            required: true,
            message: '请输入默认值',
            trigger: ['blur', 'change']
          }
        ],
        attrPrice: [
          {
            required: true,
            message: '请输入价格',
            trigger: ['blur', 'change']
          }
        ],
        attrKeyWeight: [
          {
            required: true,
            message: '请输入排序',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.form = {
        ...defaultForm,
        ...row,
        attrPrice: row.attrPrice / 100
      }
    },

    // 表单提交
    doSave() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doUpdateAttr({
            ...this.form,
            attrPrice: this.form.attrPrice * 100
          })
          this.$refs.dialogRef.btnLoading = false
          if (res.code !== 1) return
          this.$emit('refresh')
          this.$msg.success('修改成功')
          this.dialogVisible = false
        } catch (error) {
          this.$refs.dialogRef.btnLoading = false
          throw error
        }
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

<style lang="scss">
</style>
