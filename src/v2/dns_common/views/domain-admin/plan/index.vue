<template>
  <div class="content-box animated fadeIn">
    <el-card class="mb-lg">
      <div slot="header" class="flex justify-between items-center">
        <TitleBorder title="DNS 解析套餐" />
        <div>
          <ants-button
            size="mini"
            type="primary"
            @click="showSwitchPlanDialog"
            text="变更套餐"
          />

          <template v-if="isUsers">
            <ants-button
              v-if="domainInfo.consume && !(domainInfo.consume || {}).isFree"
              size="mini"
              type="warning"
              class="ants-price-button"
              @click="showUpgradeDialog"
              text="升级套餐"
            />
            <ants-button
              v-else
              size="mini"
              type="warning"
              class="ants-price-button"
              @click="
                $router.push({ name: 'PurchasePlans', params: { type: 0 } })
              "
              text="购买套餐"
            />
          </template>
        </div>
      </div>
      <div class="p-lg bg-ants-bg-3 rounded-2xl">
        <div class="pb-lg flex items-center text-sm">
          <div
            class="border border-ants-border-2 py-sm px-lg mr-lg primary_meal_tag"
            style="border-radius: 30px"
          >
            <span class="font-bold text-df mr-sm el-icon-s-shop">
              {{ product.productName }}</span
            >
            <span>
              有效期：
              {{ (domainInfo.consume || {}).effectStartTime }} ~
              {{ (domainInfo.consume || {}).effectEndTime }}</span
            >
          </div>
        </div>
        <el-row :gutter="20">
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 12 }"
            :md="{ span: 8 }"
            :lg="{ span: 8 }"
            :xl="{ span: 8 }"
            v-for="item in JSON.parse(product.productJson || '[]')"
            :key="item.id"
          >
            <div class="my-xs text-sm">
              <span
                class="text-ants-text-3 mr-xs inline-block"
                style="min-width: 90px"
                >{{ item.attrKeyName }}:
              </span>
              <span
                v-if="item.attrType == 'bool'"
                class="el-icon-success text-success"
              ></span>
              <span v-else>{{ item.attrValue }} {{ item.attrUnit }}</span>
            </div>
          </el-col>
        </el-row>

        <div class="text-ants-text-3 text-sm mt-lg">
          {{ product.productDescribe }}
        </div>
      </div>
    </el-card>

    <el-card class="mb-lg">
      <div slot="header" class="flex justify-between items-center">
        <TitleBorder title="DNS 增值业务" />
        <ants-button
          size="mini"
          type="warning"
          class="ants-price-button"
          @click="showBuyExtraDialog"
          text="购买增值业务"
          v-if="isUsers"
        />
      </div>
      <div class="p-lg bg-ants-bg-3 rounded-2xl">
        <el-table :data="increment" style="margin: 0">
          <div slot="empty">
            <el-empty :description="antsT('暂无数据')"> </el-empty>
          </div>
          <ants-table-column label="ID" prop="id" width="80">
          </ants-table-column>
          <ants-table-column label="商品规格" prop="guige" min-width="300">
            <template #default="{ row, $index }">
              <ul style="margin-top: -5px; margin-bottom: -5px">
                <li
                  class="flex items-center extra-info-item"
                  v-for="(item, idx) in JSON.parse(row.productExtra)"
                  :key="item.id"
                >
                  <strong class="inline-block" style="width: 100px">{{
                    increment[$index].name[idx].attrKeyName
                  }}</strong>

                  <div>
                    <span class="inline-block" style="width: 100px"
                      >{{ item.value }}
                      {{ increment[$index].name[idx].attrUnit }}</span
                    >

                    <span class="text-price"
                      >{{
                        (increment[$index].name[idx].attrPrice * item.value)
                          | priceFormat
                      }}
                    </span>
                  </div>
                </li>
              </ul>
            </template>
          </ants-table-column>

          <ants-table-column
            label="生效时间"
            prop="effectStartTime"
            min-width="140"
          >
          </ants-table-column>
          <ants-table-column
            label="到期时间"
            prop="effectEndTime"
            min-width="140"
          >
          </ants-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 套餐升级对话框 -->
    <UpgradeDialog ref="UpgradeDialogRef" v-if="isUsers" />

    <!-- 变更套餐对话框 -->
    <SwitchPlanDialog
      ref="SwitchPlanDialogRef"
      @refresh="refresh"
    />

    <!-- 购买增值业务对话框 -->
    <BuyExtraDialog ref="BuyExtraDialogRef" v-if="isUsers" />
  </div>
</template>

<script>
import UpgradeDialog from '@/v2/dns_users/components/UpgradeDialog'
import SwitchPlanDialog from '@/v2/dns_users/components/SwitchPlanDialog'
import BuyExtraDialog from '@/v2/dns_users/components/BuyExtraDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME

export default {
  components: {
    UpgradeDialog,
    BuyExtraDialog,
    SwitchPlanDialog
  },
  props: {
    domainInfo: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    increment() {
      return this.domainInfo.increment
    },

    product() {
      return this.domainInfo.product || {}
    }
  },
  data() {
    return {
      isUsers: PROCESS_NAME === 'dns_users'
    }
  },
  created() {
    // 获取域名信息
    this.refresh()
  },
  methods: {
    refresh() {
      this.$emit('getDomainInfo')
    },

    /**
     * @description: 升级套餐
     */
    showUpgradeDialog() {
      this.$refs.UpgradeDialogRef.getMealList({
        // 当前产品ID
        id: this.domainInfo.consume.id,
        // 当前域名
        domain: this.domainInfo.domain,
        // 当前套餐名称
        productName: this.product.productName,
        // 当前套餐单位
        productUnit: this.product.productUnit,
        // 当前套餐价格
        productUnitPrice: this.product.productUnitPrice,
        // 当前套餐到期时间，TODO：暂时没有
        effectEndTime: (this.domainInfo.consume || {}).effectEndTime
      })
    },

    // 变更套餐
    showSwitchPlanDialog() {
      this.$refs.SwitchPlanDialogRef.show({
        // 当前产品ID
        id: this.domainInfo.consume.id,
        // 当前域名
        domain: this.domainInfo.domain,
        // 当前域名的ID
        domainId: this.domainInfo.id,
        // 当前套餐名称
        productName: this.product.productName,
        // 当前套餐单位
        productUnit: this.product.productUnit,
        // 当前套餐价格
        productUnitPrice: this.product.productUnitPrice,
        // 当前套餐到期时间，TODO：暂时没有
        effectEndTime: (this.domainInfo.consume || {}).effectEndTime,
        // 用户信息
        username: (this.domainInfo.userInfo || {}).username,
        userId: this.domainInfo.userid
      })
    },

    /**
     * @description: 显示购买增值业务对话框
     */

    showBuyExtraDialog() {
      this.$refs.BuyExtraDialogRef.showDialog(this.domainInfo.domain)
    }
  }
}
</script>

<style lang="scss" scoped>
.primary_meal_tag {
  color: theme('colors.primary');
  border-color: theme('colors.primary');
}
</style>
