<template>
  <div class="content-box animated fadeIn plan-purchase-box">
    <ul class="mb-xl text-center">
      <li class="text-primary text-4xl font-bold my-lg">
        — {{ antsT('CDN套餐') }} —
      </li>
      <li class="ants-font-4">
        {{ antsT('CDN产品最新上线，限时优惠，年付优惠更多哦！') }}
      </li>
    </ul>
    <el-skeleton :rows="8" :loading="$root.loading" animated>
      <template>
        <div style="max-width: 1600px" class="mx-auto">
          <el-row :gutter="20">
            <el-col
              :xs="{ span: 24 }"
              :sm="{ span: 12 }"
              :md="{ span: 6 }"
              :lg="{ span: 6 }"
              :xl="{ span: 6 }"
              v-for="(item, idx) in planList"
              :key="item.id"
              class="h-full"
            >
              <div
                class="wow fadeInUp py-lg mb-lg bg-ants-bg-1 shadow rounded-2xl"
              >
                <ul class="text-center p-lg border-b border-ants-border-3">
                  <li class="font-bold mb-lg text-2xl truncate">
                    {{ item.name }}
                  </li>

                  <li class="my-df">
                    {{ antsT('计费方式') }}：
                    <el-tag size="small" type="primary">{{
                      antsT(getBillName(item.attr.charging_mode))
                    }}</el-tag>
                  </li>

                  <!-- 流量计费 -->
                  <li v-if="item.attr.charging_mode == 1">
                    <div class="text-price space-x-3 truncate">
                      <span
                        v-for="(priceItem, priceKey) in item.priceObj"
                        :key="priceKey"
                        class="text-sm"
                      >
                        <template
                          v-if="priceItem.status == 1 && priceName[priceKey]"
                        >
                          <span class="text-3xl">{{
                            priceItem.value | priceFormat
                          }}</span>
                          /{{ antsT(priceName[priceKey]) }}
                        </template>
                      </span>
                    </div>
                    <div
                      class="mt-df text-sm text-ants-text-4 line-through truncate"
                    >
                      <span
                        v-for="(priceItem, priceKey) in item.priceObj"
                        :key="priceKey"
                      >
                        <template
                          v-if="priceItem.status == 1 && priceName[priceKey]"
                        >
                          {{ (priceItem.value * 2) | priceFormat }}/
                          {{ antsT(priceName[priceKey]) }}
                        </template>
                      </span>
                    </div>
                  </li>

                  <!-- 带宽计费 -->
                  <li v-else>
                    <div class="text-price truncate">
                      <span class="text-3xl">{{
                        item.attr.bandwidth | priceFormat
                      }}</span
                      >/Mbps/{{ antsT('月') }}
                    </div>
                    <div
                      class="mt-df text-sm text-ants-text-4 line-through truncate"
                    >
                      {{ (item.attr.bandwidth * 2) | priceFormat }}/Mbps/{{
                        antsT('月')
                      }}
                    </div>
                  </li>

                  <li class="py-sm px-lg mt-lg">
                    <div
                      :class="{ 'active-button': idx === 1 }"
                      class="buy-button font-bold rounded-full py-5 cursor-color border border-ants-border-3 text-ants-text-3"
                      @click="goOrderPage(item)"
                    >
                      {{
                        antsT(
                          item.attr.charging_mode == 1 ? '立即购买' : '申请使用'
                        )
                      }}
                    </div>
                  </li>
                </ul>

                <div class="flex justify-between pt-lg px-lg text-sm">
                  <span class="">{{ antsT('流量规格') }}</span>
                  <strong v-if="item.attr.charging_mode == 1">
                    {{ flowUnit(item.attr.flow) }}/{{ antsT('月') }}</strong
                  >
                  <strong v-else>-</strong>
                </div>

                <PlanAttr
                  class="p-lg text-sm space-y-6"
                  :attr-obj="item.attr"
                />
              </div>
            </el-col>
          </el-row>

          <div class="text-center">
            <el-pagination
              style="margin-top: 0"
              background
              layout="total, prev, pager, next, jumper"
              :total="total"
              small
              :page-size="queryInfo.limit"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.page"
            />
          </div>
        </div>

        <el-empty
          :description="antsT('还没有任何可购买套餐，请联系客服！')"
          v-if="!planList.length"
        >
        </el-empty>
      </template>
    </el-skeleton>

    <ApplyPlanDialog ref="ApplyPlanDialogRef" />
  </div>
