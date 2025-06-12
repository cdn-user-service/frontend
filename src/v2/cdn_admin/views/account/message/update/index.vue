<template>
  <ants-form
    :model="form"
    :rules="formRules"
    ref="formRef"
    class="msg_add_box"
    label-position="top"
  >
    <el-card class="content-box animated fadeIn">
      <div class="flex justify-between items-center">
        <div class="flex justify-between items-center mb-lg">
          <ants-form-item prop="type" class="mr-xl" style="margin-bottom: 0;">
            <ants-radio-group v-model="form.type" size="small">
              <ants-radio :label="1" text="站内信" />
              <ants-radio :label="2" text="公告" />
            </ants-radio-group>
          </ants-form-item>

          <!-- <ants-form-item  prop="sendType" style="margin-bottom: 0;">
          <ants-radio-group v-model="form.sendType" @change="changeSendType">
            <ants-radio-button :label="2" text="所有人" />
            <ants-radio :label="0" text="指定用户" />
            <ants-radio :label="1" text="指定分组"/>
          </ants-radio-group>
        </ants-form-item> -->
          <ants-form-item
            :label="'选择' + sendObjText"
            prop="sendObj"
            v-if="form.sendType === 0 || form.sendType === 1"
            style="margin-bottom: 0;"
          >
            <ants-button icon="el-icon-plus" size="small" text="请选择用户" />
            <!-- <ants-select
              size="small"
              v-model="form.sendObj"
              filterable
              :placeholder="'请选择' + sendObjText"
              popper-class="x_type_select"
            >
              <ants-option
                v-for="(item, index) in usersList"
                :key="index"
                :label="item"
                :value="item"
              />
            </ants-select> -->
          </ants-form-item>
        </div>

        <div class="-mt-lg">
          <ants-checkbox
            v-model="form.status"
            :true-label="1"
            :false-label="0"
            text="是否发布"
          />
          <ants-button
            class="ml-lg"
            type="primary"
            size="small"
            icon="el-icon-s-promotion"
            :loading="$root.loading"
            @click="submitForm()"
            text="确认提交"
          />
        </div>
      </div>
      <ants-form-item prop="title">
        <ants-input
          v-model="form.title"
          placeholder="请输入消息标题"
          maxlength="200"
        />
      </ants-form-item>

      <ants-form-item prop="content" style="margin:0;">
        <mavon-editor
          class="mavon_editor_box"
          :ishljs="true"
          codeStyle="atom-one-dark"
          v-model="form.content"
          :toolbars="toolbars"
          :placeholder="antsT('开始编辑')"
          @save="submitForm"
          @imgAdd="$imgAdd"
          @imgDel="$imgDel"
          ref="editorMdRef"
          :imageFilter="imageFilter"
          v-loading="$root.loading"
        />
      </ants-form-item>
    </el-card>
  </ants-form>
</template>

<script>
import Vue from 'vue'

import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

// API
import {
  getMessageInfoById,
  doCreateUpdateMessage
} from '@/v2/cdn_admin/api/account/message'

Vue.use(mavonEditor)

