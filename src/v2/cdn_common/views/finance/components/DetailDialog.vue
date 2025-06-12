<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    class="order-detail-dialog"
    title="订单详情"
    width="900px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="rounded-xl py-sm px-df bg-ants-bg-3 -mt-sm">
      <TitleBorder title="订单数据" />
    </div>

    <ul class="py-lg space-y-8 p-lg">
      <li>
        <span class="order-detail-title">
          {{ antsT('订单号') }}
        </span>
        <span>
          {{ orderData.serialNumber }}
        </span>
      </li>
      <li>
        <span class="order-detail-title">
          {{ antsT('订单类型') }}
        </span>
        <el-tag size="mini">
          {{ orderType[orderData.orderType] }}
        </el-tag>
      </li>
      <li>
        <span class="order-detail-title">
          {{ antsT('订单金额') }}
        </span>
        <strong class="text-price"
          >{{ orderData.payable | priceFormat }}</strong
        >
      </li>
      <li>
        <span class="order-detail-title">
          {{ antsT('订单状态') }}
        </span>
        <span
          v-if="orderData.status"
          :class="statusObj[orderData.status].class"
        >
          {{ antsT(statusObj[orderData.status].name) }}
        </span>
      </li>
      <li>
        <span class="order-detail-title">
          {{ antsT('创建时间') }}
        </span>
        <span>{{ orderData.createTime }}</span>
      </li>
      <!-- <li v-for="(item, key) in orderObj" :key="key">
          <span class="inline-block mr-sm text-ants-text-4" style="width:80px">
            {{item}}
          </span>
          <span>{{orderData[key] || '-'}}</span>
        </li> -->
    </ul>

    <div class="rounded-xl py-sm px-df bg-ants-bg-3 mb-lg">
      <TitleBorder title="商品数据" />
    </div>
    <!-- CDN套餐购买 -->
    <ul
      class="space-y-8 pl-lg"
      v-if="orderData.orderType == 10 || orderData.orderType == 13"
    >
      <li>
        <span class="order-detail-title">{{ antsT('套餐名称') }}</span>
        <span class="font-bold">{{ planData.name }}</span>
      </li>
      <li>
        <span class="order-detail-title">{{ antsT('计费方式') }}</span>
        <el-tag size="small">{{ antsT('流量月结') }}</el-tag>
      </li>
      <li>
        <span class="order-detail-title">{{ antsT('流量规格') }}</span>
        <strong class="text-primary" v-if="planData.attrObj">
          {{ flowUnit(planData.attrObj.flow) }}/{{ antsT('月') }}
        </strong>
      </li>
      <li v-if="orderData.orderType == 10">
        <span class="order-detail-title">{{ antsT('套餐单价') }}</span>
        <span v-for="(item, key) in planData.priceObj" :key="key">
          <span
            class="text-price"
            v-if="item.status == 1 && buyObj.type == key"
          >
            {{ item.value | priceFormat }}
            /{{ antsT(`${priceName[key]}`) }}
          </span>
        </span>
      </li>
      <li v-if="orderData.orderType == 10">
        <span class="order-detail-title">{{ antsT('购买时长') }}</span>
        <span class="font-bold"
          >{{ buyObj.sum }} {{ buyObj.type != 'y' ? '个' : '' }}
          {{ antsT(`${priceName[buyObj.type]}`) }}
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
            <div class="bg-ants-bg-1 pb-lg" style="margin-bottom:-25px;">
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
    <ul class="space-y-8 pl-lg" v-else-if="orderData.orderType == 11">
      <li>
        <span class="order-detail-title">{{ antsT('商品名称') }}</span>
        <span class="font-bold">{{ antsT('CDN套餐续费') }}</span>
      </li>
      <li>
        <span class="order-detail-title">{{ antsT('套餐单价') }}</span>
        <span class="text-price"
          >{{ orderData.payable / buyObj.sum | priceFormat }} / {{
            priceName[buyObj.type]
          }}
        </span>
      </li>
      <li>
        <span class="order-detail-title">{{ antsT('续费时长') }}</span>
        <span
          >{{ buyObj.sum }} {{ buyObj.type != 'y' ? '个' : ''
          }}{{ priceName[buyObj.type] }}</span
        >
      </li>
    </ul>

    <!-- 增值业务购买 -->
    <ul class="space-y-8 pl-lg" v-if="orderData.orderType == 12">
      <li>
        <span class="order-detail-title">{{ antsT('商品名称') }}</span>
        <span class="font-bold">{{ planData.name }}</span>
      </li>
      <li>
        <span class="order-detail-title">{{ antsT('生效日期') }}</span>
        <span>{{ $dayjs(planData.startTime).format('YYYY-MM-DD') }}</span>
      </li>
      <li>
        <span class="order-detail-title">{{ antsT('商品单价') }}</span>
        <span v-for="(item, key) in planData.priceObj" :key="key">
          <span
            class="text-price"
            v-if="item.status == 1 && buyObj.type == key && priceName[key]"
          >
            {{ item.value | priceFormat }} /
            {{ antsT(priceName[key]) }}
          </span>
        </span>
      </li>
      <li>
        <span class="order-detail-title">{{ antsT('购买时长') }}</span>
        <span
          >{{ buyObj.sum }} {{ buyObj.type != 'y' ? '个' : '' }}
          {{ priceName[buyObj.type] }}
        </span>
      </li>
      <li class="flex">
        <span class="order-detail-title">{{ antsT('商品配置') }}</span>
        <div class="p-lg bg-ants-bg-2 rounded-2xl flex-1">
          <div v-if="planData.attrObj && planData.attrObj.flow" class="text-sm mb-lg">
            <span class="mr-sm inline-block" style="min-width: 80px;">{{
              antsT('流量')
            }}</span>
            <strong>{{ getFlow(planData.attrObj.flow) }} </strong>
          </div>

          <PlanAttr :attr-obj="planData.attrObj" 
          hidden-attr
          class="text-sm space-y-8" />
        </div>
      </li>
    </ul>

    <template slot="footer">
      <ants-button
        size="small"
        type="info"
        text="关 闭"
        @click="dialogVisible = false"
      />
    </template>
  </ants-dialog>
