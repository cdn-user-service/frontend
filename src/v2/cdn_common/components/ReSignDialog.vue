<template>
  <ants-dialog
    title="批量申请证书"
    v-model="visible"
    width="550px"
    top="5vh"
    @closed="closed"
  >
    <ants-form
      :model="form"
      :rules="rules"
      label-width="85px"
      ref="formRef"
      hide-required-asterisk
      class="-mt-sm -mb-df"
      label-position="left"
    >
      <!-- <ants-form-item label="申请域名：" v-if="!form.ids">
        <div
          class="relative font-semibold truncate pl-sm pr-xl py-sm border border-ants-border-3 rounded-lg leading-none"
        >
          {{ form.commonName }}
          <ants-copy
            icon
            class="absolute right-0 pr-sm"
            :text="form.commonName"
          />
        </div>
      </ants-form-item> -->

      <ants-form-item label="证书类型：" prop="type">
        <ants-radio-group v-model="form.type" size="small">
          <el-radio
            v-for="item in certificateType"
            :key="item.value"
            :label="item.value"
            style="margin-right: 10px"
          >
            <span style="margin-right: 5px">{{ item.name }}</span>
            <span style="font-size: 12px; color: red" v-if="item.tip">{{
              item.tip
            }}</span>
          </el-radio>
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item
        label="DNS API："
        prop="dnsConfigId"
        v-if="form.type == 4 || form.type == 6"
      >
        <ants-select
          v-model="form.dnsConfigId"
          placeholder="请选择DNS API"
          clearable
        >
          <ants-option
            v-for="item in dnsApiData"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ants-select>
      </ants-form-item>
    </ants-form>

    <div slot="footer" class="text-center">
      <ants-button
        size="small"
        type="info"
        @click="visible = false"
        text="取 消"
      />
      <ants-button
        size="small"
        type="primary"
        :loading="btnLoading"
        @click="submit()"
        :text="
          btnLoading
            ? '处理中'
            : form.ids
            ? `申 请 （${form.ids.split(',').length}）`
            : '申 请'
        "
      />
    </div>
  </ants-dialog>
</template>

<script>
import { certificateType, getDnsApiData } from '@/global/certificateType'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { reIssued } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const defaultForm = {
  // commonName: '',
  id: null,
  // 0 = 默认证书 | 1 = ZeroSSl
  type: certificateType[0].value,
  // 批量重签
  ids: '',
  dnsConfigId: null
}

export default {
  data() {
    return {
      certificateType,
      visible: false,
      btnLoading: false,
      form: {
        ...defaultForm
      },
      rules: {
        type: [
          {
            required: true,
            message: '请输入选择证书类型',
            trigger: ['change', 'blur']
          }
        ]
      },
      dnsApiData: []
    }
  },
  async created() {
    this.dnsApiData = await getDnsApiData()
  },
  methods: {
    show(selectArr = []) {
      console.log('selectArr', selectArr)
      this.visible = true
      this.form.ids = selectArr.map((item) => item.id).join(',')
      this.form.type = certificateType[0].value
      console.log('this.form', this.form)
    },

    async submit() {
      this.btnLoading = true
      if (this.form.type != 4 && this.form.type != 6) {
        this.form.dnsConfigId = null
      }
      try {
        const { data: res } = await reIssued({
          // 0 = 申请 | 1 = 重新申请
          mode: 0,
          useMode: this.form.type,
          ...this.form
        })
        if (res.code !== 1) return
        if ((res.errMsg || []).length) {
          this.$msg.error(res.errMsg[0])
          return
        }
        this.$msg.success(this.antsT('证书申请已提交'))
        this.$emit('refresh')
        this.visible = false
      } finally {
        this.btnLoading = false
      }
    },

    closed() {
      this.form.ids = ''
      this.form.dnsConfigId = null
    }
  }
}
</script>
<style lang="less" scoped>
.el-radio-group {
  display: flex;
  flex-wrap: wrap;
  .el-radio {
    flex: 100%;
    line-height: 30px;
  }
}
</style>
