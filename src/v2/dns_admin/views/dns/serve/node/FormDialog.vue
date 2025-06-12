<template>
  <ants-dialog
    :title="`${dialogText}节点`"
    v-model="dialogVisible"
    width="560px"
    ref="dialogRef"
    @closed="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="80px"
    >
      <ants-form-item label="节点IP" prop="ip">
        <ants-input v-model="form.ip" placeholder="请输入节点IP" />
      </ants-form-item>
      <ants-form-item label="选择分组" prop="groupId">
        <el-select v-model="form.groupId" placeholder="请选择分组" style="width:100%;">
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </ants-form-item>
      <ants-form-item label="选择线路" prop="line">
        <el-select v-model="form.line" placeholder="请选择线路" style="width:100%;">
          <el-option
            v-for="item in [
              '默认',
              '中国移动',
              '中国电信',
              '中国联通',
              '中国铁通',
              '其他'
            ]"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </ants-form-item>
      <ants-form-item label="备注信息" prop="remark">
        <ants-input v-model="form.remark" placeholder="请输入备注信息" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import { doUpdateServer } from '@/v2/dns_admin/api/dns/serve'
const defaultForm = {
  id: null,
  // 节点IP
  ip: '',
  // 分组ID
  groupId: '',
  // 线路
  line: '默认',
  // 备注信息
  remark: '',
  status: 1
}
export default {
  props: {
    groupId: [Number, String],
    groupList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 验证规则
    const { isIp } = this.$validator

    return {
      // 添加修改分组数据
      dialogText: '添加',
      dialogVisible: false,

      form: {
        ...defaultForm
      },

      // 表单验证规则
      formRules: {
        ip: [
          {
            required: true,
            message: '请输入节点IP',
            trigger: ['blur', 'change']
          },
          {
            validator: isIp(),
            trigger: 'blur'
          }
        ],
        groupId: [
          {
            required: true,
            message: '请选择分组',
            trigger: ['blur', 'change']
          }
        ],
        line: [
          {
            required: true,
            message: '请选择线路',
            trigger: ['blur', 'change']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 点击添加，编辑
     * @param {*} row
     */

    show(row = {}) {
      this.dialogVisible = true
      this.dialogText = '添加'
      this.form.groupId = this.groupId

      if (row.id) {
        this.dialogText = '编辑'
        this.form = {
          ...row
        }
      }
    },

    /**
     * @description: 添加编辑参数提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doUpdateServer(this.form)

          this.$refs.dialogRef.btnLoading = false
          if (res.code !== 1) return
          this.$emit('refresh')
          this.$msg.success('操作成功')
          this.dialogVisible = false
        } catch (error) {
          this.$refs.dialogRef.btnLoading = false
          console.log(error)
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