</template>

<script>
import { orderType, priceName } from '@/global/enum'
import PlanAttr from '@/v2/cdn_common/components/Plan/Attr'
import { flowUnit } from '@/utils/unit'

export default {
  props: {
    statusObj: Object
  },
  components: {
    PlanAttr
  },
  data() {
    return {
      dialogVisible: false,
      // 订单详情数据
      orderData: {},

      // 订单数据
      orderObj: {
        serialNumber: '订单号',
        orderType: '订单类型',
        status: '订单状态',
        payable: '订单金额',
        createTime: '创建时间'
      },

      // 单价
      priceObj: {},
      // 购买时长、数量
      buyObj: {},
      // 商品数据
      productObj: {},

      // 订单类型
      orderType,
      priceName
    }
  },
  computed: {
    planData() {
      const productObj = this.productObj
      const attrArr =
        (productObj.attrJson && JSON.parse(productObj.attrJson)) || []
      const attrObj = {}
      attrArr.forEach(item => {
        attrObj[item.attr] = item.value
      })

      return {
        name: productObj.name,
        attrObj,
        priceObj: productObj.productJson && JSON.parse(productObj.productJson)
      }
    }
  },
  methods: {
    flowUnit,

    // 对话框显示
    showDialog(row = {}) {
      this.dialogVisible = true
      this.orderData = row
      // 订单数据
      const { serialNumber, orderType, status, payable, createTime } = row

      const OBJ = (row.initJson && JSON.parse(row.initJson)) || {}
      console.log(OBJ)
      if (typeof OBJ.price_obj === 'string') {
        this.priceObj = JSON.parse(OBJ.price_obj)
      }
      if (typeof OBJ.price_obj === 'object') {
        this.priceObj = OBJ.price_obj
      }

      if (typeof OBJ.buy_obj === 'string') {
        this.buyObj = JSON.parse(OBJ.buy_obj)
      }
      if (typeof OBJ.buy_obj === 'object') {
        this.buyObj = OBJ.buy_obj
      }

      if (typeof OBJ.product_obj === 'string') {
        this.productObj = JSON.parse(OBJ.product_obj)
      }

      if (typeof OBJ.product_obj === 'object') {
        this.productObj = OBJ.product_obj
      }

      // 续费用的 type
      if (OBJ.type) {
        this.buyObj.type = OBJ.type
      }
      console.log(this.priceObj)
      console.log(this.buyObj)
      console.log(this.productObj)
    },

    // 动态计算流量单位
    getFlow(flow) {
      let unit = 'GB'
      let val = flow
      if (flow >= 1000) {
        unit = 'TB'
        val = val / 1000
      }
      return `${val} ${unit}`
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {},

    // 表单重置
    resetForm() {}
  }
}
</script>

<style lang="scss">
.order-detail-dialog {
  .order-detail-title {
    display: inline-block;
    width: 140px;
    margin-right: 10px;
    color: theme('colors.ants-text-4');
  }

  .el-collapse-item__header {
    background-color: theme('colors.ants-bg-1');
  }
}
</style>
