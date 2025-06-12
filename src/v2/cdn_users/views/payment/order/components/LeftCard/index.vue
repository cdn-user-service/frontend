<template>
  <el-card class="mb-sm order-left-card">
    <el-skeleton :rows="8" :loading="$root.loading" animated>
      <template>
        <TitleBorder class="mb-sm" title="订单详情" />
        <div class="rounded-2xl bg-ants-bg-2 p-lg">
          <ul class="space-y-8">
            <li>
              <span class="order-left-title">{{ antsT('商品类型') }}</span>
              <span>{{ antsT(title) }}</span>
            </li>
            <li>
              <span class="order-left-title">{{ antsT('订单号') }}</span>
              <span>{{ orderData.serialNumber }}</span>
            </li>
            <li>
              <span class="order-left-title">{{ antsT('下单时间') }}</span>
              <span>{{ orderData.createTime }}</span>
            </li>
            <li
              v-if="
                orderData.orderType == 10 ||
                orderData.orderType == 11 ||
                orderData.orderType == 12
              "
            >
              <span class="order-left-title">{{ antsT('购买时长') }}</span>
              <span
                >{{ orderData.buy_obj.sum }}
                <span v-if="orderData.buy_obj.type != 'y'">{{
                  antsT('个')
                }}</span
                >{{
                  antsT(
                    priceName[orderData.buy_obj.type || orderData.priceType]
                  )
                }}</span
              >
            </li>
          </ul>
        </div>

        <TitleBorder class="mt-lg mb-sm" title="商品详情" />
        <div class="rounded-2xl bg-ants-bg-2 p-lg">
          <!-- CDN套餐购买 -->
          <ul
            class="space-y-8"
            v-if="orderData.orderType == 10 || orderData.orderType == 13"
          >
            <li>
              <span class="order-left-title">{{ antsT('套餐名称') }}</span>
              <span class="font-bold">{{ planData.name }}</span>
            </li>
            <li>
              <span class="order-left-title">{{ antsT('计费方式') }}</span>
              <el-tag size="small">{{ antsT('流量月结') }}</el-tag>
            </li>
            <li>
              <span class="order-left-title">{{ antsT('流量规格') }}</span>
              <strong class="text-primary" v-if="planData.attrObj">
                {{ flowUnit(planData.attrObj.flow) }}/{{ antsT('月') }}
              </strong>
            </li>
            <li v-if="orderData.orderType == 10">
              <span class="order-left-title">{{ antsT('套餐单价') }}</span>
              <span v-for="(item, key) in planData.priceObj" :key="key">
                <span
                  class="text-price"
                  v-if="item.status == 1 && orderData.buy_obj.type == key && priceName[key]"
                >
                  {{ item.value | priceFormat }} /
                  {{ antsT(priceName[key]) }}
                </span>
              </span>
            </li>
            <li class="text-sm space-y-2">
              <el-collapse accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div class="font-bold mb-sm text-primary">
                      {{ antsT('套餐配置详情') }}
                    </div>
                  </template>
                  <div class="bg-ants-bg-2 pb-lg" style="margin-bottom: -25px">
                    <PlanAttr
                      :attr-obj="planData.attrObj"
                      class="space-y-5 text-sm"
                    />
                  </div>
                </el-collapse-item>
              </el-collapse>
            </li>
          </ul>

          <!-- 套餐续费 -->
          <ul class="space-y-8" v-else-if="orderData.orderType == 11">
            <li>
              <span class="order-left-title">{{ antsT('商品名称') }}</span>
              <span class="font-bold">{{ antsT('CDN套餐续费') }}</span>
            </li>
            <li>
              <span class="order-left-title">{{ antsT('续费时长') }}</span>
              <span
                >{{ orderData.buy_obj.sum }} {{ antsT('个') }}
                {{ antsT(priceName[orderData.priceType]) }}</span
              >
            </li>
            <li>
              <span class="order-left-title">{{ antsT('套餐单价') }}</span>
              <span
                >{{ (orderData.payable / orderData.buy_obj.sum) | priceFormat }}
                /
                {{ antsT(priceName[orderData.priceType]) }}
              </span>
            </li>
          </ul>

          <!-- 增值业务购买 -->
          <ul class="space-y-8" v-if="orderData.orderType == 12">
            <li>
              <span class="order-left-title">{{ antsT('商品名称') }}</span>
              <span class="font-bold">{{ planData.name }}</span>
            </li>
            <li>
              <span class="order-left-title">{{ antsT('生效日期') }}</span>
              <span class="font-bold">{{
                $dayjs(planData.startTime).format('YYYY-MM-DD')
              }}</span>
            </li>
            <li>
              <span class="order-left-title">{{ antsT('商品单价') }}</span>
              <span v-for="(item, key) in planData.priceObj" :key="key">
                <span
                  class="text-price"
                  v-if="item.status == 1 && orderData.buy_obj.type == key && priceName[key]"
                >
                  {{ item.value | priceFormat }} /
                  {{ antsT(priceName[key]) }}
                </span>
              </span>
            </li>
            <li class="flex">
              <span class="order-left-title">{{ antsT('商品配置') }}</span>
              <div>
                <div
                  v-if="planData.attrObj && planData.attrObj.flow"
                  class="text-sm mb-lg"
                >
                  <span class="mr-sm inline-block" style="min-width: 100px">{{
                    antsT('流量')
                  }}</span>
                  <strong>{{ flowUnit(planData.attrObj.flow) }} </strong>
                </div>

                <PlanAttr
                  :attr-obj="planData.attrObj"
                  hidden-attr
                  class="text-sm space-y-8"
                />
              </div>
            </li>
          </ul>
        </div>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
// 订单类型
import { orderType, priceName, getBillName } from '@/global/enum'
import PlanAttr from '@/v2/cdn_common/components/Plan/Attr'
import { flowUnit } from '@/utils/unit'

export default {
  components: {
    PlanAttr
  },
  props: {
    orderData: Object
  },
  data() {
    return {
      priceName
    }
  },
  computed: {
    title() {
      return orderType[this.orderData.orderType]
    },

    // 套餐详情
    planData() {
      if (!this.orderData.product_obj) return
      const productObj = this.orderData.product_obj
      const attrArr =
        (productObj.attrJson && JSON.parse(productObj.attrJson)) || []
      const attrObj = {}
      attrArr.forEach((item) => {
        attrObj[item.attr] = item.value
      })

      console.log(attrObj)

      return {
        name: productObj.name,
        attrObj,
        priceObj: productObj.productJson && JSON.parse(productObj.productJson)
      }
    }
  },
  created() {},
  methods: {
    flowUnit
  }
}
</script>

<style lang="scss" scoped>
.order-left-title {
  display: inline-block;
  width: 80px;
  margin-right: 20px;
  color: theme('colors.ants-text-4');
}
</style>

<style lang="scss">
.order-left-card {
  .el-collapse-item__header {
    background-color: theme('colors.ants-bg-2');
  }
}
</style>
