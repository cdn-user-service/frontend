<template>
  <div class="content-box animated fadeIn" v-loading="$root.loading">
    <ul class="animated fadeInUp my-xl text-center">
      <li class="my-lg font-bold text-4xl text-primary">
        — {{ antsT('DNS解析套餐') }} —
      </li>
      <li class="text-ants-text-4">
        {{ antsT('DNS产品最新上线，限时优惠，年付优惠更多哦！') }}
      </li>
    </ul>
    <el-skeleton :rows="8" :loading="$root.loading" animated>
      <template>
        <el-empty
          :description="antsT('还没有任何可购买套餐，请联系管理员添加！')"
          v-if="!planList.length"
        >
        </el-empty>

        <div v-else style="max-width:1600px;" class="mx-auto">
          <el-row :gutter="20">
            <el-col
              :xs="{ span: 24 }"
              :sm="{ span: 12 }"
              :md="{ span: 6 }"
              :lg="{ span: 6 }"
              :xl="{ span: 6 }"
              v-for="(item, buyIndex) in planList"
              :key="item.id"
            >
              <div
                class="ants-buy-item wow fadeInUp shadow mb-lg py-lg rounded-2xl"
              >
                <ul class="ants-buy-top px-xl text-center">
                  <li class="font-bold mb-sm pt-df">
                    <span style="font-size:1.5rem">{{ item.productName }}</span>
                  </li>
                  <li class="text-price mb-xs font-bold text-2xl">
                    {{ item.productUnitPrice | priceFormat }}
                    <span class="text-df">
                      / {{ antsT(unitObj[item.productUnit]) }}</span
                    >
                  </li>
                  <li class="text-ants-text-4 text-sm line-through">
                    {{ (item.productUnitPrice * 2) | priceFormat }}
                    <span>/ {{ antsT(unitObj[item.productUnit]) }}</span>
                  </li>
                  <li class="diff-top-btn py-xs">
                    <span
                      @click="goBuyPage(item.productUnitPrice, item.id)"
                      :class="[
                        buyIndex == 2 ? 'purchase_btn active' : '',
                        'purchase_btn cursor-pointer'
                      ]"
                      >{{
                        item.productUnitPrice == 0
                          ? antsT('立即使用')
                          : antsT('立即购买')
                      }}</span
                    >
                  </li>
                  <li class="text-ants-text-4 text-sm diff-top-info">
                    {{ item.productDescribe }}
                  </li>
                </ul>

                <ul class="ants-buy-list px-xl py-lg">
                  <li
                    v-for="item2 in JSON.parse(item.productJson)"
                    :key="item2.id"
                    class="text-sm flex justify-between items-center"
                  >
                    <!-- <span
                      class="el-icon-circle-check text-base margin-right-xs text-lg"
                    ></span> -->
                    <span class="mr-xs inline-block" style="min-width:100px;"
                      >{{ item2.attrKeyName }}:
                    </span>
                    <span
                      v-if="item2.attrType == 'bool'"
                      class="el-icon-success text-primary"
                    ></span>
                    <span v-else
                      >{{ item2.attrValue }} {{ item2.attrUnit }}</span
                    >
                  </li>
                </ul>
              </div>
            </el-col>
          </el-row>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script>
// api
import { getProductList } from '@/v2/dns_users/api/dns/plan'
// 验证提示实名认证、绑定手机号
import { showTipsAlert } from '@/v2/dns_users/extra/computed'

export default {
  data() {
    return {
      unitObj: {
        '1y': '年',
        '1s': '季',
        '1m': '月',
        '1d': '天',
        '1p': '次'
      },

      planList: [] // 套餐列表
    }
  },
  created() {
    this.getMealList()
  },
  methods: {
    /**
     * @description: 获取所有套餐列表
     */
    async getMealList() {
      this.$root.loading = true
      const { data: res } = await getProductList({
        pagenum: 1,
        pagesize: 20
      })

      this.$root.loading = false

      if (res.code !== 1) return

      // 过滤掉免费套餐，并制定默认选中套餐
      //   const mealArr = res.data.list.filter(item => {
      //     return item.productUnitPrice != 0
      //   })

      this.planList = (res.data || {}).list || []
    },

    // 点击前往购买套餐
    goBuyPage(price, id) {
      if (price == 0) {
        return this.$router.push('/dns/domain')
      }
      // 坚持是否提示实名认证和绑定手机号
      const { isUnverified, isUnboundMobile } = this.$attrs
      if (
        showTipsAlert({
          isUnverified,
          isUnboundMobile,
          tag: '购买DNS套餐'
        })
      ) {
        return
      }

      this.$router.push({ name: 'PurchasePlans', params: { type: id } })
    }
  }
}
</script>

<style lang="scss" scoped>
.ants-buy-item {
  background-color: #fff;
  .ants-buy-list {
    min-height: 300px;
    line-height: 28px;
    border-top: 1px solid theme('colors.ants-border-2');
    color: theme('colors.ants-text-3');
  }

  .line-through {
    text-decoration: line-through;
  }

  .diff-top-info {
    height: 60px;
    line-height: 20px;
    margin-bottom: 10px;
  }

  .purchase_btn {
    width: 100%;
    display: inline-block;
    text-align: center;
    padding: 10px;
    border-radius: 50px;
    border: 2px solid theme('colors.ants-border-4');
    color: theme('colors.ants-text-3');
    background-color: #fff;
    margin: 10px 0;
    transition: all 0.3s;
    &:hover {
      background-color: theme('colors.primary');
      border-color: theme('colors.primary');
      color: #fefefe;
      box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1);
    }
  }
  .purchase_btn.active {
    background-color: theme('colors.primary');
    border-color: theme('colors.primary');
    color: #fefefe;
  }
}
</style>
