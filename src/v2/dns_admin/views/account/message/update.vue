<template>
  <ants-form
    :model="form"
    :rules="formRules"
    ref="formRef"
    class="message-update-box"
    label-position="top"
    label-width="80px"
  >
    <div class="content-box animated fadeIn">
      <el-row :gutter="20">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 6 }"
          :md="{ span: 6 }"
          :lg="{ span: 6 }"
          :xl="{ span: 6 }"
        >
          <el-card class="mb-lg">
            <ants-form-item label="消息标题" prop="title">
              <ants-input
                size="small"
                v-model="form.title"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 8 }"
                placeholder="输入消息标题"
              />
            </ants-form-item>
            <ants-form-item label="消息类型" prop="type">
              <ants-radio-group
                v-model="form.type"
                size="mini"
                :disabled="!!form.id"
              >
                <ants-radio :label="2" text="公告" />
                <ants-radio :label="1" text="站内信" />
              </ants-radio-group>
            </ants-form-item>
            <ants-form-item label="发送对象" prop="sendType">
              <ants-radio-group
                v-model="form.sendType"
                @change="changeSendType"
                size="mini"
              >
                <ants-radio :label="2" text="所有人" />
                <ants-radio :label="0" text="指定用户" />
                <!-- <ants-radio :label="1" text="指定分组"/> -->
              </ants-radio-group>
            </ants-form-item>
            <ants-form-item
              :label="'选择' + sendObjText"
              prop="sendObj"
              v-if="form.sendType === 0 || form.sendType === 1"
            >
              <el-select
                size="small"
                v-model="form.sendObj"
                filterable
                :placeholder="'请选择' + sendObjText"
                popper-class="x_type_select"
                style="width:100%;"
              >
                <el-option
                  v-for="(item, index) in usersList"
                  :key="index"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </ants-form-item>

            <div class="mb-xxl">
              <label class="el-form-item__label mr-lg">立即发布</label>
              <el-switch
                v-model="form.status"
                active-color="#13ce66"
                :active-value="1"
                :inactive-value="0"
              >
              </el-switch>
            </div>
            <ants-button
              type="primary"
              size="small"
              icon="el-icon-check"
              :loading="$root.loading"
              @click="saveEditor()"
              text="提交消息"
            />
          </el-card>
        </el-col>
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 18 }"
          :md="{ span: 18 }"
          :lg="{ span: 18 }"
          :xl="{ span: 18 }"
        >
          <ants-form-item prop="content">
            <mavon-editor
              class="mavon_editor_box"
              :ishljs="true"
              codeStyle="atom-one-dark"
              v-model="form.content"
              :toolbars="toolbars"
              placeholder="开始编辑"
              @save="saveEditor"
              @imgAdd="$imgAdd"
              @imgDel="$imgDel"
              ref="editorMdRef"
              :imageFilter="imageFilter"
              v-loading="$root.loading"
            />
          </ants-form-item>
        </el-col>
      </el-row>
    </div>
  </ants-form>
</template>

<script>
// API
import { getItem, doUpdate } from '@/v2/dns_admin/api/account/message'

const defaultForm = {
  id: 0, // 添加时为0
  type: 2, // 消息类型: 1 = 站内信， 2 = 公告消息（无阅读状态）
  sendType: 2, // 发送类型： 0 = 指定user， 1 = 指定分组， 2 = 所有人
  sendObj: '', // 发送对象：sendType=0时sendObj=userID 列表，sendType=1时sendObj=GROUPID 列表 ；sendType=2时sendObj为空 ,
  status: 1, // 状态：1 = 正常展示， 0 = 禁用
  title: '', // 消息标题
  content: '' // 消息内容
}
export default {
  data() {
    return {
      nowTypeText: '添加',
      usersList: [],
      sendObjText: '用户',
      form: {
        ...defaultForm
      },
      formRules: {
        title: [
          {
            required: true,
            message: '请输入消息标题',
            trigger: 'blur'
          }
        ],
        content: [
          {
            required: true,
            message: '请输入消息内容',
            trigger: 'blur'
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
            trigger: 'bulr'
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
        this.$msg.error('上传图片大小不能超过 500kb！')
        return false
      }
      return true
    },

    /**
     * @description: 获取消息数据
     */

    async getEditorData() {
      this.$root.loading = true
      const { data: res } = await getItem(this.form.id)

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

    async saveEditor() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$root.loading = true

        const { data: res } = await doUpdate(this.form)

        this.$root.loading = false

        if (res.code !== 1) return
        this.$msg.success('保存成功')
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

<style lang="scss" scoped>
.mavon_editor_box {
  min-height: 400px;
  height: 700px;
}
</style>
<style lang="less">
.message-update-box {
  .el-form-item {
    margin-bottom: 15px;
  }
  .el-form-item__label {
    line-height: 20px;
  }
  .x_type_select {
    // min-width: 200px !important;
    width: 100%;
  }
}
</style>
