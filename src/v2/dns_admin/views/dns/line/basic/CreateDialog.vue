<template>
  <ants-dialog
    title="添加数据"
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
      <ants-form-item
        label="选择父级"
        prop="parent"
        v-if="queryInfo.group_id != 1"
      >
        <el-select
          v-model="form.parent"
          clearable
          filterable
          placeholder="请选择父级"
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
      <ants-form-item label="区域名称" prop="content">
        <ants-input
          v-model="form.content"
          placeholder="请输入区域名称，一行为一个，不允许有空格"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 16 }"
        />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
const defaultForm = {
  content: '',
  parent: ''
}
export default {
  props: {
    parentList: Array,
    queryInfo: {
        type: Object,
        default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      formRules: {
        parent: [
          {
            required: true,
            message: '请选择父级',
            trigger: 'change'
          }
        ],
        content: [
          {
            required: true,
            message: '区域名称不能为空',
            trigger: 'blur'
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
