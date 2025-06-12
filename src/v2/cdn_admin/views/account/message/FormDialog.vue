<template>
  <ants-dialog
    v-model="visible"
    ref="dialogRef"
    :title="`${form.id ? '修改' : '发布'}消息`"
    width="1300px"
    top="5vh"
    @close="close"
    :footer="false"
  >
    <ants-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
      :status-icon="false"
      space-class="space-y-6"
      class="-mt-df"
    >
      <div class="flex justify-between">
        <div class="flex items-center">
          <ants-form-item
            label="消息类型"
            prop="type"
            style="margin-right:30px;"
          >
            <ants-radio-group size="mini" v-model="form.type">
              <ants-radio-button :label="1" text="站内信" />
              <ants-radio-button :label="2" text="公告" />
            </ants-radio-group>
          </ants-form-item>

          <ants-form-item
            label="发送对象"
            prop="sendType"
            style="margin-right:30px;"
          >
            <ants-radio-group size="mini" v-model="form.sendType">
              <ants-radio-button :label="2" text="所有人" />
              <ants-radio-button :label="0" text="指定用户" />
              <!-- <ants-radio-button :label="1" text="指定分组" /> -->
            </ants-radio-group>
          </ants-form-item>

          <ants-form-item
            label="用户"
            prop="sendObj"
            v-if="form.sendType === 0"
          >
            <ants-select
              size="small"
              v-model="form.sendObj"
              filterable
              placeholder="请选择用户"
              popper-class="x_type_select"
              :loading="userLoading"
              collapse-tags
              multiple
              style="width:300px;margin-left:-30px;"
            >
              <ants-option
                v-for="item in usersList"
                :key="item.userId"
                :label="item.username || item.mobile || item.mail"
                :value="item.userId + ''"
              />
            </ants-select>
          </ants-form-item>
        </div>

        <div class="flex items-center">
          <el-checkbox
            v-model="form.status"
            :true-label="1"
            :false-label="0"
            v-if="!form.id"
          >
            立即发布
          </el-checkbox>

          <ants-button
            class="ml-lg"
            type="primary"
            size="small"
            icon="el-icon-s-promotion"
            :loading="btnLoading"
            @click="doSave()"
            :text="form.id ? '确认修改' : '确认发布'"
          />
        </div>
      </div>

      <ants-form-item label="消息标题" prop="title">
        <ants-input
          v-model="form.title"
          placeholder="请输入消息标题"
          :maxlength="50"
          show-word-limit
        />
      </ants-form-item>

      <ants-form-item label="消息内容" prop="content">
        <QuillEditor v-model="form.content" />
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
// API
import {
  getMessageInfoById,
  doCreateUpdateMessage
} from '@/v2/cdn_admin/api/account/message'
import { getUserList } from '@/v2/cdn_admin/api/account/users'
// 组件
import QuillEditor from '@/components/quill-editor.vue'

const rules = {
  type: [
    {
      required: true,
      message: '请选择消息类型',
      trigger: ['change', 'blur']
    }
  ],
  sendType: [
    {
      required: true,
      message: '请选择发送对象',
      trigger: ['change', 'blur']
    }
  ],
  sendObj: [
    {
      required: true,
      message: '请选择发送用户',
      trigger: ['change', 'blur']
    }
  ],
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
  ]
}

const defaultForm = {
  id: 0, // 添加时为0
  type: 1, // 消息类型: 1 = 站内信， 2 = 公告消息（无阅读状态）
  sendType: 2, // 发送类型： 0 = 指定user， 1 = 指定分组， 2 = 所有人
  // 发送对象：sendType=0时sendObj=userID 列表，sendType=1时sendObj=GROUPID 列表 ；sendType=2时sendObj为空 ,
  sendObj: [],
  status: 1, // 状态：1 = 正常展示， 0 = 不发布
  title: '', // 消息标题
  content: '' // 消息内容
}

export default {
  components: {
    QuillEditor
  },
  data() {
    return {
      visible: false,
      form: {
        ...defaultForm
      },
      rules,
      btnLoading: false,
      userLoading: false,
      usersList: []
    }
  },
  created() {
    this.getUserListData()
  },
  methods: {
    show(row = {}) {
      this.visible = true
      this.form = {
        ...defaultForm,
        ...row
      }
    },

    doSave() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return

        this.btnLoading = true
        try {
          const { sendObj, sendType } = this.form
          const { data: res } = await doCreateUpdateMessage({
            ...this.form,
            sendObj: sendType == 0 ? sendObj + '' : null
          })
          if (res.code !== 1) return
          this.$msg.success('发布成功')
          this.$emit('refresh')
          this.visible = false
        } finally {
          this.btnLoading = false
        }
      })
    },

    // 获取用户列表
    async getUserListData() {
      this.userLoading = true
      try {
        const { data: res } = await getUserList({
          user: '',
          page: 1,
          limit: 500
        })
        if (res.code !== 1) return
        this.usersList = (res.data || {}).list || []
      } finally {
        this.userLoading = false
      }
    },

    close() {
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
