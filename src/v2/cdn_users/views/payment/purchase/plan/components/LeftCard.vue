<template>
  <el-card class="mb-sm payment-purchase-box">
    <el-skeleton :rows="8" :loading="$root.loading" animated>
      <template>
        <TitleBorder class="mb-lg" title="选择CDN套餐" />
        <div>
          <ants-radio-group
            v-model="form.plan"
            @change="changePlan"
            size="medium"
          >
            <ants-radio-button
              v-for="(item, key) in planObj"
              :key="key"
              :label="key"
              :text="item.name"
            />
          </ants-radio-group>
        </div>

        <ul
          class="flex items-center p-lg mt-lg border border-ants-border-3 rounded-2xl text-sm"
        >
          <li v-for="(item, key) in priceUsbleObj" :key="key">
            <div class="pr-lg" v-if="priceName[key]">
              <div class="mb-xs">
                <span class="text-3xl text-primary">{{
                  item.value | priceFormat
                }}</span>
                /{{ priceName[key] }}
              </div>
              <div class="text-ants-text-4 line-through">
                {{ (item.value * 2) | priceFormat }}/{{ priceName[key] }}
              </div>
            </div>
          </li>
        </ul>

        <div class="p-lg mt-lg bg-ants-bg-2 rounded-2xl text-sm">
          <div class="mb-lg">
            <strong class="mr-lg">计费方式</strong>
            <el-tag size="small" type="primary">流量月结</el-tag>
          </div>
          <PlanAttr :attr-obj="activePlanItem.attr" class="space-y-8" />
        </div>

        <div class="my-xl border-t border-ants-border-3"></div>

        <TitleBorder class="mb-xl" title="选择购买时长" />
        <div class="">
          <span class="mr-lg text-ants-text-3">{{ antsT('购买方式：') }}</span>
          <ants-radio-group
            v-model="form.type"
            @change="changePriceType"
            size="small"
          >
            <template v-for="(value, key) in priceUsbleObj">
              <ants-radio-button
                v-if="priceName[key]"
                :key="key"
                :label="key"
                :text="`按${priceName[key]}购买`"
              />
            </template>
          </ants-radio-group>
        </div>
        <div class="my-xl">
          <span class="mr-lg text-ants-text-3">{{ antsT('购买数量：') }}</span>
          <ants-input-number
            size="small"
            @change="changeSum"
            v-model="form.sum"
            :min="1"
            :max="3"
          />
          <span class="ml-sm text-ants-text-3">{{ priceName[form.type] }}</span>
        </div>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
// API
import { getPlanAll } from '@/v2/cdn_users/api/cdn/plan'

// 产品属性
import { getBillName, priceName } from '@/global/enum'
import PlanAttr from '@/v2/cdn_common/components/Plan/Attr'

export default {
  components: {
    PlanAttr
  },
  data() {
    return {
      form: {
        // 当前选中套餐Id
        plan: '',
        // 购买时长类型
        type: 'm',
        // 购买数量
        sum: 1
      },

      // 所有可购买套餐
      planObj: {},
      // 计费方式
      getBillName,
      // 价格类型名称
      priceName
    }
  },
  computed: {
    // 当前选择增值业务
    activePlanItem() {
      let obj = {
        attr: {},
        priceObj: {}
      }
      obj = this.form.plan && this.planObj[this.form.plan]
      return obj
    },

    // 当前套餐开启哪些付费、月付、季付、年付
    priceUsbleObj() {
      const obj = {}
      const baseObj = this.activePlanItem.priceObj || {}
      Object.keys(baseObj).forEach((key) => {
        if (baseObj[key].status == 1) {
          obj[key] = baseObj[key]
        }
      })
      return obj
    }
  },
  watch: {
    // 监听选中商品可用价格
    priceUsbleObj: function (newVal, oldVal) {
      if (newVal.m) {
        this.form.type = 'm'
        return
      }
      if (newVal.s) {
        this.form.type = 's'
        return
      }
      if (newVal.y) {
        this.form.type = 'y'
      }
    }
  },
  created() {
    this.getPlanListData()
  },
  methods: {
    /**
     * @description: 获取所有可购买套餐列表数据
     * @return {*}
     */

    async getPlanListData() {
      this.$root.loading = true
      const { data: res } = await getPlanAll({
        // CDN套餐 = 10， 增值服务 = 12
        productTypes: 10
      })
      this.$root.loading = false
      if (res.code !== 1) return
      if (!res.data.length) {
        return this.$msg.error('暂无可购买套餐，请联系客服！')
      }

      const obj = {}
      res.data.forEach((item) => {
        // 过滤掉带宽计费的套餐，带宽计费的为后付费
        if (item.attr && item.attr.charging_mode == 1) {
          obj[item.id] = {
            ...item,
            // 套餐价格
            priceObj: item.productJson && JSON.parse(item.productJson)
            // 套餐属性对象
            // attrObj
          }
        }
      })

      this.planObj = obj
      // 初始值
      this.form.plan = this.$route.query.id || res.data[0].id
      // 更新父组件的数据
      this.updateParentData()
    },

    /**
     * @description: 套餐切换
     */

    changePlan(val) {
      this.updateParentData()
    },

    /**
     * @description: 购买类型
     */

    changePriceType(val) {
      this.updateParentData()
    },

    /**
     * @description: 购买时长
     */

    changeSum(val) {
      this.updateParentData()
    },

    /**
     * @description: 更新父组件的数据
     */

    updateParentData() {
      this.$emit('updatePlanAndTime', {
        plan: this.planObj[this.form.plan],
        type: this.form.type,
        sum: this.form.sum
      })
    }
  }
}
</script>

<style lang="scss">
.payment-purchase-box {
}
</style>
