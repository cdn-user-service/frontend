<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    title="申请月95带宽计费"
    width="700px"
    @close="resetForm"
    @submit="submitForm"
  >
   <div class="ants-tips_box -mt-sm mb-lg">
    该套餐为后付费套餐，您需要申请通过后才能使用！
   </div>
    <!-- <div class="rounded-xl py-sm px-df bg-ants-bg-3"> -->
        <TitleBorder title="申请套餐" />
    <!-- </div> -->
    <ul class="space-y-10 py-lg pl-df">
      <li>
        <span class="inline-block mr-lg text-ants-text-4" style="width:80px;">套餐ID</span>
        {{ productInfo.id }}
      </li>
      <li>
        <span class="inline-block mr-lg text-ants-text-4" style="width:80px;">套餐名称</span>
        {{ productInfo.name }}
      </li>
      <li>
        <span class="inline-block mr-lg text-ants-text-4" style="width:80px;">套餐单价</span>
        <span class="text-price">{{ productInfo.attr.bandwidth | priceFormat }}/Mbps/月</span>
      </li>
    </ul>

    <TitleBorder title="申请说明" class="mt-sm"/>
    <div class="pt-lg pl-df">
      <ants-input v-model="content"
        type="textarea"
        placeholder="请输入申请说明"
        :autosize="{ minRows: 4, maxRows: 8 }"/>
    </div>
  </ants-dialog>
</template>

<script>
// api
import { applyUseBandwith } from '@/v2/cdn_users/api/cdn/plan'

export default {
  props: {
    productAttrObj: Object
  },
  data() {
    return {
      dialogVisible: false,
      productInfo: {
        id: 12,
        name: '月95带宽',
        attr: {
          bandwidth: 0
        }
      },
      content: '用于跑大流量业务、视频、直播业务!'
    }
  },
  methods: {
    /**
     * @description: 展示对话框
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.productInfo = {
        ...row
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      if (this.content === '') return this.$msg.error('请输入申请说明')
    //   this.$refs.dialogRef.btnLoading = true
    //   const { data: res } = await applyUseBandwith({
    //     productId: this.productInfo.id
    //   })
    //   this.$refs.dialogRef.btnLoading = false

    //   if (res.code !== 1) return
    //   this.dialogVisible = false
    //   this.$msg.success('申请成功，请等待管理员处理')
    },

    // 表单重置
    resetForm() {}
  }
}
</script>
