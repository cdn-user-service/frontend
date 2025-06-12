<template>
  <ants-dialog
    title="购买证书"
    width="1000px"
    top="5vh"
    v-model="dialogVisible"
    ref="dialogRef"
    @closed="closed"
    @submit="submit"
    submitBtnText="立即购买"
  >
    <!-- :submitBtnText="`立即购买 / ${$root.priceUnit}${(priceObj[form.years] || {}).price}`" -->
    <el-row :gutter="10" class="mb-lg -mt-sm">
      <el-col :span="6" v-for="(item, key) in detailObj" :key="key">
        <div class="p-df rounded-2xl bg-ants-bg-4">
          <div class="font-semibold mb-df">{{ item }}</div>
          <div class="text-sm truncate">
            <span
              v-if="key === 'supportSan'"
              :class="sslDetail[key] === 'Y' ? 'text-success' : 'text-error'"
            >
              {{ sslDetail[key] === 'Y' ? '支持' : '不支持' }}
              <strong v-if="sslDetail[key] === 'Y'">
                <el-divider direction="vertical"></el-divider>
                {{ sslDetail.maxDomain || 1 }} 个域名
              </strong>
            </span>

            <span v-else>
              {{ sslDetail[key] }}
            </span>
          </div>
        </div>
      </el-col>
    </el-row>

    <ants-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <ants-form-item label="购买年限" prop="years">
        <ants-radio-group size="small" v-model="form.years">
          <ants-radio-button
            v-for="(item, key) in priceObj"
            :key="key"
            :label="item.year"
            :text="item.name"
          />
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item label="证书绑定域名" prop="domains">
        <div class="relative" v-if="sslDetail.supportSan === 'Y'">
          <ants-input
            v-model="form.domains"
            type="textarea"
            rows="8"
            :placeholder="
              `请输入绑定域名，每行一个，最多可输入${sslDetail.maxDomain ||
                1}个域名。例如：
  domain1.com
  domain2.com`
            "
          />
          <span
            class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs"
          >
            已输入(<span
              :class="
                domainRows > sslDetail.maxDomain ? 'text-error' : 'text-primary'
              "
              >{{ domainRows }}</span
            >)行
          </span>
        </div>

        <ants-input
          v-else
          v-model="form.domains"
          placeholder="请输入证书绑定域名"
          maxlength="500"
        />
      </ants-form-item>
      <ants-form-item label="域名验证方式" prop="dcvMethod">
        <!-- DV型域名都是域名验证 -->
        <!-- :disabled="sslDetail.validationType == 'dv'" -->
        <ants-select v-model="form.dcvMethod" placeholder="请选择域名验证方式">
          <ants-option
            v-for="(item, key) in dcvMethodObj"
            :key="key"
            :value="key"
            :label="item"
          />
        </ants-select>
      </ants-form-item>
      <ants-form-item label="联系人信息" prop="contactId">
        <ants-select
          v-model="form.contactId"
          placeholder="请选择联系人信息"
          :loading="loading"
          @change="handleContactChange"
        >
          <el-option label="系统默认信息" value="default"> </el-option>
          <el-option
            v-for="(item, key) in contactObj"
            :key="key"
            :value="key"
            :label="
              `【组织：${item.organation}】【名字：${item.firstName}】【手机：${item.mobile}】【邮箱：${item.email}】`
            "
          >
            <div class="flex items-center">
              <span> 【组织：{{ item.organation }}】 </span>
              <span> 【名字：{{ item.firstName }}】 </span>
              <span> 【手机：{{ item.mobile }}】 </span>
              <span> 【邮箱：{{ item.email }}】 </span>
            </div>
          </el-option>
        </ants-select>
      </ants-form-item>

      <ants-form-item
        label="公司信息"
        prop="organizationId"
        v-if="['ev', 'ov'].includes(sslDetail.validationType)"
      >
        <ants-select
          v-model="form.organizationId"
          placeholder="请选择公司信息"
          :loading="orzLoading"
        >
          <el-option label="系统默认信息" value="default"> </el-option>
          <el-option
            v-for="(item, key) in organizationObj"
            :key="key"
            :value="key"
            :label="
              `【名称：${item.organizationName}】【电话：${item.organizationMobile}】【地址：${item.organizationCountry}${item.organizationCity}${item.organizationAddress}】`
            "
          >
            <div class="flex items-center">
              <span> 【名称：{{ item.organizationName }}】 </span>
              <span> 【电话：{{ item.organizationMobile }}】 </span>
              <span>
                【地址：{{
                  `${item.organizationCountry}${item.organizationCity}${item.organizationAddress}`
                }}】
              </span>
            </div>
          </el-option>
        </ants-select>
      </ants-form-item>

      <ants-form-item label="CSR生成方式" prop="csrType">
        <ants-radio-group v-model="form.csrType">
          <ants-radio
            v-for="(item, key) in {
              default: '系统生成'
              // manual: '手动填写'
            }"
            :key="key"
            :label="key"
            :text="item"
          />
        </ants-radio-group>
        <div class="ants-tips_box mt-sm">
          <div>
            <i class="el-icon-info text-primary"></i>
            <strong>
              为了保障您的证书顺利申请，建议您使用默认生成CSR的方式：</strong
            >
          </div>
          <div class="my-2">
            1、建议您使用系统创建的CSR，避免因内容不正确而导致的审核失败。
          </div>
          <div class="my-2">
            2、使用已创建的CSR申请证书，请不要在证书签发完成前删除CSR。
          </div>
          <div>
            3、选择手动填写CSR方式，请务必保存好CSR和私钥。
          </div>
        </div>
      </ants-form-item>

      <el-row
        :gutter="20"
        v-if="form.csrType === 'manual'"
        style="margin-bottom: -10px;"
      >
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 12 }"
          :md="{ span: 12 }"
          :lg="{ span: 12 }"
          :xl="{ span: 12 }"
        >
          <ants-form-item label="填写CSR" prop="csr">
            <template slot="label">
              <strong class="mr-sm">CSR</strong>
              <span
                class="cursor-pointer text-primary underline"
                :class="{ 'cursor-not-allowed text-ants-text-4': csrLoading }"
                @click="generateCsr()"
                >{{ csrLoading ? '生成中...' : '自动生成' }}</span
              >
            </template>
            <ants-input
              v-model="form.csr"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 8 }"
              placeholder="请填写CSR"
            />
          </ants-form-item>
        </el-col>

        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 12 }"
          :md="{ span: 12 }"
          :lg="{ span: 12 }"
          :xl="{ span: 12 }"
        >
          <ants-form-item label="私钥" prop="privateKey" label-width="60px">
            <ants-input
              v-model="form.privateKey"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 8 }"
              placeholder="请填写私钥"
            />
          </ants-form-item>
        </el-col>
      </el-row>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { DCV_METHOD } from '../order/cert-params'
