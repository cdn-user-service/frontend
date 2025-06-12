<template>
  <el-dialog
    :title="antsT('添加密钥')"
    :visible.sync="dialogVisible"
    @close="resetDialog"
    width="500px"
    class="dialog_box ants-bg-input"
    :close-on-click-modal="false"
    center
  >
    <div class="text-center mb-xl" style="line-height:30px;">
      <span class="text-warning el-icon-info text-lg"></span>
      {{
        antsT(
          '您的 APi 密钥代表您的账号身份和所拥有的权限，等同于您的登录密码，切勿泄漏给他人。'
        )
      }}
    </div>
    <el-form
      :model="addForm"
      :rules="addNameRules"
      ref="addNameRef"
      label-width="0"
      label-position="top"
      status-icon
    >
      <el-form-item prop="name">
        <el-input
          v-model="addForm.name"
          prefix-icon="el-icon-chat-dot-round"
          :placeholder="antsT('请输入API 密钥备注信息')"
          maxlength="1000"
          @keyup.enter.native="submitAddName()"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <ants-button
        type="info"
        size="small"
        @click="dialogVisible = false"
        text="取 消"
      />
      <ants-button
        type="primary"
        size="small"
        @click="submitAddName"
        :loading="btnLoading"
        text="确 认"
      />
    </span>
  </el-dialog>
</template>

<script>
import { doCreate } from '@/v2/dns_users/api/dns/apikey'

export default {
  data() {
    return {
      dialogVisible: false,
      btnLoading: false,
      addForm: {
        name: ''
      },
      addNameRules: {
        name: [
          {
            required: true,
            message: '请输入API 密钥备注信息',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    /**
     * @description: 添加API 密钥提交
     * @param {*} row
     */
    submitAddName() {
      this.$refs.addNameRef.validate(async valid => {
        if (!valid) return
        // 发起请求
        this.btnLoading = true
        const { data: res } = await doCreate({
          name: this.addForm.name
        })

        this.btnLoading = false

        if (res.code !== 1) return

        this.$parent.getGoodsList()
        this.$msg.success('添加API 密钥成功')
        this.dialogVisible = false
      })
    },

    // 添加API 密钥表单重置
    resetDialog() {
      this.btnLoading = false
      this.$refs.addNameRef.resetFields()
    }
  }
}
</script>
