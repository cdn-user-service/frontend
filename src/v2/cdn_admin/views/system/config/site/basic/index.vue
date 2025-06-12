<template>
  <el-card class="animated fadeIn" v-loading="$root.loading">
    <div slot="header">
      <strong>{{ antsT('网站基本信息设置') }}</strong>
    </div>

    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      size="medium"
      label-position="top"
      space-class="space-y-5"
    >
      <ants-form-item
        v-for="item in logoDataArr"
        :key="item.value"
        class="inline-block mr-lg"
        style="margin-top:0;margin-bottom:10px;"
      >
        <div slot="label">
          <strong>{{antsT(`Logo图片（${item.name}）`)}}</strong>
        </div>
        <el-upload
          class="upload-logo-demo"
          :class="`upload-logo-demo-${item.value}`"
          :ref="`uploadLogo${item.value}`"
          action=""
          :on-remove="handleRemove"
          :on-exceed="onExceed"
          :on-change="(file, fileList) => getFile(file, fileList, item)"
          :auto-upload="false"
          :limit="2"
          :show-file-list="false"
          accept=".jpg,.png,.svg,.gif"
          :multiple="false"
          list-type="picture-card"
        >
          <div v-if="item.imgUrl" class="upload-logo-item animated fadeIn">
            <img :src="item.imgUrl" class="avatar" alt="logo" />

            <div class="upload-logo-item_actions">
              <span class="el-icon-edit mx-sm cursor-color"></span>
              <span
                class="el-icon-delete mx-sm cursor-color"
                @click.stop="removeLogoImg(item)"
              ></span>
            </div>
          </div>

          <i class="el-icon-plus animated fadeIn" v-else></i>
        </el-upload>
      </ants-form-item>

      <ants-form-item
        class="inline-block"
        style="margin-top:0;margin-bottom:10px;"
      >
        <div slot="label">
          <strong>Favicon {{antsT('图标')}}</strong>
        </div>
        <el-upload
          class="upload-logo-demo upload-favicon-demo"
          ref="uploadFavicon"
          action=""
          :on-exceed="onExceed"
          :on-change="getIconFile"
          :auto-upload="false"
          :limit="2"
          :show-file-list="false"
          accept=".ico,.png"
          :multiple="false"
          list-type="picture-card"
        >
          <div v-if="faviconImgUrl" class="upload-logo-item animated fadeIn">
            <img :src="faviconImgUrl" class="avatar" alt="favicon" />

            <div class="upload-logo-item_actions">
              <span class="el-icon-edit mx-sm cursor-color"></span>
              <span
                class="el-icon-delete mx-sm cursor-color"
                @click.stop="removeFaviconImg"
              ></span>
            </div>
          </div>

          <i class="el-icon-plus animated fadeIn" v-else></i>
        </el-upload>
      </ants-form-item>

      <ants-form-item style="margin-bottom:10px;">
        <div class="leading-4 text-sm text-ants-text-4">
          <div class="mb-sm">
            {{antsT('Logo 图片支持上传 .png|.jpg|.svg|.gif 文件，且不超过100KB；图片大小150px * 50px。')}}
          </div>
          <div>{{antsT('Favicon 图标支持上传 .ico|.png 文件，且不超过50KB。')}}</div>
        </div>
      </ants-form-item>

      <ants-form-item prop="lang">
        <span slot="label">
          <strong>{{antsT('默认语言')}}</strong>
          <el-tooltip
            class="item"
            effect="dark"
            :content="antsT('在系统初始化时生效。用户设置语言后，将优先采用用户设置的语言。')"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-radio-group v-model="form.lang" size="small">
          <ants-radio-button label="cn" text="简体中文"/>
          <ants-radio-button label="en" text="English"/>
        </ants-radio-group>
      </ants-form-item>

      <ants-form-item prop="webName">
        <span slot="label">
          <strong>{{antsT('网站名称')}}</strong>
          <el-tooltip
            class="item"
            effect="dark"
            :content="antsT('可动态设置网站名称文本，建议不超过8个字符')"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input
          v-model="form.webName"
          placeholder="请输入网站名称（建议不超过 8 个字符）"
          maxlength="50"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="icp">
        <span slot="label">
          <strong>{{antsT('ICP备案号')}}</strong>
          <el-tooltip
            class="item"
            effect="dark"
            :content="antsT('自定义ICP备案号，请务必填写已申请通过的备案号')"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input
          v-model="form.icp"
          placeholder="自定义ICP备案号，请务必填写已申请通过的备案号"
          maxlength="1000"
        ></ants-input>
      </ants-form-item>

      <ants-form-item prop="isp">
        <span slot="label">
          <strong>{{antsT('网监备案号')}}</strong>
          <el-tooltip
            class="item"
            effect="dark"
            :content="antsT('自定义网监备案号，请务必填写已申请通过的备案号')"
            placement="right"
          >
            <span class="el-icon-info ants-icon_info"></span>
          </el-tooltip>
        </span>
        <ants-input
          v-model="form.isp"
          placeholder="自定义网监备案号，请务必填写已申请通过的备案号"
          maxlength="1000"
        ></ants-input>
      </ants-form-item>

      <ants-form-item>
        <ants-button
          class="mt-sm"
          type="primary"
          :loading="btnLoading"
          @click="submitSiteInfo"
          text="保存配置"
        />
      </ants-form-item>
    </ants-form>
  </el-card>
