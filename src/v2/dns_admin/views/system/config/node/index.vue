<template>
  <el-card class="animated fadeIn content-box" v-loading="loading">
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-2"
      class="-mt-sm"
    >
      <!-- <ants-form-item>
        <ants-button
          size="small"
          type="success"
          text="刷新"
          icon="el-icon-refresh"
          @click="getNodeConfig"
        />
      </ants-form-item> -->

      <ants-form-item v-for="(item, key) in form" :key="key">
        <ants-TitleBorder :title="commondName[key]" />
        <div
          class="py-sm px-lg bg-ants-bg-3 rounded-2xl relative overflow-hidden"
          style="min-height: 56px"
        >
          {{ item }}

          <el-tooltip effect="light" content="复制" placement="top-end">
            <ants-copy
              :text="item"
              icon
              class="custom-copy-icon absolute cursor-color rounded-xl bg-ants-bg-1"
              style="
                top: 10px;
                right: 10px;
                line-height: 1;
                margin: 0;
                font-size: 16px;
              "
            />
          </el-tooltip>
        </div>
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
import { getNodeConfView } from '@/v2/dns_admin/api/system/config'

const commondName = {
  full_install_node_command: 'DNS节点安装命令',
  full_install_monitor_master_command: '监控调度安装命令',
  full_install_monitor_slave_command: '监控节点安装命令',
  full_install_elk: 'Elasticsearch安装命令',

  full_install_rewrite_type_answer: '应答节点安装命令',
  full_install_rewrite_type_rewrite: '跳转节点安装命令'
}

const defaultForm = {
  full_install_node_command: '',
  full_install_monitor_master_command: '',
  full_install_monitor_slave_command: '',
  full_install_elk: ''
}

export default {
  data() {
    if (this.$mode['176_179']) {
      defaultForm.full_install_rewrite_type_answer = ''
      defaultForm.full_install_rewrite_type_rewrite = ''
    }

    return {
      loading: false,
      commondName,
      form: {
        ...defaultForm
      },

      formRules: {
        appKey: [
          {
            required: true,
            message: 'AppKey不能为空',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getNodeConfig()
  },
  methods: {
    // 获取安装命令
    async getNodeConfig() {
      this.loading = true
      const { data: res } = await getNodeConfView()
      this.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      Object.keys(defaultForm).forEach((key) => {
        this.form[key] = obj[key]
      })
    }
  }
}
</script>

<style lang="scss">
.custom-copy-icon {
  .copy-icon {
    display: inline-block;
    padding: 10px;
  }
}
</style>