export default {
  data() {
    return {
      nowTypeText: '添加',
      usersList: [],
      sendObjText: '用户',
      form: {
        id: 0, // 添加时为0
        type: 1, // 消息类型: 1 = 站内信， 2 = 公告消息（无阅读状态）
        sendType: 2, // 发送类型： 0 = 指定user， 1 = 指定分组， 2 = 所有人
        // 发送对象：sendType=0时sendObj=userID 列表，sendType=1时sendObj=GROUPID 列表 ；sendType=2时sendObj为空 ,
        sendObj: '',
        status: 0, // 状态：1 = 正常展示， 0 = 禁用
        title: '', // 消息标题
        content: '' // 消息内容
      },
      formRules: {
        title: [
          {
            required: true,
            message: '请输入消息标题',
            trigger: ['change', 'blur']
          }
        ],
        content: [
          {
            required: true,
            message: '请输入消息内容',
            trigger: ['change', 'blur']
          }
        ],
        type: [
          {
            required: true,
            message: '请选择消息类型',
            trigger: 'change'
          }
        ],
        sendType: [
          {
            required: true,
            message: '请选择发送对象',
            trigger: 'change'
          }
        ],
        sendObj: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ]
      },

      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: true, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: true, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: true, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true // 预览
      }
    }
  },
  created() {
    // 如果为修改，则获取当前消息内容
    if (this.$route.query.id != 'add') {
      this.nowTypeText = '编辑'
      this.form.id = this.$route.query.id
      this.getEditorData()
    } else {
      this.nowTypeText = '添加'
      this.form.id = 0
    }
  },
  mounted() {},
  methods: {
    /**
     * @description: 图片过滤函数，返回 true表示图片合法，false图片不合法
     *                限制上传图片大小不能超过 500 kb
     * @param {*} val
     */

    imageFilter(val) {
      if (val.size > 1024 * 500) {
        this.$msg.error(this.antsT('上传图片大小不能超过500kb'))
        return false
      }
      return true
    },

    /**
     * @description: 获取消息数据
     */

    async getEditorData() {
      this.$root.loading = true
      const { data: res } = await getMessageInfoById(this.form.id)

      this.$root.loading = false
      if (res.code !== 1) return
      this.$nextTick(() => {
        this.form = res.data || {}
      })
    },

    /**
     * @description: 保存消息
     *               建议保存的时候保存两个字段，
     *               1、一个字段保存 value,也就是 md 格式以便后台获取 markdown 做修改；
     *               2、一个字段保存 render,也就是 HTML 格式，供给前台渲染展示的数据
     * @param {*} value
     * @param {*} render
     * @return {*}
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$root.loading = true

        const { data: res } = await doCreateUpdateMessage(this.form)

        this.$root.loading = false

        if (res.code !== 1) return
        this.$msg.success(this.antsT('操作成功'))
        this.$router.replace('/account/message/list')
      })
    },

    // 发送对象类型切换
    changeSendType(val) {
      this.form.sendObj = null
      if (val === 0) {
        this.sendObjText = '用户'
      }
      if (val === 1) {
        this.sendObjText = '分组'
      }
    },

    // 上传图片 直接将图片保存为base64编码
    async $imgAdd(pos, $file) {
      // console.log($file)
      // 将图片上传到服务器.
      const formdata = new FormData()
      formdata.append('file', $file)

      const { data } = await this.$http.post('', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
      this.$refs.editorMdRef.$img2Url(pos, data.path)
    },
    // 删除图片
    $imgDel($file) {
      console.log($file)
    }
  },
  destroyed() {}
}
</script>

<style lang="scss">
.mavon_editor_box {
  min-height: 400px;
  height: 700px;
  background-color: theme('colors.ants-bg-1');
  box-shadow: none !important;
  border: 1px solid theme('colors.ants-border-4') !important;

  .v-note-op,
  .content-input-wrapper,
  .v-show-content,
  .auto-textarea-input {
    background-color: theme('colors.ants-bg-1') !important;
  }
  .v-show-content,
  .auto-textarea-input {
    color: theme('colors.ants-text-1') !important;
  }
}
.v-note-help-wrapper .v-note-help-content .v-note-help-show {
  background-color: theme('colors.ants-bg-1') !important;
  color: theme('colors.ants-text-1') !important;
}
.markdown-body table tr,
.markdown-body .highlight pre,
.markdown-body pre {
  background-color: theme('colors.ants-bg-3') !important;
}

.msg_add_box {
  .el-form-item {
    margin-bottom: 10px;
  }
  .el-form-item__label {
    line-height: 20px;
    margin-bottom: 5px;
  }
  .x_type_select {
    min-width: 200px !important;
  }
}
</style>
