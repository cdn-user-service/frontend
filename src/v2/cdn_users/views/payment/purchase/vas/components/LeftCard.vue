<template>
  <el-card class="mb-sm">
    <el-skeleton :rows="8" :loading="$root.loading" animated>
      <template>
        <TitleBorder class="mb-lg" title="选择增值业务" />
        <ul class="space-y-8 mb-lg">
          <li>
            <ants-radio-group
              v-model="form.vas"
              size="small"
              @change="changeVas"
            >
              <ants-radio-button
                v-for="item in varArr"
                :key="item.id"
                :label="item.id"
                :text="item.name"
              />
            </ants-radio-group>
          </li>

          <li
            class="flex items-center border border-ants-border-3 rounded-2xl p-lg text-sm"
          >
            <template v-for="(item, key) in priceUsbleObj">
              <div v-if="priceName[key]" :key="key" class="pr-lg">
                <div class="mb-xs text-price">
                  <span class="text-3xl">{{ item.value | priceFormat }}</span
                  >/
                  {{ antsT(priceName[key]) }}
                </div>
                <div class="text-ants-text-4 line-through">
                  {{ (item.value * 2) | priceFormat }}/{{
                    antsT(priceName[key])
                  }}
                </div>
              </div>
            </template>
          </li>

          <li class="p-lg bg-ants-bg-2 rounded-2xl text-sm space-y-8">
            <div v-if="activeVasItem.attr && activeVasItem.attr.flow" class="">
              <span
                class="text-ants-text-3 mr-sm inline-block"
                style="min-width: 100px"
                >{{ antsT('流量') }}</span
              >
              <strong>{{ getFlow(activeVasItem.attr.flow) }} </strong>
            </div>

            <!-- 属性列表 -->
            <PlanAttr
              :attr-obj="activeVasItem.attr"
              hidden-attr
              class="space-y-8"
            />
          </li>
        </ul>

        <TitleBorder class="mt-xl mb-lg" title="选择绑定套餐" />
        <QueryPlanSelect
          v-model="form.serialNumber"
          size="small"
          style="max-width: 300px"
          ref="QueryPlanSelectRef"
          @change="changePlan"
        />

        <TitleBorder class="mt-xl mb-lg" title="选择生效日期" />
        <div>
          <el-date-picker
            v-model="form.startTime"
            style="width: 300px"
            size="small"
            type="date"
            placeholder="选择生效日期"
            value-format="timestamp"
            @change="changeTime"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </div>

        <TitleBorder class="mt-xl mb-lg" title="选择购买时长" />
        <div class="">
          <span class="inline-block text-ants-text-3" style="width: 100px">{{
            antsT('购买方式')
          }}</span>
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
                :text="antsT(`按${priceName[key]}购买`)"
              />
            </template>
          </ants-radio-group>
        </div>
        <div class="my-xl">
          <span class="inline-block text-ants-text-3" style="width: 100px">{{
            antsT('购买数量')
          }}</span>
          <ants-input-number
            size="small"
            @change="changeSum"
            v-model="form.sum"
            :min="1"
            :max="maxTime"
          />
          <span class="ml-sm text-ants-text-3">{{
            antsT(priceName[form.type])
          }}</span>
        </div>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
// API
import { getPlanAll } from '@/v2/cdn_users/api/cdn/plan'

import { priceName } from '@/global/enum'

import QueryPlanSelect from '@/v2/cdn_users/components/QueryPlanSelect'
import PlanAttr from '@/v2/cdn_common/components/Plan/Attr'

export default {
  components: {
    PlanAttr,
    QueryPlanSelect
  },
  data() {
    return {
      form: {
        // 选中的增值业务 id
        vas: '',
        // 选择绑定套餐
        serialNumber: '',
        // 生效时间 1650769152, 默认当前时间
        startTime: new Date().getTime(),
        // 购买数量
        sum: 1,
        // 购买时长类型
        type: 'm'
      },
      // 商品数据
      vasObj: {},
      varArr: [],
      // 价格类型名称
      priceName,

      pickerOptions: {
        // 禁用之前的时间
        disabledDate(time) {
          return (
            time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
          )
        }
      }
    }
  },
  computed: {
    // 当前选择增值业务
    activeVasItem() {
      let obj = {
        attr: {},
        priceObj: {}
      }
      obj = this.form.vas && this.vasObj[this.form.vas]
      return obj
    },

    // 当前套餐开启哪些付费、月付、季付、年付
    priceUsbleObj() {
      const obj = {}
      const baseObj = this.activeVasItem.priceObj || {}
      Object.keys(baseObj).forEach((key) => {
        if (baseObj[key].status == 1) {
          obj[key] = baseObj[key]
        }
      })
      return obj
    },

    // 限制最大购买时长 3 年
    maxTime() {
      const obj = {
        m: 3 * 12,
        s: 3 * 4,
        y: 3
      }
      return obj[this.form.type] || 3
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
        productTypes: 12
      })
      this.$root.loading = false
      if (res.code !== 1) return
      if (!res.data.length) {
        return this.$msg.error('暂无可购买增值业务，请联系客服！')
      }
      const obj = {}
      const arr = []
      res.data.forEach((item, idx) => {
        // 设置当前选中商品
        if (idx === 0) {
          this.form.vas = item.id
        }

        obj[item.id] = {
          ...item,
          priceObj: item.productJson && JSON.parse(item.productJson)
        }
        arr.push({
          id: item.id,
          name: item.name
        })
      })
      this.vasObj = obj
      this.varArr = arr

      // 获取套餐列表
      this.$nextTick(async () => {
        this.form.serialNumber =
          await this.$refs.QueryPlanSelectRef.getPlanList()
        // 更新父组件的数据
        this.updateParentData()
      })
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
     * @description: 套餐切换
     */

    changeVas(val) {
      this.updateParentData()
    },

    // 生效日期改变
    changeTime(val) {
      this.updateParentData()
    },

    // 绑定套餐切换
    changePlan(val) {
      this.updateParentData()
    },

    /**
     * @description: 购买类型
     */

    changePriceType(val) {
      // 更新最大值
      if (this.form.sum > this.maxTime) {
        this.form.sum = this.maxTime
      }

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
      this.$emit('updateGoodInfo', {
        good: this.vasObj[this.form.vas],
        ...this.form
      })
    }
  }
}
</script>
