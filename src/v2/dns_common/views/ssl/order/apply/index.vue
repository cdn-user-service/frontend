<template>
  <el-skeleton :rows="10" animated :loading="loading">
    <el-card class="content-box">
      <TitleBorder title="证书信息" class="mb-df" />
      <el-row :gutter="10">
        <el-col :span="3" v-for="(item, key) in detailObj" :key="key">
          <div class="p-lg rounded-2xl font-semibold bg-ants-bg-4" style="height:90px;">
            <div class="mb-lg text-ants-text-3">{{ item }}</div>
            <div class="text-sm truncate">
              {{ certDetail[key] }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <CancelOrder :title="certDetail.status" v-if="currentStep === -1" />

    <el-card class="content-box" v-else>
      <div slot="header">
        <TitleBorder title="签发流程" />

        <ul
          class="step-box flex items-center pt-lg pb-df"
          style="max-width:800px;"
        >
          <li
            v-for="(item, idx) in ['提交申请', '验证信息', '签发完成']"
            :key="idx"
            class="flex-1 flex items-center text-ants-text-1 justify-center relative"
          >
            <div class="flex items-center relative bg-ants-bg-1 z-10 px-df">
              <span
                class="inline-block rounded-full text-center text-3xl"
                :class="stepClass(idx)"
                style="height:40px;line-height:40px;width:40px;"
              >
                <i v-if="currentStep > idx" class="el-icon-check"></i>
                <span v-else>{{ idx + 1 }}</span>
              </span>
              <div class="pl-df font-semibold text-2xl">
                {{ item }}
              </div>
            </div>

            <span
              v-if="idx < 2"
              class="absolute border-t-4 border-ants-border-2 border-dashed w-full"
              style="left:50%;"
            ></span>
          </li>
        </ul>
      </div>

      <!-- <template v-if="currentStep === 0">
        <Step1
          ref="Step1Ref"
          @changeStep="changeStep"
        />
      </template> -->
      <template v-if="currentStep === 1">
        <Step2 ref="Step2Ref" @refresh="getSslDetail" />
      </template>

      <template v-if="currentStep === 2">
        <Step3 ref="Step3Ref" @refresh="getSslDetail" />
      </template>
    </el-card>
  </el-skeleton>
</template>

<script>
// import Step1 from './Step-1'
import Step2 from './Step-2'
import Step3 from './Step-3'
import CancelOrder from './CancelOrder'

import { priceFormatFun } from '@/utils/public'
import { CERT_STATUS } from '../cert-params'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getSslCertDetail } = require(`@/v2/${PROCESS_NAME}/api/dns/ssl`)

const detailObj = {
  productName: '产品名称',
  orderId: '订单号',
  certId: 'CA订单号',
  years: '证书年限',
  price: '证书价格',
  beginDate: '开始时间',
  endDate: '结束时间',
  status: '状态'
}

export default {
  components: {
    // Step1,
    Step2,
    Step3,
    CancelOrder
  },
  data() {
    return {
      loading: true,
      detailObj,
      // 当前证书详情
      certDetail: {
        // 联系人信息
        administrator: {},
        // CSR验证信息
        csr: '',
        // 绑定域名、验证方式，
        dcvList: [],
        DCVdns: {},
        DCVfile: {}
      },

      currentStep: 0
    }
  },
  computed: {
    stepClass() {
      return step => {
        const classObj = {
          default: 'bg-ants-bg-4 text-ants-text-1',
          current: 'bg-primary text-white',
          done: 'bg-primary-light text-primary'
        }
        if (this.currentStep === step) {
          return classObj.current
        } else if (this.currentStep > step) {
          return classObj.done
        } else {
          return classObj.default
        }
      }
    }
  },
  created() {
    this.getSslDetail()
  },
  methods: {
    // 切换步骤
    changeStep(step) {
      this.currentStep = step
    },

    // 获取证书详情数据
    async getSslDetail() {
      this.loading = true
      // 判断当前到第几步
      try {
        const { data: res } = await getSslCertDetail({
          certId: this.$route.query.certId
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        // 订单信息
        const orderInfo = obj.orderInfo || {}
        // 购买的证书产品信息
        const orderExtra = JSON.parse(orderInfo.orderExtra || '{}')
        // 证书信息
        const dataInfoObj = (obj.dataInfoObj || {}).data || {}
        // 证书申请参数
        const applyParams = dataInfoObj.applyParams || {}

        console.log(res)

        this.certDetail = {
          // 证书订单号
          certId: obj.certId,
          // 购买订单号
          orderId: obj.orderId,
          // 产品名称
          productName: orderExtra.productName,
          // 证书价格
          price: priceFormatFun(orderInfo.buyPayable),
          // 购买年限
          years: orderExtra.years + this.antsT('年'),
          // 证书状态
          status: CERT_STATUS[obj.certStatus],

          // CSR验证信息
          csr: applyParams.csr,
          // 联系人信息
          administrator: applyParams.Administrator || {},

          // 绑定域名、验证方式，申请中不可修改域名，可以修改验证方式
          dcvList: dataInfoObj.dcvList || [],
          // DNS验证信息
          DCVdns: {
            // 主机记录
            DCVdnsHost: dataInfoObj.DCVdnsHost,
            // 记录值
            DCVdnsValue: dataInfoObj.DCVdnsValue,
            // 记录类型
            DCVdnsType: dataInfoObj.DCVdnsType
          },
          // 文件验证信息
          DCVfile: {
            // 文件名
            DCVfileName: dataInfoObj.DCVfileName,
            // 文件内容
            DCVfileContent: dataInfoObj.DCVfileContent,
            // 文件路径
            DCVfilePath: dataInfoObj.DCVfilePath
          },

          // 申请成功后才有的数据
          // 开始时间，申请成功后才有，没有就显示购买时间
          beginDate:
            dataInfoObj.beginDate || (orderInfo.payRecord || {}).createtime,
          // 结束时间
          endDate: dataInfoObj.endDate,
          // caCertificate 证书链
          caCertificate: dataInfoObj.caCertificate,
          // certificate
          certificate: dataInfoObj.certificate,
          // 私钥
          privateKey: dataInfoObj.privateKey
        }
        console.log('certDetail', this.certDetail)

        // 判断当前到第几步
        // 1、已取消、已吊销、申请失败
        if (['CANCELLED', 'REVOKED', 'FAILED'].includes(obj.certStatus)) {
          this.currentStep = -1
          return
        }

        // 2、申请中
        if (obj.certStatus === 'PENDING') {
          this.currentStep = 1
          this.$nextTick(() => {
            this.$refs.Step2Ref.init(this.certDetail)
          })
        }

        // 3、申请成功，已重签，已续签
        if (['COMPLETE', 'REISSUED', 'RENEWED'].includes(obj.certStatus)) {
          this.currentStep = 2
          this.$nextTick(() => {
            this.$refs.Step3Ref.init(this.certDetail)
          })
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