const PROCESS_NAME = process.env.VUE_APP_NAME
const {
  doBuySsl,
  generateCrs,
  getSslContactPage,
  getSslOrganizationPage
} = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const defaultForm = {
  // 证书产品 code
  productCode: '',
  // 购买年限
  years: 1,
  // 【手动填写】需要传递，可根据联系人信息生成 或 手动输入；【系统生成】不需要。
  csr: '',
  // 【手动填写】需要传递，可根据联系人信息生成 或 手动输入；【系统生成】不需要。
  privateKey: '',
  // 域名验证方式，默认选择DNS验证
  dcvMethod: 'CNAME_CSR_HASH',
  // 域名
  domains: '',

  // 联系人ID，这个参数只用于展示，不传递
  contactId: 'default',
  // 企业ID，这个参数只用于展示，不传递
  organizationId: 'default',
  // csr生成方式，这个参数只用于展示，不传递
  csrType: 'default'
}

const rules = {
  years: [
    {
      required: true,
      message: '请选择购买年限',
      trigger: ['blur', 'change']
    }
  ],
  domains: [
    {
      required: true,
      message: '请输入证书绑定域名',
      trigger: ['blur', 'change']
    }
  ],
  dcvMethod: [
    {
      required: true,
      message: '请选择域名验证方式',
      trigger: ['blur', 'change']
    }
  ],
  contactId: [
    {
      required: true,
      message: '请选择联系人信息',
      trigger: ['blur', 'change']
    }
  ],
  organizationId: [
    {
      required: true,
      message: '请选择公司信息',
      trigger: ['blur', 'change']
    }
  ],
  csrType: [
    {
      required: true,
      message: '请选择CSR生成方式',
      trigger: ['blur', 'change']
    }
  ],
  csr: [
    {
      required: true,
      message: '请填写CRS',
      trigger: ['blur', 'change']
    }
  ],
  privateKey: [
    {
      required: true,
      message: '请填写私钥',
      trigger: ['blur', 'change']
    }
  ]
}