</template>

<script>
const defaultForm = {
  favicon: '',
  // 浅色logo base64
  logoImgLight: '',
  // 深色logo base64
  logoImgDark: '',
  webName: '',
  icp: '',
  isp: '',
  // 默认语言 cn = 中文， en = 英文
  lang: 'cn'
}
export default {
  data() {
    return {
      btnLoading: false,

      form: {
        ...defaultForm
      },
      faviconImgUrl: '',

      formRules: {
        // webName: [
        //   {
        //     required: true,
        //     message: '网站名称不能为空',
        //     trigger: ['change', 'blur']
        //   }
        // ],
        // icp: [
        //   {
        //     required: true,
        //     message: 'ICP备案号不能为空',
        //     trigger: ['change', 'blur']
        //   }
        // ],
        // isp: [
        //   {
        //     required: true,
        //     message: 'ICP备案号不能为空',
        //     trigger: ['change', 'blur']
        //   }
        // ]
      },

      logoDataArr: [
        {
          value: 'light',
          name: '浅色',
          imgUrl: ''
        },
        {
          value: 'dark',
          name: '深色',
          imgUrl: ''
        }
      ]
    }
  },
  created() {
    this.getData()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取数据
     */

    async getData() {
      const { basic } = await this.$listeners.getBasicConfig()
      this.form = {
        ...defaultForm,
        ...basic
      }

      this.logoDataArr[0].imgUrl = basic.logoImgLight || ''
      this.logoDataArr[1].imgUrl = basic.logoImgDark || ''
      this.faviconImgUrl = basic.favicon || ''
    },

    /**
     * @description: 表单修改提交
     */

    submitSiteInfo() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.btnLoading = true

        // 构造请求数据
        this.form.logoImgLight = this.logoDataArr[0].imgUrl
        this.form.logoImgDark = this.logoDataArr[1].imgUrl
        this.form.favicon = this.faviconImgUrl
        console.log(this.form)

        const res = await this.$listeners.updateBasicConfig({
          basic: this.form
        })

        this.btnLoading = false

        if (res.code !== 1) return
        this.$msg.success('保存配置成功')

        const result = await this.$doDelete({
          title: '保存配置成功',
          content: '网站信息配置成功，是否立即刷新页面？',
          type: 'success'
        })
        if (!result) return
        location.reload()
      })
    },

    /* ============================
     *         文件上传
     *  ============================
     * */
    // 点击删除
    removeLogoImg(item) {
      item.imgUrl = ''
      this.$refs[`uploadLogo${item.value}`][0].clearFiles()
    },

    // 移除
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },

    // 文件上传超出最大限制钩子
    onExceed(files) {
      console.log(files)
      this.$msg.error('最多上传 1 张图片，请重新选择')
    },

    // 获取base64 文件
    getFile(file, fileList, item) {
      console.log(file, fileList)

      // 限制文件上传大小不超过 100KB
      if (file.size / 1024 > 100) {
        fileList.splice(0, 1)
        this.$msg.error('Logo图片大小不能超过 100KB')
        return
      }

      // 替换掉文件，保持只有一个文件
      if (fileList.length > 1) {
        fileList.splice(0, 1)
      }

      // 转 base64
      this.getBase64(file.raw).then(res => {
        item.imgUrl = res
      })
    },

    /* ============================
     *         icon上传
     *  ============================
     * */
    // 移除icon
    removeFaviconImg() {
      this.faviconImgUrl = ''
      this.$refs.uploadFavicon.clearFiles()
    },

    // 获取icon 的 base64 文件
    getIconFile(file, fileList) {
      // 限制文件上传大小不超过 50KB
      if (file.size / 1024 > 50) {
        fileList.splice(0, 1)
        this.$msg.error('favicon 图标大小不能超过 50KB')
        return
      }

      // 替换掉文件，保持只有一个文件
      if (fileList.length > 1) {
        fileList.splice(0, 1)
      }

      // 转 base64
      this.getBase64(file.raw).then(res => {
        this.faviconImgUrl = res
      })
    },

    // 转 base 64
    getBase64(file) {
      return new Promise(function(resolve, reject) {
        const reader = new FileReader()
        let imgResult = ''
        reader.readAsDataURL(file)
        reader.onload = function() {
          imgResult = reader.result
        }
        reader.onerror = function(error) {
          reject(error)
        }
        reader.onloadend = function() {
          resolve(imgResult)
        }
      })
    }
  }
}
</script>

<style lang="scss">
.upload-logo-demo.upload-logo-demo-light {
  .el-upload--picture-card {
    background-color: #252b3a;
  }
}
.upload-logo-demo {
  .el-upload--picture-card {
    width: 180px;
    height: 60px;
    line-height: 66px;
    > i {
      font-size: 22px;
    }
  }
}

.upload-logo-item {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 4px 14px;
  border-radius: 6px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    vertical-align: top;
  }
  .upload-logo-item_actions {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    line-height: 60px;
    font-size: 22px;
    background-color: rgba(0, 0, 1, 0.7);
    color: #fefefe;
    transition: all 0.3s;
  }

  &:hover {
    .upload-logo-item_actions {
      display: block;
    }
  }
}

.upload-favicon-demo {
  .upload-logo-item {
    img {
      height: 32px;
      width: 32px;
      border-radius: 4px;
      margin-bottom: -4px;
      vertical-align: baseline;
    }
  }
}
</style>
