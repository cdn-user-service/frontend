<template>
  <el-card class="animated fadeIn content-box" v-loading="$root.loading">
    <!-- <div slot="header">
      <strong>{{ antsT('节点安装配置') }}</strong>
    </div> -->
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-position="top"
      space-class="space-y-6"
      size="medium"
    >
      <ants-form-item
        v-for="(item, key) in list"
        :key="key"
        v-show="item.command"
      >
        <TitleBorder>
          <strong>
            {{ item.title }}
          </strong>
          <span class="text-sm text-ants-text-4 ml-sm">{{ item.info }}</span>
        </TitleBorder>

        <div
          class="py-sm px-lg bg-ants-bg-3 rounded-2xl relative overflow-hidden"
          style="min-height: 56px"
        >
          {{ item.command }}

          <el-tooltip effect="light" content="复制" placement="top-end">
            <ants-copy
              :text="item.command"
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
import { getNodeConfView } from '@/v2/cdn_admin/api/system/config'

export default {
  data() {
    return {
      btnLoading: false,
      form: {
        // 安装指令
        install_node_command: '',
        // 主控IP
        master_ip: '',
        // redis配置
        redis_conf: {
          // 密码
          requirepass: '',
          // 用于密码加密显示
          requirepassShow: ''
        },
        centos: '',
        ubuntu: ''
      },
      requirepassKey: 'requirepassShow',

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
  computed: {
    list() {
      const list = {
        centos: {
          title: 'centos7.x安装命令',
          info: '',
          command: ''
        },
        ubuntu: {
          title: 'ubuntu22.04安装命令',
          info: '',
          command: ''
        },
        ubuntu_cert_server: {
          title: 'ubuntu22.04证书服务安装',
          info: '',
          command: ''
        },
        bbr_centos: {
          title: 'bbr centos加速安装',
          info: '选装，安装后提升提高带宽利用率，降低延迟，但在某些网络环境中，反而降低网络性能',
          command: ''
        },
        bbr_ubuntu: {
          title: 'bbr ubuntu加速安装',
          info: '选装，安装后提升提高带宽利用率，降低延迟，但在某些网络环境中，反而降低网络性能',
          command: ''
        }
      }
      if (this.form.ubuntu) {
        list.ubuntu.command = this.form.ubuntu
      }
      if (this.form.centos) {
        list.centos.command = this.form.centos
      }
      if (this.form.bbr_centos) {
        list.bbr_centos.command = this.form.bbr_centos
      }
      if (this.form.bbr_ubuntu) {
        list.bbr_ubuntu.command = this.form.bbr_ubuntu
      }
      if (this.form.ubuntu_cert_server) {
        list.ubuntu_cert_server.command = this.form.ubuntu_cert_server
      }
      return list
    }
  },
  created() {
    this.getNodeConfig()
  },
  methods: {
    /**
     * @description: 获取配置信息
     */

    async getNodeConfig() {
      this.$root.loading = true
      const { data: res } = await getNodeConfView()
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      this.form = {
        ...this.form,
        ...obj,
        // centos: `${obj.install_node_command} -i ${obj.master_ip} -p ${
        //   obj.redis_conf && obj.redis_conf.requirepass
        // }`,
        centos: obj.full_install_node_command,
        ubuntu: obj.full_install_node_command_with_ubuntu,
        bbr_centos: obj.full_install_bbr_centos,
        bbr_ubuntu: obj.full_install_bbr_ubuntu
      }

      // 密码加密显示
      if (typeof this.form.redis_conf.requirepass === 'string') {
        const length = this.form.redis_conf.requirepass.length
        let str = ''
        for (let i = 0; i < length; i++) {
          str += '*'
        }
        this.form.redis_conf.requirepassShow = str
      }
    },

    // 密码显示隐藏
    togglePassword() {
      this.requirepassKey =
        this.requirepassKey === 'requirepass'
          ? 'requirepassShow'
          : 'requirepass'
    },

    // 密码加密
    encrypMobile(mobile) {
      return mobile.substr(0, 3) + '****' + mobile.substr(7)
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
