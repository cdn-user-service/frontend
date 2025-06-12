<template>
  <el-card class="content-box animated fadeIn global-flow-box">
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="120px"
      label-position="top"
    >
      <!-- <div class="p-lg rounded-2xl bg-ants-bg-5">
        <ants-switch
          v-model="form.status"
          active-text="ON"
          inactive-text="OFF"
          v-loading="switchLoading"
          @change="changeStatus"
        />
      </div> -->
      
      <!-- <ants-form-item prop="port" label="流量采集端口">
        <ants-input v-model="form.port" placeholder="请输入流量采集端口" />
      </ants-form-item> -->
      <TitleBorder title="流量采集选项"/>
      <ants-form-item prop="type" >
        <ants-radio-group
          v-model="form.type"
          class="space-y-10 mb-lg"
          @change="changeType"
        >
          <ants-radio
            border
            v-for="item in typeList"
            :key="item.label"
            :label="item.label"
            :text="item.text"
            class="block"
          />
        </ants-radio-group>
      </ants-form-item>

      <TitleBorder title="流量采集URL"/>
      <ants-form-item prop="url">
        <ants-input v-model="form.url" placeholder="请输入流量采集URL" />
      </ants-form-item>

      <ants-form-item>
        <ants-button
          size="small"
          type="primary"
          icon="el-icon-edit"
          :loading="btnLoading"
          @click="submitForm"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
import mixins from '../mixins'

const typeList = [
  {
    label: 'low',
    text: '带宽流量（节约内存，节省资源，要求 4G 内存以上）'
  },
  {
    label: 'mid',
    text: '带宽流量 + URL + 命中率（较费内存，要求 16G 内存以上）'
  },
  {
    label: 'hig',
    text:
      '带宽流量 + URL + 命中率 + 国家区域路线（非常费内存，要求 32G 内存以上）'
  }
]
export default {
  mixins: [mixins],
  data() {
    const { isUrl, isPort } = this.$validator
    return {
      // 标识， [text]
      keyStr: 'vhost_filter_mode',
      switchLoading: false,
      btnLoading: false,
      typeList,
      form: {
        status: 0,
        url: 'http://127.0.0.1:9090',
        port: '8080',
        type: 'low'
      },
      formRules: {
        url: [
          {
            required: true,
            message: '请输入流量采集URL',
            trigger: ['change', 'blur']
          },
          {
            validator: isUrl(),
            trigger: ['change', 'blur']
          }
        ],
        port: [
          {
            required: true,
            message: '请输入流量采集端口',
            trigger: ['change', 'blur']
          },
          {
            validator: isPort(),
            trigger: ['change', 'blur']
          }
        ],
        type: [
          {
            required: true,
            message: '请选择流量采集选项',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {
    this.getDetailByKey()
  },
  methods: {
    /**
     * @description: 获取配置数据
     */

    async getDetailByKey() {
      const { data: res } = await this.getGlobalAttr('vhost')
      if (!res) return
      console.log(res)
      // 流量采集选项
      if (typeof res.vhost_filter_mode === 'object') {
        this.form.type = res.vhost_filter_mode.pvalue || 'low'
      }

      // 流量采集URL
      if (typeof res.vhost_server_url === 'object') {
        this.form.url = res.vhost_server_url.pvalue || 'http://127.0.0.1:9090'
      }
    },

    async changeType() {
      // const data = await this.saveGlobalAttr({
      //   [this.keyStr]: this.form.type
      // })
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        const data = await this.saveGlobalAttr({
          vhost_filter_mode: this.form.type,
          vhost_server_url: this.form.url
        })
      })
    },

    /**
     * @description: 状态改变
     * @param {*} row
     */

    async changeStatus(val) {
      const data = await this.changeGlobalAttrStatus(val, 'vhost')

      if (!data) {
        this.form.status = this.form.status ? 0 : 1
      }
    }
  }
}
</script>

<style lang="scss">
.global-flow-box {
  .el-radio.is-bordered+.el-radio.is-bordered {
    margin-left: 0;
  }
}
</style>
