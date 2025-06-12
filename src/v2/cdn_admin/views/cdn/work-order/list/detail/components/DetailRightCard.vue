<template>
  <el-card class="chat-scroll-box">
    <div slot="header" class="flex justify-between items-center">
      <div class="flex items-center">
        <el-avatar :size="40" :src="userAvatar" alt="AntsCDN"></el-avatar>
        <div class="pl-sm">
          <div class="font-bold mb-2">{{ workOrderData.userName }}</div>
          <div class="text-ants-text-4 text-sm">
            <span class="text-success el-icon-success text-lg"></span>
            <span> ID：{{ workOrderData.userId }}</span>
          </div>
        </div>
      </div>
      <div class="text-ants-text-3" style="font-size:18px;">
        <span
          class="el-icon-refresh cursor-color mr-sm"
          @click="$emit('getGoodsList')"
        ></span>
        <span class="el-icon-delete-solid cursor-color"></span>
      </div>
    </div>

    <el-scrollbar>
      <ul class="work_chat_box py-lg pr-sm">
        <li v-for="item in chatArr" :key="item.id" class="mb-xxl">
          <!-- 用户的 -->
          <div v-if="item.senderType == 2" class="flex">
            <div class="chat_avater">
              <el-avatar :size="30" :src="userAvatar" alt="CDN"></el-avatar>
            </div>
            <div class="chat_main">
              <div class="text-sm text-ants-text-2 mb-xs">
                <span>{{ item.createdate }} </span>
                <span class="el-icon-time"></span>
              </div>

              <div class="chat_content py-xs px-sm">
                <div
                  class="text-primary"
                  style="color:#464646"
                  v-if="item.text !== ''"
                >
                  {{ item.text }}
                </div>

                <div v-if="item.img !== ''">
                  <div class="chat_content_img">
                    <el-image
                      class="shadow"
                      :src="item.img"
                      fit="contain"
                      :preview-src-list="previewImgArr"
                      alt="AntsCDN"
                    >
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 客服的 -->
          <div v-else class="chat_right flex">
            <div class="chat_main">
              <div class="text-sm text-ants-text-2 mb-xs">
                <span class="el-icon-time"></span>
                <span> {{ item.createdate }}</span>
              </div>
              <div class="chat_content py-xs px-sm">
                <div class="" v-if="item.text !== ''">
                  {{ item.text }}
                </div>
                <div v-if="item.img !== ''">
                  <div class="chat_content_img">
                    <el-image
                      class="shadow"
                      :src="item.img"
                      fit="contain"
                      :preview-src-list="previewImgArr"
                      alt="AntsCDN"
                    >
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                  </div>
                </div>
              </div>
            </div>
            <div class="chat_avater">
              <el-avatar :size="30" :src="circleUrl" alt="AntsCDN"></el-avatar>
            </div>
          </div>
        </li>
        <li id="scrollEnd" style="height:1px;"></li>
      </ul>
    </el-scrollbar>

    <div
      class="work_chat_input"
      v-if="workOrderData.status != 3"
      v-loading="btnLoading"
      element-loading-spinner="el-icon-loading"
    >
      <el-input
        placeholder="回复..."
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 8 }"
        @keydown.enter.native="submitOrderback()"
        @paste.native="pasteImg($event)"
        v-model="inputContent"
      ></el-input>
      <el-upload
        class="upload-demo"
        ref="upload"
        action=""
        :show-file-list="false"
        :on-exceed="onExceed"
        :on-success="onSuccess"
        :on-change="uploadImgChange"
        :http-request="uploadImg"
        :auto-upload="false"
        :limit="1"
        accept=".jpg,.png,.svg,.gif"
        multiple
        list-type="picture"
      >
        <span class="el-icon-picture"></span>
      </el-upload>
      <span
        slot="append"
        class="el-icon-s-promotion"
        @click="submitOrderback()"
      ></span>
    </div>
  </el-card>
</template>

<script>
// API
import {
  doReplayWorkOrder,
  doOssUpload
} from '@/v2/cdn_admin/api/cdn/work-order'

