<template>
  <div class="work-detial-box">
    <div class="content-box animated fadeIn">
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
            @getGoodsList="getGoodsList"
          :preview-img-arr="previewImgArr"
            ref="DetailRightCardRef"
          />
        </el-col>
      </el-row>
    </div>
    <!-- 投诉对话框 -->
    <ComplainDialog ref="ComplainDialogRef" />
    <!-- 提交结单对话框 -->
    <CloseOrderDialog ref="CloseOrderDialogRef" />
  </div>
</template>

<script>
// API
import { getWorkOrderDetail } from '@/v2/cdn_users/api/cdn/work-order'

import CloseOrderDialog from './components/CloseOrderDialog'
import ComplainDialog from './components/ComplainDialog'
import DetailLeftCard from './components/DetailLeftCard'
import DetailRightCard from './components/DetailRightCard'

import { getLocation } from '@/utils/env'

export default {
  components: {
    DetailLeftCard,
    DetailRightCard,
    CloseOrderDialog,
    ComplainDialog
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
      
      const imgBaseUrl = `${this.$root.webRootApi}/sys/oss/get/image/`
      // 语言图片数组
      const previewImgArr = []
      // 对话数据
      const arr = chatArr.map(item => {
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
      console.log(arr)

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
    },

    // 提交回复 =============================
    resQuestionSub() {
      this.$refs.resFormRef.validate(async valid => {
        if (!valid) return
        this.$refs.upload.submit() // 手动上传发起
        const uploadForm = new FormData() // 携带文件必须使用此对象
        uploadForm.append('id', this.resForm.id)
        uploadForm.append('info', this.resForm.info)
        uploadForm.append('jimi', this.resForm.jimi)
        this.resForm.imgList.forEach(e => {
          uploadForm.append('imgList', e)
        })
        console.log(uploadForm.getAll('imgList'))
        const { data: res } = await this.$http.post('', uploadForm)
        // console.log(res)
        // if (res.out != 'ok') {
        //   return this.$msg.error('回复失败，请重试')
        // }
        // this.$msg.success('提交回复成功，我们会尽快处理并回复您')
        // this.getGoodsList()
      })
    },
    // 提交回复重置
    resQuestioReset() {
      this.$refs.resFormRef.resetFields()
    }
  },
  destroyed() {}
}
</script>

<style lang="scss">
.work-detial-box {
  .el-divider--horizontal {
    margin: 30px 0;
    .el-divider__text {
      font-size: 15px;
      font-weight: 700;
    }
  }

  @media screen and (max-width: 767px) {
  }
  @media screen and (max-width: 1199px) {
  }
}
</style>
