<template>
  <ants-dialog
    title="添加自然划分区"
    v-model="dialogVisible"
    width="550px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      label-position="top"
    >
      <ants-form-item label="自然划分区名称" prop="cn_zone">
        <ants-input v-model="form.cn_zone" placeholder="请输入自然划分区名称" />
      </ants-form-item>

      <ants-form-item label="选择省份" prop="province_id">
        <el-select
          v-model="form.province_id"
          multiple
          clearable
          filterable
          placeholder="请选择选择省份"
          style="width: 100%;"
        >
          <el-option
            v-for="item in parentList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <div class="flex items-center justify-between">
              <span>{{ item.name }}</span>
              <span>{{ item.code }}</span>
            </div>
          </el-option>
        </el-select>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const defaultForm = {
  cn_zone: '',
  province_id: []
}
export default {
  props: {
    parentList: Array
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        cn_zone: [
          {
            required: true,
            message: '自然划分区名称不能为空',
            trigger: 'blur'
          }
        ],
        province_id: [
          {
            required: true,
            message: '请选择省份',
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
    },

    /**
     * @description: 添加提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        // this.$refs.dialogRef.btnLoading = true
        // const { data: res } = await aaaa(this.form)
        // this.$refs.dialogRef.btnLoading = false
        // if (res.code !== 1) return
        // this.$parent.getGoodsList()
        this.$msg.success('添加成功')
        this.dialogVisible = false
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
