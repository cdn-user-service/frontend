<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="月95带宽计费授权"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <TitleBorder title="申请用户" />
    <ul>
      <li>
        <span class="mr-lg text-ants-text-4">用户ID</span>
        {{ userinfo.userId }}
      </li>
      <li>
        <span class="mr-lg text-ants-text-4">用户名</span>
        {{ userinfo.username }}
      </li>
    </ul>
    <TitleBorder title="申请套餐" />
    <ul>
      <li>
        <span class="mr-lg text-ants-text-4">套餐ID</span>
        {{ productInfo.id }}
      </li>
      <li>
        <span class="mr-lg text-ants-text-4">套餐名称</span>
        {{ productInfo.name }}
      </li>
      <li>
        <span class="mr-lg text-ants-text-4">套餐单价</span>
        {{ productInfo.price | priceFormat }} Mbps/月
      </li>
    </ul>

    <TitleBorder title="申请说明" />
    <div>
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
      const { data: res } = await doCreatePostpaidOrder({
        userId: this.userinfo.userId,
        productId: this.productInfo.id
      })
      this.$refs.dialogRef.btnLoading = false

      if (res.code !== 1) return
      this.dialogVisible = false
      this.$msg.success('授权成功')
    },

    // 表单重置
    resetForm() {}
  }
}
</script>