export default {
  props: {
    priceYearName: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      dialogVisible: false,
      form: {
        ...defaultForm
      },
      rules,
      // 证书详情
      sslDetail: {
        // 名称
        productName: '',
        // 产品编码
        code: '',
        // 证书价格
        basePrice: {},
        price: {},
        // 证书类型
        validationType: '',
        // 是否支持多域名
        supportSan: 'N',
        // 支持的域名数量
        maxDomain: 0
      },
      detailObj: {
        productName: '产品名称',
        code: '产品编码',
        validationType: '证书类型',
        supportSan: '多域名'
      },
      // 联系人列表
      contactObj: {},
      // 企业列表
      organizationObj: {},
      dcvMethodObj: DCV_METHOD,
      orzLoading: false,
      csrLoading: false
    }
  },
  computed: {
    // 计算当前证书的价格列表
    priceObj() {
      const obj = {}
      const { price } = this.sslDetail
      Object.keys(price).forEach(key => {
        const yearName = this.priceYearName[key] || ''
        const year = yearName.replace('年', '')
        obj[year] = {
          year,
          name: yearName,
          price: price[key]
        }
      })
      return obj
    },

    // 已输入多少行域名
    domainRows() {
      if (this.form.domains === '') return 0
      return this.form.domains.trim().split(/[\r\n]+/).length
    }
  },
  created() {
    this.getContactList()
    this.getOrganizationList()
  },
  methods: {
    // 对话框显示
    show(row = {}) {
      this.dialogVisible = true
      this.sslDetail = {
        ...this.sslDetail,
        ...row
      }
    },

    // 获取联系人列表
    async getContactList() {
      this.loading = true
      try {
        const { data: res } = await getSslContactPage({
          page: 1,
          limit: 200
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = obj.list || []
        arr.forEach(item => {
          this.contactObj[item.id] = item
        })
      } finally {
        this.loading = false
      }
    },

    // 获取企业列表
    async getOrganizationList() {
      this.orzLoading = true
      try {
        const { data: res } = await getSslOrganizationPage({
          page: 1,
          limit: 200
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        const arr = obj.list || []
        arr.forEach(item => {
          this.organizationObj[item.id] = item
        })
      } finally {
        this.orzLoading = false
      }
    },

    // 根据联系人信息生成 csr
    async generateCsr() {
      this.csrLoading = true
      const { domains, contactId } = this.form
      if (!contactId) {
        return this.$msg.error('请先选择联系人')
      }

      try {
        const { data: res } = await generateCrs({
          ...this.contactObj[contactId],
          domainName: domains.trim().split(/[\r\n]+/) + ''
        })
        if (res.code !== 1) return
        this.form.csr = res.data
        this.form.privateKey = res.privateKey
      } finally {
        this.csrLoading = false
      }
    },

    // 切换联系人，清空手动填写的csr
    handleContactChange(val) {
      this.form.csr = ''
      this.form.privateKey = ''
    },

    // 表单提交
    submit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        try {
          const {
            years,
            csr,
            privateKey,
            csrType,
            dcvMethod,
            domains,
            contactId,
            organizationId
          } = this.form

          // 构造域名信息
          const domainArr = domains.trim().split(/[\r\n]+/)
          const domainInfo = domainArr.map(domainName => {
            return {
              dcvEmail: '',
              dcvMethod,
              domainName
            }
          })

          // 联系人信息
          const administrator =
            contactId === 'default'
              ? {
                  email: this.$root.userinfo.mail || 'email@dns.com',
                  address: 'default',
                  city: 'default',
                  country: 'CN',
                  firstName: 'default',
                  idNumber: 'default',
                  idType: 'default',
                  job: 'default',
                  lastName: 'default',
                  mobile: 'default',
                  organation: 'default',
                  postCode: 'default',
                  state: 'default'
                }
              : this.contactObj[contactId]

          const { data: res } = await doBuySsl({
            // 产品名称
            productName: this.sslDetail.productName,
            // 证书产品 code
            productCode: this.sslDetail.code,
            // 购买年限
            years,
            // 传递参数，
            params: {
              // 联系人信息
              administrator,
              // 公司信息
              organizationInfo:
                this.sslDetail.validationType == 'dv'
                  ? undefined
                  : organizationId === 'default'
                  ? {
                      organizationMobile: 'default',
                      idType: 'default',
                      organizationAddress: 'default',
                      organizationCity: 'default',
                      organizationCountry: 'CN',
                      organizationName: 'default',
                      organizationPostCode: 'default',
                      organizationRegNumber: 'default'
                    }
                  : this.organizationObj[organizationId],
              // 【手动填写】需要传递，可根据联系人信息生成 或 手动输入；【系统生成】不需要。
              csr: csrType === 'default' ? '' : csr,
              // 【手动填写】需要传递，可根据联系人信息生成 或 手动输入；【系统生成】不需要。
              privateKey: csrType === 'default' ? '' : privateKey,
              // 域名信息
              domainInfo,
              // 域名验证方式，默认使用这个值，如果 domainInfo 中存在 dcvMethod，则使用 domainInfo 中的
              dcvMethod,
              // 默认为 other
              server: 'other',

              // 财务人员，跟联系人信息一致
              finance: administrator,
              // 技术人员，跟联系人信息一致
              tech: administrator,
              uniqueValue: ''
            },
            refId: ''
            //   verificationPic: {},
            //   domainVerificationPic: {}
          })
          if (res.code !== 1) return
          this.$msg.success('下单成功')

          // 前往支付页面
          this.$router.push({
            name: 'Order',
            params: { orderId: (res.data || {}).orderId }
          })
        } finally {
          this.$refs.dialogRef.btnLoading = false
        }
      })
    },

    // 对话框关闭
    closed() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
