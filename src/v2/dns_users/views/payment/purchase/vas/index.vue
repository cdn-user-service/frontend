<template>
  <div class="">
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
            <TitleBorder title="可选增值业务" />
            <el-table
              :data="vasList"
              size="mini"
              style="margin: 0 0 40px; width:100%;"
            >
              <el-table-column
                prop="attrKeyName"
                label="商品名称"
                min-width="120"
              >
                <template #default="{ row }">
                  <strong>
                    {{ row.attrKeyName }}
                  </strong>
                </template>
              </el-table-column>
              <el-table-column prop="attrPrice" label="单价" min-width="140">
                <template #default="{ row }">
                  <span class="text-price">
                    {{ row.attrPrice | priceFormat }} /
                    {{ row.attrValue }} {{ row.attrUnit }} / 年
                  </span>
                </template>
              </el-table-column>
              <el-table-column width="200" label="购买数量">
                <template #default="{ row }">
                  <div class="py-xs">
                    <el-input-number
                      v-model="row.value"
                      size="small"
                      :precision="0"
                      :step="+row.attrValue"
                      :min="0"
                      @change="changeNum(row)"
                    ></el-input-number>
                    <span style="margin-left:5px;">{{ row.attrUnit }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- <FreeDomainSelect text="增值业务" ref="FreeDomainSelectRef" /> -->
            <TitleBorder class="mt-lg" title="绑定域名（必填）" />
            <div class="text-sm text-ants-text-4 mt-xs">
              <!-- DNS 解析套餐可独立购买，您可以选择购买套餐后，前往控制台绑定域名 -->
              您需要先添加域名才能购买增值业务，<router-link to="/dns/domain"
                >还没有域名？</router-link
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
                  style="font-size: 16px;"
                  class="el-icon-error cursor-color text-lg"
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
                  {{ item }}
                  <span> 年</span>
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
              年
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
            <ul class="p-lg pb-xs bg-ants-bg-3 mb-lg rounded-2xl">
              <li class="font-bold mb-df">
                <TitleBorder title="已选择商品" />
              </li>
              <li
                class="border-t border-ants-border-2 py-sm"
                v-for="item in activePrice.goods"
                :key="item.id"
              >
                <span class="">{{ item.name }}</span>
                <div class="flex justify-between items-center mt-xs">
                  <span class="text-sm text-ants-text-3"
                    >{{ item.value }} {{ item.unit }}</span
                  >
                  <span class="text-sm text-ants-text-3"
                    >{{ item.price * 100 | priceFormat }}</span
                  >
                </div>
              </li>
            </ul>

            <div class="px-lg">
              <div class="flex justify-between items-center py-sm">
                <span class="text-ants-text-3">购买时长：</span>
                <span class="font-bold">{{ sum }} 年</span>
              </div>
              <div class="flex justify-between items-center mt-sm">
                <span class="text-ants-text-3">合计费用：</span>
                <div>
                  <span class="text-price text-4xl">{{
                    activePrice.price * 100 | priceFormat
                  }}</span>
                </div>
              </div>
            </div>

            <div class="my-lg flex items-center px-lg">
              <el-checkbox v-model="checked"></el-checkbox>
              <div class="ml-xs">
                <span>我已阅读并同意</span>
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

    <SelectDomainDialog
      @getSelectDomains="getSelectDomains"
      text="增值业务"
      good-type="vas"
      ref="SelectDomainDialogRef"
    />
  </div>
</template>

<script>
// api
import {
  createExtraOrder,
  getCommonExtraList
} from '@/v2/dns_users/api/dns/plan'

// import FreeDomainSelect from './components/FreeDomainSelect'
import SelectDomainDialog from '../plans/SelectDomainDialog.vue'

export default {
  components: {
    // FreeDomainSelect,
    SelectDomainDialog
  },

  data() {
    return {
      priceLoading: false,
      btnLoading: false,
      checked: false,

      sum: 1, // 购买时长

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

      vasList: [
        // {
        //   id: 8,
        //   attrKeyName: 'QPS防护',
        //   attrUnit: 'w Q/S',
        //   attrValue: 1,
        //   attrType: 'int',
        //   attrPrice: 10000,
        //   value: 0
        // }
      ],

      selectDomainsArr: []
    }
  },
  computed: {
    activePrice() {
      let price = 0
      const activeGoodsArr = []
      this.vasList.map(item => {
        if (item.value > 0) {
          const nowPrice = (item.value / item.attrValue) * item.attrPrice
          price += nowPrice
          activeGoodsArr.push({
            id: item.id,
            name: item.attrKeyName,
            value: item.value,
            unit: item.attrUnit,
            price: nowPrice / 100
          })
        }
      })
      price *= this.sum
      return {
        price: (this.selectDomainsArr.length * price) / 100,
        goods: activeGoodsArr
      }
    }
  },
  created() {
    this.getCommonExtraListData()
  },
  mounted() {
    // this.$refs.FreeDomainSelectRef.getDomainsByGoodsId()
  },
  methods: {
    /**
     * @description: 获取可购买增值业务列表
     */

    async getCommonExtraListData() {
      this.$root.loading = true
      const { data: res } = await getCommonExtraList({
        key: '',
        pagenum: 1,
        pagesize: 100
      })
      this.$root.loading = false
      if (res.code !== 1) return

      this.vasList =
        res.data &&
        res.data.list.map(item => {
          return {
            ...item,
            value: 0
          }
        })
    },

    changeTime(val) {
      this.customTime = val
      this.sum = val
    },

    // 自定义时长
    changeCustomTime(val) {
      this.sum = val
    },

    /**
     * @description: 显示选择域名对话框
     */

    showSelectDomainDialog() {
      if (!this.selectDomainsArr.length) {
        this.$refs.SelectDomainDialogRef.showDialog()
      } else {
        this.$refs.SelectDomainDialogRef.dialogVisible = true
      }
    },

    /**
     * @description: 获取选中域名数组
     * @param {*} data
     */

    getSelectDomains(data = []) {
      this.selectDomainsArr = data
    },

    /**
     * @description: 提交订单
     */

    async goOrder() {
      // 判断是否选择域名
      // const domain = this.$refs.FreeDomainSelectRef.domain
      const domainArr = this.selectDomainsArr

      if (!domainArr.length) {
        return this.$alert(
          '您需要选择要绑定的域名才能购买增值业务',
          '未选择绑定域名',
          {
            confirmButtonText: '确定',
            type: 'info',
            center: true
          }
        )
      }

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

      // 构造所选增值业务 JSON数据
      const vasInfoArr = []
      this.vasList.forEach(item => {
        if (item.value > 0) {
          const nowPrice = (item.value / item.attrValue) * item.attrPrice
          vasInfoArr.push({
            id: item.id,
            value: item.value / item.attrValue,
            name: item.attrKeyName,
            unit: item.attrUnit,
            price: nowPrice
          })
        }
      })

      if (this.activePrice.price == 0 || !vasInfoArr.length) {
        return this.$msg.error('请选择要购买的商品！')
      }

      this.btnLoading = true

      const orderExtra = JSON.stringify({
        extra_info: vasInfoArr
      })

      const { data: res } = await createExtraOrder({
        domain: domainArr + '',
        sum: this.sum,
        orderExtra: orderExtra, // 产品属性内容，JSON格式的数据
        couponId: 1 // TODO: 优惠券，暂时不用管
      })

      this.btnLoading = false

      if (res.code !== 1) return

      this.$router.push({
        name: 'Order',
        params: { orderId: res.data.orderId }
      })
    },

    // 购买数量改变，保证数值不为空
    changeNum(row) {
      const currentValue = row.value
      const stepValue = row.attrValue
      if (currentValue % stepValue !== 0) {
        this.$nextTick(() => {
          row.value = currentValue + (stepValue - (currentValue % stepValue))
        })
      }
    }
  }
}
</script>
