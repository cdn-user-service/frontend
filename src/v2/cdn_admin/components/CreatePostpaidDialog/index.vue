<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="月95带宽计费授权"
    width="700px"
    @close="resetForm"
    @submit="submitForm"
  >
    <div class="rounded-xl py-sm px-df bg-ants-bg-3 -mt-sm">
      <TitleBorder title="申请用户" />
    </div>
    <ul class="space-y-10 py-lg pl-df">
      <li>
        <span class="inline-block mr-lg text-ants-text-4" style="width:80px;"
          >用户ID</span
        >
        {{ userinfo.userId }}
      </li>
      <li>
        <span class="inline-block mr-lg text-ants-text-4" style="width:80px;"
          >用户名</span
        >
        {{ userinfo.username }}
      </li>
    </ul>
    <div class="rounded-xl py-sm px-df bg-ants-bg-3">
      <TitleBorder title="申请套餐" />
    </div>
    <ul class="space-y-10 py-lg pl-df">
      <li>
        <span class="inline-block mr-lg text-ants-text-4" style="width:80px;"
          >套餐ID</span
        >
        {{ productInfo.id }}
      </li>
      <li>
        <span class="inline-block mr-lg text-ants-text-4" style="width:80px;"
          >套餐名称</span
        >
        {{ productInfo.name }}
      </li>
      <li>
        <span class="inline-block mr-lg text-ants-text-4" style="width:80px;"
          >套餐单价</span
        >
        <span class="text-price"
          >{{ productInfo.price | priceFormat }} Mbps/月</span
        >
      </li>
    </ul>

    <div class="rounded-xl py-sm px-df bg-ants-bg-3">
      <TitleBorder title="申请说明" />
    </div>
    <div class="pt-lg pl-df">
      用于跑大流量业务、视频、直播业务!
    </div>
  </ants-dialog>
</template>

<script>
// api
import { doCreatePostpaidOrder } from '@/v2/cdn_admin/api/cdn/finance'

export default {
  props: {
    productAttrObj: Object
  },
  data() {
    return {
      dialogVisible: false,
      userinfo: {
        userId: 61,
        username: 'test'
      },
      productInfo: {
        id: 12,
        name: '月95带宽',
        price: 999
      }
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      //   this.userinfo = row.userinfo
      //   this.productInfo = row.productInfo
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.dialogRef.btnLoading = true
      //   const { data: res } = await doCreatePostpaidOrder({
      //     userId: this.userinfo.userId,
      //     productId: this.productInfo.id
      //   })
      //   this.$refs.dialogRef.btnLoading = false

      //   if (res.code !== 1) return
      this.dialogVisible = false
      this.$msg.success('授权成功')
    },

    // 表单重置
    resetForm() {}
  }
}
</script>