</template>

<script>
import { getPlanList, applyUseBandwith } from '@/v2/cdn_users/api/cdn/plan'
import { getOrderDetail } from '@/v2/cdn_users/api/cdn/finance'

import PlanAttr from '@/v2/cdn_common/components/Plan/Attr'

// 产品属性
import { getBillName, priceName } from '@/global/enum'

import ApplyPlanDialog from '@/v2/cdn_users/components/ApplyPlanDialog'

// 验证提示实名认证、绑定手机号
import { showTipsAlert } from '@/v2/cdn_users/extra/computed'
import { flowUnit } from '@/utils/unit'

export default {
  components: {
    PlanAttr,
    ApplyPlanDialog
  },
  data() {
    return {
      total: 0,
      queryInfo: {
        // 检索 产品名称 name
        // key: '',
        // 10 表示CDN套餐
        // productTypes: '10',
        page: 1,
        limit: 8
      },
      planList: [],
      // 计费方式
      getBillName,
      // 价格类型名称
      priceName
    }
  },
  computed: {
    // 计费类型
  },
  created() {
    this.getPlanListData()
  },
  methods: {
    flowUnit,

    /**
     * @description: 获取产品列表数据
     * @return {*}
     */

    async getPlanListData() {
      this.$root.loading = true
      const { data: res } = await getPlanList(this.queryInfo)
      this.$root.loading = false
      if (res.code !== 1) return
      const obj = res.data || {}
      const arr = (obj.list || []).map((item) => {
        return {
          ...item,
          priceObj: item.productJson && JSON.parse(item.productJson)
          // attrArr: item.attrJson && JSON.parse(item.attrJson)
        }
      })
      this.planList = arr
      console.log('planList', arr)
      this.total = res.data.totalCount || 0
    },

    /**
     * @description: 判断计费类型
     */

    getBillType(type) {},

    /**
     * @description: 前往订单页面
     * @param {*} item
     */

    async goOrderPage(item = {}) {
      // 坚持是否提示实名认证和绑定手机号
      const { isUnverified, isUnboundMobile } = this.$attrs
      if (
        showTipsAlert({
          isUnverified,
          isUnboundMobile,
          tag: '购买套餐'
        })
      ) {
        return
      }

      if (item.attr.charging_mode == 1) {
        // 如果为流量套餐，则前往购买
        this.$router.push({ name: 'Purchase', query: { id: item.id } })
      } else {
        // 如果为带宽计费，直接前往使用
        // this.applyUsePlan(item)

        this.$confirm(
          '该套餐为后付费套餐，您需要申请后才能使用！您可以提交工单或者联系我们。',
          '友情提示',
          {
            confirmButtonText: '立即申请使用',
            cancelButtonText: '取消',
            center: true,
            type: 'info'
          }
        )
          .then(() => {
            this.applyUsePlan(item)
          })
          .catch(() => {})
      }
    },

    /**
     * @description: 申请使用带宽套餐
     */

    async applyUsePlan(item = {}) {
      // this.$refs.ApplyPlanDialogRef.showDialog(item)

      const { data: res } = await applyUseBandwith({
        productId: item.id
      })
      if (res.code !== 1) return

      const { data: res1 } = await getOrderDetail({
        SerialNumber: res.data.serialNumber
      })
      if (res.code !== 1) return
      this.$msg.success(this.antsT('申请成功'))
      // this.$router.push('/cdn/site/domain/list')
    },

    // 监听pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.limit = newSize
      this.getPlanListData()
    },
    // 监听 页码值 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.getPlanListData()
    }
  }
}
</script>

<style lang="scss">
.plan-purchase-box {
  .plan-attr-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

<style lang="scss" scoped>
.plan-attr-box {
  .plan-attr-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
.buy-button {
  transition: all 0.3s;
  &:hover {
    color: theme('colors.ants-bg-1');
    border-color: theme('colors.primary');
    background-color: theme('colors.primary');
  }
}
.buy-button.active-button {
  color: theme('colors.ants-bg-1');
  border-color: theme('colors.primary');
  background-color: theme('colors.primary');
}
</style>
