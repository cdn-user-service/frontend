<template>
  <div>
    <el-card class="card_main animated fadeIn">
      <div class="flex items-center mb-lg">
        <ants-button
          size="mini"
          type="primary"
          plain
          icon="el-icon-arrow-left"
          @click="$router.push(`./step-2?id=${$route.query.parentId}`)"
          class="mr-lg"
          text="上一步"
        />
        <TitleBorder :title="$route.query.title" />
      </div>
      <div class="creat_work_box">
        <ants-form
          ref="workOrderFormRef"
          status-icon
          :model="workOrderForm"
          :rules="workOrderFormRules"
          label-width="120px"
          :label-position="$store.state.isPhone ? 'top' : 'left'"
        >
          <ants-form-item label="紧急程度" prop="urgency" required>
            <ants-radio-group
              v-model="workOrderForm.urgency"
              style="padding-top:12px;"
            >
              <ants-radio
                v-for="(item, key) in urgencyObj"
                :key="key"
                :label="key"
                :text="item"
              />
            </ants-radio-group>
          </ants-form-item>
          <ants-form-item label="问题标题" prop="title">
            <ants-input
              v-model="workOrderForm.title"
              placeholder="请填写问题标题(必填)"
              maxlength="500"
            />
          </ants-form-item>
          <ants-form-item label="问题描述" prop="content">
            <ants-input
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 10 }"
              v-model="workOrderForm.content"
              placeholder="请填写问题描述(必填)"
              maxlength="20000"
            />
          </ants-form-item>
          <ants-form-item label="上传图片" style="margin-bottom:30px;">
            <!-- <el-button size="small">添加附件</el-button> -->
            <el-upload
              action=""
              list-type="picture-card"
              ref="upload"
              :on-preview="handlePreview"
              :on-exceed="onExceed"
              :on-change="uploadImgChange"
              :http-request="uploadImg"
              :auto-upload="false"
              :limit="9"
              accept=".jpg,.png,.svg,.gif"
              multiple
            >
              <i class="el-icon-plus"></i>
            </el-upload>
            <div class="text-ants-text-4 text-sm">
              {{antsT('支持上传 .png|.jpg|.gif|.svg 文件，不超过 1MB，最多上传 9 张图片')}}
            </div>
            <!-- <el-upload
              class="upload-demo"
              action=""
              ref="upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-exceed="onExceed"
              :on-change="uploadImgChange"
              :http-request="uploadImg"
              list-type="picture"
              :auto-upload="false"
              :limit="3"
              accept=".jpg,.png,.svg,.gif"
              name="pem"
              multiple
            >
              <el-button
                size="small"
                type="primary"
                plain
                icon="el-icon-picture"
                >上传图片</el-button
              >
              <span
                slot="tip"
                class="el-upload__tip margin-left-xs ants-font-4 text-sm"
              >
                只能上传jpg/png文件，且不超过500kb
              </span>
            </el-upload> -->
          </ants-form-item>
          <!-- <ants-form-item label="机密信息(选填)" prop="jimi">
            <el-input
              size="small"
              type="textarea"
              :rows="6"
              v-model="workOrderForm.jimi"
              placeholder="请在此处填写实例名、账号、密码等机密信息，提交后机密信息将做加密处理"
              maxlength="1000"
            ></el-input>
          </ants-form-item> -->
          <!-- <ants-form-item label="手机号" prop="tel">
            <el-input
              v-model="workOrderForm.tel"
              placeholder="请输入手机号"
              maxlength="32"
            ></el-input>
          </ants-form-item> -->
          <!-- <ants-form-item label="接收提醒">
            <div class="accept_box flex ">
              <div class="margin-right-lg">
                <div class="text-sm">微信公众号提醒</div>
                <span class="text-sm ants-font-4"
                  >微信扫一扫，随时查看工单进度</span
                >
                <div class="code_box">
                  <el-image :src="code" fit="cover"></el-image>
                </div>
              </div>
              <div>
                <div class="text-sm">手机短信提醒</div>
                <span class="text-sm ants-font-4"
                  >您可以设置接收短信时间段</span
                >
                <div>
                  <ants-radio-group v-model="workOrderForm.time">
                    <ants-radio label="all" text="任何时间"/>
                    <ants-radio label="day" text="每日9:00 - 18:00"/>
                    <ants-radio label="no" text="不提醒"/>
                  </ants-radio-group>
                </div>
              </div>
            </div>
          </ants-form-item> -->
          <ants-form-item class="mt-lg">
            <ants-button
              type="primary"
              :loading="btnLoading"
              @click="submitWorkOrder"
              text="提交工单"
            />
          </ants-form-item>
        </ants-form>
      </div>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog :visible.sync="imgDialogVisible">
      <img
        style="max-width:100%;margin:0 auto;display:block;"
        :src="dialogImageUrl"
        alt=""
      />
    </el-dialog>
  </div>
