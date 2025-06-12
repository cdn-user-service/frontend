<template>
  <div>
    <el-card class="animated fadeIn">
      <el-skeleton :rows="6" :loading="loading" animated>
        <div class="flex items-center">
          <strong class="mr-lg">{{ antsT('套餐服务') }}</strong>
          <div v-if="!isAdmin && !$root.disabledCrud">
            <template v-if="(suit.productEntity || {}).status == 4">
              <el-tag
                type="warning"
                size="small"
                effect="dark"
                class="cursor-pointer mr-sm"
                @click="$router.push({ name: 'Purchase' })"
                v-if="suit.attr.charging_mode == 1"
              >
                {{ antsT('购买套餐') }}
              </el-tag>
            </template>

            <template v-else>
              <el-tag
                type="warning"
                size="small"
                effect="dark"
                class="cursor-pointer mr-sm"
                @click="showUpgradeDialog"
                v-if="suit.attr.charging_mode == 1"
              >
                {{ antsT('升级套餐') }}
              </el-tag>
              <el-tag
                type="success"
                size="small"
                effect="dark"
                class="cursor-pointer mr-sm"
                @click="showRenewDialog"
                v-if="suit.attr.charging_mode == 1"
              >
                {{ antsT('续费套餐') }}
              </el-tag>
            </template>
          </div>

          <el-tag
            v-if="!$root.disabledCrud"
            type="primary"
            size="small"
            effect="dark"
            class="cursor-pointer"
            @click="togglePlan"
          >
            {{ antsT('变更套餐') }}
          </el-tag>

          <el-tag
            v-if="isAdmin"
            type="success"
            size="small"
            effect="dark"
            class="cursor-pointer ml-sm"
            @click="toUpdatePlan()"
          >
            {{ antsT('修改套餐') }}
          </el-tag>
        </div>
        <div class="rounded-xl p-lg text-sm bg-ants-bg-5 mb-lg mt-df">
          <ul class="space-y-10">
            <li>
              <span class="plan-details-title">{{ antsT('套餐') }} ID</span>
              <span>{{ suit.id }}</span>
            </li>
            <li>
              <span class="plan-details-title">{{ antsT('套餐名称') }}</span>
              <span>{{ suit.suitName }}</span>
            </li>
            <li>
              <span class="plan-details-title">{{ antsT('计费方式') }}</span>
              <el-tag size="small" type="primary" class="border">{{
                antsT(typeObj[+suit.attr.charging_mode])
              }}</el-tag>
            </li>
            <li>
              <span class="plan-details-title">{{ antsT('创建时间') }}</span>
              <span>{{ suit.createTime }}</span>
            </li>
            <li>
              <span class="plan-details-title">{{ antsT('有效期') }}</span>
              <span>{{ suit.startTime }} ~ {{ suit.endTime }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-xl">
          <PlanUsed :used-obj="suit.consume" :attr-obj="suit.attr" />
        </div>
      </el-skeleton>
    </el-card>

    <!-- 增值业务 -->
    <VasCard ref="VasCardRef" :vas-data="suit.addedServices" />

    <!-- 续费对话套餐框 -->
    <RenewDialog ref="RenewDialogRef" />

    <!-- 升级套餐对话框 -->
    <UpgradeDialog ref="UpgradeDialogRef" />

    <!-- 变更套餐对话框 -->
    <TogglePlanDialog ref="TogglePlanDialogRef" @refresh="getSiteDetail" />

    <!-- 管理员修改套餐   -->
    <UpdatePlanDialog
      ref="UpdatePlanDialogRef"
      @refresh="getSiteDetail"
      v-if="isAdmin"
    />
  </div>
</template>

<script>
import PlanUsed from '@/v2/cdn_common/components/Plan/Used'
import { getBillName } from '@/global/enum'
// 升级、续费组件
import RenewDialog from '@/v2/cdn_users/views/cdn/plan/own/components/RenewDialog'
import UpgradeDialog from '@/v2/cdn_users/views/cdn/plan/own/components/UpgradeDialog'
import TogglePlanDialog from './components/TogglePlanDialog'
import VasCard from './components/VasCard'
import UpdatePlanDialog from '@/v2/cdn_admin/views/cdn/product/sold/list/UpdateDialog'

const PROCESS_NAME = process.env.VUE_APP_NAME

export default {
  components: {
    PlanUsed,
    UpgradeDialog,
    RenewDialog,
    TogglePlanDialog,
    VasCard,
    UpdatePlanDialog
  },
  data() {
    return {
      // 后台不显示升级、续费
      isAdmin: PROCESS_NAME === 'cdn_admin',
      loading: false,
      suit: {
        id: null,
        userId: null,
        // 当前购买产品属性
        attr: {},
        // 当前产品已使用
        consume: {},
        // 流量已使用
        usedTypeDetail: {
          totalFlowGb: 0 // 单位G
        },
        // 原始产品配置
        product: {
          productJson: {}
        },
        // 购买时间
        createTime: '',
        // 生效时间
        startTime: '',
        // 到期时间
        endTime: '',
        // 购买订单号
        paySerialNumber: '',
        // 原始产品订单号
        serialNumber: '',
        // 状态
        status: null,
        // 增值业务数组
        addedServices: []
      },
      getBillName,

      typeObj: {
        1: '流量月结',
        2: '平均日峰带宽',
        3: '月95带宽'
      }
    }
  },
  computed: {},
  created() {
    this.getSiteDetail()
  },
  methods: {
    // 获取站点套餐
    async getSiteDetail() {
      this.loading = true

      try {
        const { data: res } = await this.$listeners.getSiteDetail('suit')

        const { suit = {} } = res
        const { consume = {}, usedTypeDetail = {}, product = {} } = suit

        this.suit = {
          ...this.suit,
          ...res.suit,
          product: {
            ...product,
            productJson: JSON.parse(product.productJson || '{}')
          },
          consume: {
            // 已使用
            ...consume,
            // 流量已使用
            flow: usedTypeDetail.totalFlowGb
          }
        }
      } finally {
        this.loading = false
      }
    },

    // 点击续费
    showRenewDialog(row = {}) {
      if (this.loading) return
      if (!this.suit.bindSiteList) {
        this.suit.bindSiteList = [this.$route.query.domain]
      }
      this.$refs.RenewDialogRef.showDialog(this.suit)
    },

    // 点击升级，展示对话框，获取套餐列表数据
    async showUpgradeDialog(row = {}) {
      if (this.loading) return
      if (!this.suit.bindSiteList) {
        this.suit.bindSiteList = [this.$route.query.domain]
      }
      this.$refs.UpgradeDialogRef.showDialog(this.suit)
    },

    // 点击变更套餐
    togglePlan() {
      if (this.loading) return
      const { userId, serialNumber } = this.suit
      this.$refs.TogglePlanDialogRef.showDialog(userId, serialNumber)
    },

    // 修改套餐
    toUpdatePlan() {
      this.$refs.UpdatePlanDialogRef.showDialog({
        ...this.suit
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-details-title {
  display: inline-block;
  min-width: 100px;
  color: theme('colors.ants-text-4');
}
</style>
