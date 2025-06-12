<template>
  <div class="work-order-detail content-box animated fadeIn">
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 8 }"
        :md="{ span: 7 }"
        :lg="{ span: 7 }"
        :xl="{ span: 7 }"
      >
        <DetailLeftCard
          :work-order-data="workOrderData"
          @showCloseOrderDialog="showCloseOrderDialog"
          @showComplainDialog="showComplainDialog"
          ref="DetailLeftCardRef"
        />
        <CloseOrderCard
          v-if="workOrderData.status == 4"
          :work-order-data="workOrderData"
        />
        <ComplainCard
          v-if="workOrderData.suggestion_content"
          :work-order-data="workOrderData"
        />
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 16 }"
        :md="{ span: 17 }"
        :lg="{ span: 17 }"
        :xl="{ span: 17 }"
      >
        <DetailRightCard
          :work-order-data="workOrderData"
          :order-chat-arr="orderChatArr"
          :preview-img-arr="previewImgArr"
          @getGoodsList="getGoodsList"
          ref="DetailRightCardRef"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
// API
import {
  doReplayWorkOrder,
  getWorkOrderDetail
} from '@/v2/cdn_admin/api/cdn/work-order'

import DetailLeftCard from './components/DetailLeftCard'
import DetailRightCard from './components/DetailRightCard'
import CloseOrderCard from './components/CloseOrderCard'
import ComplainCard from './components/ComplainCard'

import { getLocation } from '@/utils/env'

export default {
  components: {
    DetailLeftCard,
    DetailRightCard,
    CloseOrderCard,
    ComplainCard
  },
  data() {
    return {
      id: this.$route.query.id,

      // 当前 workOrder 数据
      workOrderData: {
        create_time: 0,
        order_number: '',
        category_id: '',
        status: 1,
        urgency: 1
      },
      // 工单回复详情
      orderChatArr: [],
      // 图片预览数组
      previewImgArr: []
    }
  },
  created() {},
  mounted() {
    this.getGoodsList()
  },
  methods: {
    /**
     * @description: 获取详情数据
     */

    async getGoodsList() {
      this.$root.loading = true
      const { data: res } = await getWorkOrderDetail({
        id: this.id
      })
      this.$root.loading = false

      if (res.code !== 1) return

      const obj = res.data || {}
      this.workOrderData = obj

      const chatArr = obj.senderInfos || []

      // 拼接图片途径
      const { protocol, host } = getLocation()
      // const rootUrl =
      //   !this.debug
      //     ? `${protocol}//${host}`
      //     : this.$root.demoWebSite

      const imgBaseUrl = `${this.$root.webRootApi}sys/oss/get/image/`

      // 语言图片数组
      const previewImgArr = []
      // 对话数据
      const arr = chatArr.map((item) => {
        const contentObj = item.content && JSON.parse(item.content)
        let img = ''
        if (contentObj.img) {
          img = imgBaseUrl + contentObj.img
          previewImgArr.push(img)
        }
        return {
          ...item,
          text: contentObj.text || '',
          img: img,
          content: ''
        }
      })

      // 初始创建工单的图片
      const initImgArr = (obj.images && obj.images.split(',')) || []

      const initObj = {
        id: obj.id + '_',
        senderType: 2,
        createdate: obj.createdate,
        senderId: obj.userId,
        workOrderId: obj.id
      }

      initImgArr.forEach((item, idx) => {
        arr.unshift({
          ...initObj,
          id: initObj.id + idx,
          img: imgBaseUrl + item
        })
        previewImgArr.unshift(imgBaseUrl + item)
      })
      // 追加描述
      arr.unshift({
        ...initObj,
        img: '',
        text: obj.description
      })

      this.orderChatArr = arr
      this.previewImgArr = previewImgArr

      this.$nextTick(() => {
        document.getElementById('scrollEnd').scrollIntoView(true)
      })
    },

    showCloseOrderDialog() {
      this.$refs.CloseOrderDialogRef.dialogVisible = true
    },

    showComplainDialog() {
      this.$refs.ComplainDialogRef.dialogVisible = true
    }
  },
  destroyed() {}
}
</script>

<style lang="scss">
.work-order-detail {
  .el-divider--horizontal {
    margin: 30px 0;
    .el-divider__text {
      font-size: 15px;
      font-weight: 700;
    }
  }
}
</style>
