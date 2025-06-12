<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="`${form.id ? '修改' : '添加'}证书`"
    width="550px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="85px"
    >
      <template v-if="!form.id">
        <ants-form-item label="证书期限" prop="certificate_validity_days">
          <ants-radio-group v-model="form.certificate_validity_days">
            <ants-radio :label="90" text="90天" />
            <!-- <ants-radio :label="365" text="365天" /> -->
          </ants-radio-group>
        </ants-form-item>
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

        <ants-form-item label="绑定域名" prop="domains">
          <ants-input
            v-model="form.domains"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 12 }"
            placeholder="输入绑定域名，每行一个，最多可输入1000个域名。例如：
domain1.com
domain2.com"
          />
        </ants-form-item>
      </template>

      <template v-else>
        <ants-form-item label="绑定域名" prop="commonName">
          <ants-select
            v-model="form.commonName"
            placeholder="请检索域名"
            filterable
            remote
            :remote-method="remoteMethod"
            :loading="loading"
            :disabled="form.id != 0"
          >
            <ants-option
              v-for="item in domainList"
              :key="item.id"
              :label="item.mainServerName"
              :value="item.mainServerName"
            />
          </ants-select>
        </ants-form-item>

        <ants-form-item label="备注信息" prop="remark">
          <ants-input v-model="form.remark" placeholder="请输入备注信息" />
        </ants-form-item>
      </template>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { certificateType, getDnsApiData } from '@/global/certificateType'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doCreateUpdateCertify,
  getSiteList,
  doCreateCert
} = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

const defaultForm = {
  // 修改
  id: 0,
  // 多个IP地址，以逗号分隔的字符串
  commonName: '',
  // 备注信息
  remark: '',

  // 添加域名
  // 有效期： 90 | 365 天
  certificate_validity_days: 90,
  // 多个域名以逗号分隔
  domains: '',
  // 可不用传
  userId: 0,
  type: certificateType[0].value,
  dnsConfigId: null
}

export default {
  data() {
    const { isDomains } = this.$validator
    return {
      certificateType,
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        commonName: [
          {
            required: true,
            message: '请选择域名',
            trigger: ['change', 'blur']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入备注信息',
            trigger: ['change', 'blur']
          }
        ],

        domains: [
          {
            required: true,
            message: '请输入域名',
            trigger: ['change', 'blur']
          },
          {
            validator: isDomains(),
            trigger: 'blur'
          }
        ],
        certificate_validity_days: [
          {
            required: true,
            message: '请选择证书期限',
            trigger: ['change', 'blur']
          }
        ]
      },

      loading: false,
      domainList: [],
      dnsApiData: []
    }
  },
  async created() {
    this.dnsApiData = await getDnsApiData()
  },
  methods: {
    showDialog(row = {}) {
      this.dialogVisible = true

      this.form = {
        ...defaultForm,
        ...row
      }
    },

    // 表单提交
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        if (this.form.type != 4 && this.form.type != 6) {
          this.form.dnsConfigId = null
        }
        try {
          const { id, domains } = this.form
          const api = id ? doCreateUpdateCertify : doCreateCert
          const postData = id
            ? this.form
            : {
                // 有效期： 90 | 365 天
                certificate_validity_days: this.form.certificate_validity_days,
                // 多个域名以逗号分隔
                domains: domains.trim().replace(/[\r\n]+/g, ','),
                // 可不用传
                userId: 0,
                type: this.form.type,
                dnsConfigId: this.form.dnsConfigId
              }

          const { data: res } = await api(postData)
          if (res.code !== 1) return
          this.dialogVisible = false
          this.$emit('refresh')
          this.$msg.success(this.antsT('操作成功'))
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    /**
     * @description: 远程检索域名列表
     */
    async remoteMethod(query) {
      const QUERY = query.trim()
      if (QUERY !== '') {
        this.loading = true
        const { data: res } = await getSiteList({
          user: '',
          mainServerName: QUERY.toLowerCase(),
          page: 1,
          limit: 100
        })
        this.loading = false
        this.domainList = (res.data && res.data.list) || []
      } else {
        this.domainList = []
      }
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
