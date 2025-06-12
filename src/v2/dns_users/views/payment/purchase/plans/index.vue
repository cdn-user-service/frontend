<template>
  <div class="purchase-plans-box">
    <div class="animated fadeIn">
      <el-row :gutter="20">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 16 }"
          :md="{ span: 16 }"
          :lg="{ span: 16 }"
          :xl="{ span: 16 }"
        >
          <el-card class="mb-lg" v-loading="$root.loading">
            <TitleBorder title="可选解析套餐" class="mb-lg" />

            <el-row :gutter="20">
              <el-col
                :xs="{ span: 12 }"
                :sm="{ span: 8 }"
                :md="{ span: 8 }"
                :lg="{ span: 8 }"
                :xl="{ span: 8 }"
                v-for="item in planList"
                :key="item.id"
                class="mb-lg"
              >
                <div
                  @click="changePlan(item, item.productJson)"
                  class="plan-item py-lg px-xs border border-ants-border-3 text-center rounded-2xl"
                  :class="{ 'plan-item-active': item.id == activePlan.id }"
                >
                  <div class="font-bold text-3xl text-ants-text-2 my-lg">
                    {{ item.productName }}
                  </div>
                  <div
                    class="text-ants-text-3 text-sm m-0 px-xs truncate one_show_h"
                    style="width:100%;"
                  >
                    {{ item.productDescribe }}
                  </div>
                  <div class="my-lg">
                    <span class="text-price font-bold text-3xl"
                      >{{ item.productUnitPrice | priceFormat }}
                    </span>
                    <span class="text-sm font-bold">
                      /{{ unitObj[item.productUnit] }}
                    </span>
                    <el-tag
                      size="mini"
                      type="warning"
                      :effect="item.id == activePlan.id ? 'dark' : 'light'"
                    >
                      特惠</el-tag
                    >
                  </div>
                  <div
                    class="text-ants-text-4 text-sm my-lg"
                    style="text-decoration: line-through;"
                  >
                    {{ (item.productUnitPrice * 2) | priceFormat }} /{{
                      unitObj[item.productUnit]
                    }}
                  </div>
                </div>
              </el-col>
            </el-row>

            <div class="flex flex-wrap bg-ants-bg-3 p-lg plan-power">
              <div
                class="text-sm"
                v-for="item in productJson"
                :key="item.id"
                style="width:50%;margin:5px 0;"
              >
                <span
                  class="inline-block text-ants-text-4"
                  style="width: 120px"
                  >{{ item.attrKeyName }}</span
                >
                <span
                  v-if="item.attrType == 'bool'"
                  class="el-icon-success text-primary"
                ></span>
                <span v-else>{{ item.attrValue }} {{ item.attrUnit }}</span>
              </div>
            </div>
            <div
              class="p-lg bg-ants-bg-3"
              style="border-radius: 0 0 10px 10px;"
            >
              <span class="el-icon-question"></span>
              <span> 不了解套餐差异？ </span>
              <!-- <router-link to="/dns-vas"> 查看套餐对比详细>></router-link> -->
            </div>

            <div class="mt-xl border-t border-ants-border-3"></div>

            <TitleBorder class="mt-lg" title="绑定域名（选填）" />
            <div class="text-sm text-ants-text-4 mt-xs">
              DNS解析套餐可独立购买，您可以选择购买套餐后，前往控制台<router-link
                to="/dns/domain"
              >
                绑定域名</router-link
              >
            </div>
            <div class="py-lg">
              <span
                v-if="selectDomainsArr.length"
                class="inline-block bg-ants-bg-3 py-df px-lg rounded-xl"
              >
                <span
                  >已选择
                  <strong>{{ selectDomainsArr.length }}</strong> 个域名</span
                >
                <span
                  class="el-icon-edit mx-lg cursor-color text-xl"
                  style="font-size: 16px;"
                  @click="showSelectDomainDialog"
                ></span>
                <span
                  class="el-icon-error cursor-color text-xl"
                  style="font-size: 16px;"
                  @click="selectDomainsArr = []"
                ></span>
              </span>
              <el-button
                v-else
                icon="el-icon-plus"
                class="px-xl rounded-lg"
                @click="showSelectDomainDialog"
              >
                选择域名</el-button
              >
            </div>

            <TitleBorder class="my-lg" title="购买时长" />
            <div class="pb-lg">
              <el-radio-group
                v-model="radioTime"
                size="medium"
                @change="changeTime"
              >
                <el-radio-button
                  v-for="item in timeList"
                  :key="item"
                  :label="item"
                >
                  {{ item }} {{ unitObj[activePlan.productUnit] }}
                </el-radio-button>
                <el-radio-button :label="10">
                  自定义
                </el-radio-button>
              </el-radio-group>
            </div>
            <div class="pb-lg" v-if="radioTime == 10">
              <ants-input-number
                v-model="customTime"
                :precision="0"
                :step="1"
                :min="1"
                :max="10"
                @change="changeCustomTime"
              />
              {{ unitObj[activePlan.productUnit] }}
            </div>
          </el-card>
        </el-col>

        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 8 }"
          :md="{ span: 8 }"
          :lg="{ span: 8 }"
          :xl="{ span: 8 }"
        >
          <el-card>
            <div class="p-lg bg-ants-bg-3 mb-lg rounded-2xl">
              <div class="font-bold mb-lg">
                已选择套餐配置
              </div>
              <div class="flex justify-between items-center">
                <span class="text-ants-text-3">{{
                  activePlan.productName
                }}</span>
                <span class="font-bold"
                  >{{ activePlan.productUnitPrice | priceFormat }}
                  <span>/{{ unitObj[activePlan.productUnit] }}</span>
                  <span
                    class="text-ants-text-4 text-sm"
                    style="text-decoration: line-through;"
                  >
                    {{ activePlan.productUnitPrice | priceFormat }}
                    <span>/{{ unitObj[activePlan.productUnit] }}</span>
                  </span>
                </span>
              </div>
            </div>
            <div class="p-lg border-t border-ants-border-3 space-y-10">
              <div class="flex justify-between items-center pt-lg">
                <span class="text-ants-text-3">购买时长：</span>
                <span class="font-bold"
                  >{{ form.time }} {{ unitObj[activePlan.productUnit] }}</span
                >
              </div>
              <div class="flex justify-between items-center">
                <span class="text-ants-text-3">购买数量：</span>
                <span class="font-bold">× {{ form.num }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-ants-text-3">合计费用：</span>
                <div>
                  <span class="text-price text-4xl">{{
                    (activePrice * 100) | priceFormat
                  }}</span>
                </div>
              </div>
            </div>

            <div class="mb-lg px-lg flex items-center">
              <el-checkbox v-model="checked">
                <span>我已阅读并同意</span>
              </el-checkbox>
              <div class="ml-xs">
                <router-link to="/agreement"
                  >《DNS解析服务购买协议》</router-link
                >
              </div>
            </div>
            <div class="px-lg">
              <ants-button
                style="width:100%;"
                type="warning"
                @click="goOrder"
                class="ants-price-button"
                :loading="btnLoading"
                text="提交订单"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 选择域名对话框 -->
    <SelectDomainDialog
      @getSelectDomains="getSelectDomains"
      ref="SelectDomainDialogRef"
    />
  </div>
</template>

<script>
// api
import { getProductList, createOrder } from '@/v2/dns_users/api/dns/plan'

// import FreeDomainSelect from './FreeDomainSelect'
import SelectDomainDialog from './SelectDomainDialog'

export default {
  components: {
    // FreeDomainSelect,
    SelectDomainDialog
  },
  data() {
    return {
      checked: false, // 同意购买协议
      activePlan: {
        // 当前选择套餐
        id: this.$route.params.type,
        productServerGroupId: 0,
        productName: '',
        productUnit: '',
        productUnitPrice: 0 // 价格都是以分为单位的，显示的时候除以100
      },
      productJson: [], // 当前选中套餐参数
      planList: [], // 套餐列表
      form: {
        num: 1, // 购买数量
        time: 1, // 购买时长
        self: 0,
        cname: 0,
        url: 0,
        fz: 0,
        custom: 0,
        group: 0
      },

      // 自定义时长
      radioTime: 1,
      customTime: 10,
      timeList: [
        // 购买时长
        1,
        2,
        3,
        5
        // 10
      ],

      unitObj: {
        '1y': '年',
        '1s': '季',
        '1m': '月',
        '1d': '天',
        '1p': '次'
      },

      btnLoading: false,
      selectDomainsArr: []
    }
  },
  computed: {
    // 计算价格
    activePrice() {
      const price =
        (this.form.time *
          this.form.num *
          (this.selectDomainsArr.length || 1) *
          this.activePlan.productUnitPrice) /
        100
      return price
    }
  },
  created() {
    this.getPlanList()
  },
  methods: {
    // 获取所有套餐列表
    async getPlanList() {
      this.$root.loading = true
      try {
        const { data: res } = await getProductList({
          pagenum: 1,
          pagesize: 20
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        // 过滤掉免费套餐，并制定默认选中套餐
        const planArr = (obj.list || []).filter(item => {
          // 如果传递过来的id存在套餐数组内，
          if (item.id == this.activePlan.id) {
            this.activePlan = item
            this.productJson = JSON.parse(item.productJson || '[]')
          }
          return item.productUnitPrice != 0
        })

        if (!this.productJson.length && planArr.length) {
          this.activePlan = planArr[0]
          this.productJson = JSON.parse(planArr[0].productJson || '[]')
          // this.$refs.FreeDomainSelectRef.getDomainsByGoodsId(planArr[0].id)
        }
        this.planList = planArr || []
      } finally {
        this.$root.loading = false
      }
    },

    changeTime(val) {
      this.customTime = val
      this.form.time = val
    },

    // 自定义时长
    changeCustomTime(val) {
      this.form.time = val
    },

    // 显示选择域名对话框
    showSelectDomainDialog() {
      if (!this.selectDomainsArr.length) {
        this.$refs.SelectDomainDialogRef.showDialog()
      } else {
        this.$refs.SelectDomainDialogRef.dialogVisible = true
      }
    },

    // 获取选中域名数组
    getSelectDomains(data = []) {
      this.selectDomainsArr = data
    },

    // 创建订单，前往确认订单
    async goOrder() {
      // const postData = window.btoa('8')
      // 判断是否选择域名
      // const domain = this.$refs.FreeDomainSelectRef.domain
      const domainArr = this.selectDomainsArr
      // if (!domainArr.length) {
      //   return this.$alert(
      //     '您需要选择要绑定的域名才能购买套餐',
      //     '未选择绑定域名',
      //     {
      //       confirmButtonText: '确定',
      //       type: 'info',
      //       center: true
      //     }
      //   )
      // }

      // 判断选中套餐是否正确
      if (!this.checked) {
        return this.$alert(
          '您必须同意 《DNS解析服务购买协议》 才可以确认订单',
          '友情提示',
          {
            confirmButtonText: '确定',
            type: 'info',
            center: true
          }
        )
      }

      if (!this.activePlan.productUnitPrice) {
        return this.$msg.error('不能购买免费套餐')
      }

      this.btnLoading = true
      try {
        // 构造产品额外参数
        const orderExtra = JSON.stringify({
          // product_server_id: this.activePlan.productServerGroupId, // server服务组ID
          product_server_id: -1, // server服务组ID，-1代表后端自动分配
          product_id: this.activePlan.id,
          domain: domainArr + '', // 绑定域名
          extra_info: []
        })

        const { data: res } = await createOrder({
          productId: this.activePlan.id, // 产品ID
          sum: this.form.num * this.form.time, // 购买数量，有购买几年属性，所以要乘以年
          orderExtra: orderExtra, // 产品属性内容，JSON格式的数据
          couponId: 1 // 优惠券，暂时不用管
        })

        if (res.code !== 1) return

        this.$router.push({
          name: 'Order',
          params: { orderId: (res.data || {}).orderId }
        })
      } finally {
        this.btnLoading = false
      }
    },

    // 选择套餐
    changePlan(val, productJson) {
      this.activePlan = val
      this.productJson = JSON.parse(productJson || '[]')
      // 根据产品ID获取域名列表
      // this.$refs.FreeDomainSelectRef.getDomainsByGoodsId(val.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-item {
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    border-color: theme('colors.primary');
    box-shadow: 0px 0px 15px rgba(24, 125, 255, 0.2);
  }
}
.plan-item-active.plan-item {
  // background-color: #e8f2ff;
  // color: theme('colors.primary');
  border-color: theme('colors.primary');
  box-shadow: 0px 0px 15px rgba(24, 125, 255, 0.2);
  // .text-ants-text-4
  // .text-ants-text-3,
  .text-ants-text-2 {
    color: theme('colors.primary');
  }
  // .text-ants-text-3,
  // .text-ants-text-4 {
  //   opacity: 0.7;
  // }
}

.plan-power {
  border-radius: 10px 10px 0 0;
  margin-bottom: 1px;
}
.plan_title {
  line-height: 1;
  padding-left: 10px;
  border-left: 4px solid theme('colors.primary');
}
</style>