</template>

<script>
// API
import {
  doCreateWorkOrder,
  doOssUpload
} from '@/v2/cdn_users/api/cdn/work-order'

// 紧急程度
const urgencyObj = {
  1: '普通咨询',
  2: '操作体验问题',
  3: '业务/系统异常影响问题',
  4: '业务完全不可用'
}
export default {
  data() {
    return {
      urgencyObj,
      // 创建工单数据
      fileList: [],
      imgList: [],
      btnLoading: false,
      workOrderForm: {
        // 所属问题分类ID
        category_id: this.$route.params.id,
        // 紧急情况，
        urgency: '1',
        title: '',
        content: '',
        // 图片URL地址，以 逗号 分隔的字符串
        imgfiles: ''
        // tel: '',
        // time: 'all'
      },
      workOrderFormRules: {
        title: [
          {
            required: true,
            message: '请填写问题标题(必填)',
            trigger: ['change', 'blur']
          }
        ],
        content: [
          {
            required: true,
            message: '请填写问题描述(必填)',
            trigger: ['change', 'blur']
          }
        ],
        tel: [
          {
            required: true,
            message: '请输入手机号',
            trigger: ['change', 'blur']
          }
        ]
      },

      // 图片预览
      imgDialogVisible: false,
      dialogImageUrl: ''
    }
  },
  created() {
    console.log(this.$route)
  },
  mounted() {},
  methods: {
    handlePreview(file) {
      this.dialogImageUrl = file.url
      this.imgDialogVisible = true
    },

    // 文件上传超出最大限制钩子
    onExceed(files) {
      this.$msg.error(this.antsT('最多上传 9 张图片，请重新选择'))
    },

    uploadImg(param, fileList) {
      // console.log(param)
    },

    uploadImgChange(file, fileList) {
      this.imgList = []
      fileList.some((item, idx) => {
        // 限制文件上传大小不超过 100KB
        if (item.size / 1024 / 1024 > 1) {
          fileList.splice(idx, 1)
          this.$msg.error(this.antsT('图片大小不能超过 1 MB'))
          return false
        } else {
          this.imgList.push(item.raw)
        }
      })
    },

    /**
     * @description: 提交工单
     */

    submitWorkOrder() {
      this.$refs.workOrderFormRef.validate(async valid => {
        if (!valid) return
        if (this.imgList.length) {
          this.updateImg()
        } else {
          this.submitForm()
        }
      })
    },

    /**
     * @description: 上传图片到服务器
     */

    async updateImg() {
      this.btnLoading = true
      // 手动上传发起
      this.$refs.upload.submit()
      // 携带文件必须使用此对象
      const imgArr = []
      this.imgList.forEach(async (item, idx) => {
        const uploadForm = new FormData()
        uploadForm.append('file', item)
        const { data: res } = await doOssUpload(uploadForm)
        if (res.code !== 1) return
        imgArr.push(res.url)
        if (imgArr.length === this.imgList.length) {
          this.submitForm(imgArr + '')
        }
      })

      // 判断是否上传成功
      //   res.every(item => {
      //       if (item.code !== 1) {
      //           return false
      //       }
      //   })
      // const imgUrlArr = []
      // const site =
      //   this.debug
      //     ? 'https://www.cdn.com'
      //     : this.$root.webRootSite
      // imgUrlArr = res.map(item => site + item.data)

      // this.submitForm(imgUrlArr.toString())
    },

    /**
     * @description: 表单内容提交
     */

    async submitForm(imgfiles = '') {
      this.btnLoading = true
      const { urgency, title, content } = this.workOrderForm
      const { data: res } = await doCreateWorkOrder({
        // 分类ID
        categoryId: this.$route.query.id,
        title,
        description: content,
        // 紧急程度
        urgentLevel: urgency,
        // 图片URL
        images: imgfiles
      })
      this.btnLoading = false
      if (res.code !== 1) return

      this.$msg.success(this.antsT('工单提交成功，我们会尽快处理并回复您'))
      // 跳转到工单列表
      this.$router.push('/cdn/work-order/list')
    }
  }
}
</script>

<style lang="scss" scoped>
.creat_work_box {
  .ants-radio {
    display: block;
    margin: 0;
    margin-bottom: 10px;
  }

  .accept_box {
    .code_box {
      width: 120px;
      height: 120px;
      border: 1px solid #eee;
      .el-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
