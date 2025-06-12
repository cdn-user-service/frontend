<template>
  <div id="app">
    <el-card class="mt-5">
      <el-steps :active="activeStep" finish-status="success" simple>
        <el-step title="服务器SSH"></el-step>
        <el-step title="发送安装命令"></el-step>
        <el-step title="安装成功"></el-step>
      </el-steps>
    </el-card>

    <div v-if="activeStep === 1">
      <el-card class="mt-5">
        <el-form :model="formData" label-width="120px">
          <el-form-item label="服务器 Host">
            <el-input v-model="formData.host"></el-input>
          </el-form-item>
          <el-form-item label="端口">
            <el-input v-model="formData.port"></el-input>
          </el-form-item>
          <el-form-item label="账号">
            <el-input v-model="formData.username"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="formData.password" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div class="button-container">
          <el-button @click="nextStep" type="primary">下一步</el-button>
        </div>
      </el-card>
    </div>

    <div v-if="activeStep === 2">
      <el-card class="mt-5">
        <el-form :model="commandForm" label-width="120px">
          <el-form-item label="发送安装命令">
            <el-input v-model="commandForm.installCommand"></el-input>
          </el-form-item>
        </el-form>
        <div class="button-container">
          <el-button @click="nextStep" type="primary">发送命令</el-button>
        </div>
      </el-card>
    </div>

    <div v-if="activeStep === 3">
      <el-card>
        <el-alert title="安装成功" type="success"></el-alert>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeStep: 1,
      formData: {
        host: '',
        port: '',
        username: '',
        password: ''
      },
      commandForm: {
        installCommand: ''
      }
    }
  },
  methods: {
    nextStep() {
      if (this.activeStep < 3) {
        this.activeStep++
      }
    },
    sendCommand() {
      console.log('发送的安装命令:', this.commandForm.installCommand)
      this.$message.success('命令发送成功')
    }
  }
}
</script>

<style scoped>
#app {
  padding: 20px;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.button-container button {
  margin-left: 10px;
}
</style>
