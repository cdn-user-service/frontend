<template>
  <ants-dialog
    :title="`修改证书套餐价格【${form.productName}】`"
    width="800px"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
  >
    <el-row :gutter="10">
      <el-col :span="8">
        <div class="p-lg rounded-2xl bg-ants-bg-4 space-y-10">
          <TitleBorder title="基础价格" />
          <div v-for="(item, key) in basePriceObj" :key="key">
            <span>{{ priceYearObj[key] }}：</span>
            <strong>{{ $root.priceUnit }} {{ item }}</strong>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="p-lg rounded-2xl bg-ants-bg-4 space-y-10">
          <TitleBorder title="代理价格" />
          <ants-form
            :model="form"
            :rules="rules"
            ref="formRef"
            label-width="40px"
            label-position="left"
            space-class="space-y-6"
          >
            <ants-form-item
              :label="priceYearObj[key]"
              :prop="key"
              v-for="(item, key) in basePriceObj"
              :key="key"
            >
              <ants-input-number
                v-model="form[`${key}Agent`]"
                placeholder="价格"
                :precision="2"
                :min="item || 0"
                :max="9999999999"
                size="small"
                style="width: 150px;"
              />
            </ants-form-item>
          </ants-form>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="p-lg rounded-2xl bg-ants-bg-4 space-y-10">
          <TitleBorder title="用户价格" />
          <ants-form
            :model="form"
            :rules="rules"
            ref="formRef"
            label-width="40px"
            label-position="left"
            space-class="space-y-6"
          >
            <ants-form-item
              :label="priceYearObj[key]"
              :prop="key"
              v-for="(item, key) in basePriceObj"
              :key="key"
            >
              <ants-input-number
                v-model="form[key]"
                placeholder="价格"
                :precision="2"
                :min="item || 0"
                :max="9999999999"
                size="small"
                style="width: 150px;"
              />
            </ants-form-item>
          </ants-form>
        </div>
      </el-col>
    </el-row>
  </ants-dialog>
</template>

<script>
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doSavePlanPrice } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const defaultForm = {
  id: 0,
  // 套餐名称
  productName: ''
}

// 构造10年的基础数据
for (let i = 1; i <= 10; i++) {
  const yearStr = `${i * 12 + ''}`.padStart(3, '0')
  // 用户价格
  defaultForm[`price${yearStr}`] = 0
  // 代理价格
  defaultForm[`price${yearStr}Agent`] = 0
}

const rules = {}
export default {
  props: {
    priceYearObj: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      btnLoading: false,
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules,
      // 基础价格
      basePriceObj: {}
    }
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.form.id = row.id
      this.form.productName = row.productName

      // 基础价格
      this.basePriceObj = row.basePriceObj || {}

      // 代理价格
      const agentBasePrice = row.agentBasePrice || {}

      // 出售价格
      const userBasePrice = row.userBasePrice || {}

      Object.keys(this.basePriceObj).forEach(key => {
        this.form[key] = userBasePrice[key] || this.basePriceObj[key]
        this.form[`${key}Agent`] = agentBasePrice[key] || this.basePriceObj[key]
      })
    },

    // 表单提交
    submit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const userBasePrice = {}
          Object.keys(this.basePriceObj).forEach(key => {
            userBasePrice[key] = this.form[key]
          })

          const { data: res } = await doSavePlanPrice({
            id: this.form.id,
            userBasePrice
          })
          if (res.code !== 1) return
          this.$emit('refresh')
          this.dialogVisible = false
          this.$msg.success('操作成功')
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 对话框关闭
    closed() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