export default {
  props: {
    // 当前工单数据
    workOrderData: {
      type: Object,
      default: () => ({
        order_number: null,
        status: 0
      })
    },
    // 记录
    orderChatArr: {
      type: Array,
      default: () => []
    },
    // 图片预览数组
    previewImgArr: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    chatArr() {
      return this.orderChatArr
    }
  },
  data() {
    return {
      id: this.$route.query.id,
      // 客服头像
      circleUrl: require('@/assets/img/ants-avatar.png'),
      // 用户头像
      userAvatar: require('@/assets/img/avatar.png'),
      // 输入框内容
      inputContent: '',
      btnLoading: false
    }
  },
  created() {},
  mounted() {
    // 对话信息自动滚动到底部
    setTimeout(() => {
      document.getElementById('scrollEnd').scrollIntoView(true)
    }, 1000)
  },
  destroyed() {},
  methods: {
    /**
     * @description: 输入框粘贴上传图片
     * @param {*} event
     */

    pasteImg(event) {
      // 粘贴上传图片
      const txt = event.clipboardData.getData('Text')
      // 检测到是文字，过滤
      if (typeof txt == 'string' && txt !== '') return
      let file = null
      const items = (event.clipboardData || window.clipboardData).items
      if (items.length) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            file = items[i].getAsFile()
            // 图片上传
            console.log(file)
            // this.handleChange(file)
            if (!this.canUpload) {
              this.canUpload = !this.canUpload
            }
            break
          }
        }
      }
    },

    /**
     * @description: 回复提交
     */

    async submitOrderback(imgUrl = '') {
      // 如果已结单
      if (this.workOrderData.status == 3) return
      // 阻止换行
      const e = window.event || arguments[0]
      if (e.key == 'Enter' || e.code == 'Enter' || e.keyCode == 13) {
        e.returnValue = false
      }
      console.log('object')

      const trimContent = this.inputContent.trim()

      if (!imgUrl && trimContent == '') {
        return this.$msg.error('请输入要回复的内容')
      }

      this.btnLoading = true

      const contentJson = JSON.stringify({
        text: trimContent,
        img: imgUrl
      })
      const { data: res } = await doReplayWorkOrder({
        workOrderId: this.id,
        content: contentJson
      })
      this.btnLoading = false

      if (res.code !== 1) return

      this.$emit('getGoodsList')

      if (trimContent != '') {
        this.inputContent = ''
      }
      this.$msg.success('发送成功！')
    },

    // 文件上传超出最大限制钩子
    onExceed(files) {
      this.$msg.error('最多上传 9 张图片，请重新选择')
    },

    uploadImg(param) {},

    // 选中图片
    async uploadImgChange(file, fileList) {
      if (file.size / 1024 / 1024 > 1) {
        this.$msg.error('图片大小不能超过 1 MB')
        return
      }
      this.updateImg(file.raw)
    },

    onSuccess(response, file, fileList) {
      console.log(fileList)
    },

    /**
     * @description: 上传图片，每次只能上传一张图片
     */

    async updateImg(imgRaw) {
      if (this.workOrderData.status == 3) return

      this.btnLoading = true
      // 手动上传发起
      this.$refs.upload.submit()
      // 携带文件必须使用此对象
      const uploadForm = new FormData()
      uploadForm.append('file', imgRaw)

      const { data: res } = await doOssUpload(uploadForm)

      if (res.code !== 1) {
        this.btnLoading = false
        return
      }

      // 保存 图片URL 到表单
      this.submitOrderback(res.url)
    }
  }
}
</script>

<style lang="scss" scoped>
.work_chat_box {
  $avatar-width: 40px;
  .chat_avater {
    width: $avatar-width;
  }

  .chat_main {
    flex: 1;
    padding-right: $avatar-width;
  }

  .chat_content {
    width: auto;
    display: inline-block;
    line-height: 26px;
    font-size: 13px;
    text-align: left;
    background-color: theme('colors.primary-light');
    color: theme('colors.ants-text-2');
    border-radius: 14px 14px 14px 0;
    overflow: hidden;

    .chat_content_img {
      max-height: 300px;
      max-width: 300px;
      line-height: 0;
      padding: 0;
      border: 1px solid theme('colors.ants-bg-4');
      margin: 10px 0;
      &:last-child {
        margin: 0;
      }
    }
  }
  .chat_right {
    .chat_main {
      padding-left: $avatar-width;
      padding-right: 0;
      text-align: right;
    }
    .chat_avater {
      text-align: right;
    }
    .chat_content {
      background-color: theme('colors.ants-bg-5');
      color: theme('colors.ants-text-2');
      border-radius: 14px 14px 0 14px;
    }
  }
}
</style>

<style lang="scss">
.work_chat_box {
  .chat_content_img {
    .el-image,
    .el-image__inner {
      max-height: 300px;
      max-width: 300px;
    }
  }
}

.chat-scroll-box {
  .el-card__body {
    padding: 0 10px 10px 20px;
  }
  .el-scrollbar {
    height: 550px;
  }
  .el-scrollbar__wrap {
    scroll-behavior: smooth;
    overflow-x: hidden;
  }
}

.work_chat_input {
  padding-top: 10px;
  position: relative;
  .el-textarea__inner,
  .el-input__inner {
    line-height: 46px;
    height: 46px;
    padding-left: 30px;
    padding-right: 90px;
    border: 2px solid theme('colors.ants-bg-5');
    background-color: theme('colors.ants-bg-5');
    border-radius: 30px;
  }
  .el-textarea__inner {
    line-height: 32px;
    height: auto;
  }

  .el-input__prefix {
    left: 5px;
    top: 1px;
  }
  // .el-input__inner:focus {
  //   border-color: theme('colors.primary');
  // }

  .el-icon-s-promotion {
    position: absolute;
    right: 10px;
    top: 16px;
    z-index: 1;
    line-height: 34px;
    width: 34px;
    text-align: center;
    font-size: 15px;
    color: theme('colors.ants-text-1');
    background-color: #e1e4f9;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s;
  }
  .el-icon-s-promotion:hover {
    color: #fff;
    background-color: theme('colors.primary');
  }

  .el-icon-picture {
    position: absolute;
    right: 58px;
    top: 24px;
    z-index: 1;
    font-size: 20px;
    cursor: pointer;
    color: theme('colors.ants-text-1');
  }
  .el-icon-picture:hover {
    color: theme('colors.primary');
  }
}
</style>
