<template>
  <ants-dialog
    v-model="dialogVisible"
    ref="dialogRef"
    :title="title + 'URL转发'"
    width="900px"
    top="5vh"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="110px"
      :status-icon="false"
      space-class="space-y-6"
    >
      <ants-form-item label="选择用户" prop="userId" v-if="isAdmin">
        <QueryUserSelect v-model="form.userId" v-if="!form.id" />
        <ants-input v-model="form.user.username" disabled v-else />
      </ants-form-item>

      <ants-form-item label="选择套餐" prop="serialNumber">
        <QueryPlanSelect
          v-model="form.serialNumber"
          :user-id="form.userId"
          ref="QueryPlanSelectRef"
          v-if="!form.id"
        />
        <ants-input v-model="form.plan.name" disabled v-else />
      </ants-form-item>

      <ants-form-item label="绑定域名" prop="serverName">
        <div class="flex items-center">
          <ants-input v-model="form.serverName" placeholder="请输入绑定域名" />
          <!-- <el-button
            type="primary"
            plain
            size="small"
            @click="toEditSsl()"
          >
            配置证书
          </el-button> -->
        </div>
      </ants-form-item>

      <ants-form-item label="转发方式" prop="rewriteType">
        <ants-radio-group v-model="form.rewriteType">
          <ants-radio :label="1" text="REWRITE转发" />
          <ants-radio :label="2" text="JS转发" />
        </ants-radio-group>
      </ants-form-item>

      <div v-if="form.rewriteType === 1">
        <ants-form-item label="跳转地址" prop="target">
          <ants-input v-model="form.target" placeholder="请输入跳转地址">
            <ants-select
              v-model="form.scheme"
              slot="prepend"
              placeholder="协议"
              style="width:110px;"
            >
              <el-option label="http://" value="http"></el-option>
              <el-option label="https://" value="https"></el-option>
              <!-- <el-option label="跟随" value="$scheme"></el-option> -->
            </ants-select>
          </ants-input>
        </ants-form-item>

        <ants-form-item
          label="参数设置"
          prop="followMode"
          style="margin-top:10px;"
        >
          <ants-radio-group v-model="form.followMode">
            <ants-radio label="follow" text="跟随URL" />
            <ants-radio label="assign" text="指定URL" />
          </ants-radio-group>
        </ants-form-item>

        <!-- <ants-form-item label="跳转协议" prop="scheme">
        <ants-radio-group v-model="form.scheme">
          <el-radio label="http" />
          <el-radio label="https" />
          <ants-radio label="$scheme" text="协议跟随" />
        </ants-radio-group>
      </ants-form-item> -->

        <ants-form-item label="跳转方式" prop="rewriteMode">
          <ants-radio-group v-model="form.rewriteMode">
            <el-radio :label="301" />
            <el-radio :label="302" />
            <el-radio :label="303" />
            <el-radio :label="307" />
          </ants-radio-group>
        </ants-form-item>
      </div>
      <ants-form-item
        v-else-if="form.rewriteType === 2"
        label=""
        prop="jsContent"
      >
        <span slot="label">
          转发内容 <br />
          <div class="text-primary cursor-pointer pl-sm ">
            <div @click="getJsContent()">
              引用模板
              <i class="el-icon-paperclip"></i>
            </div>
          </div>
        </span>
        <ants-input
          v-model="form.jsContent"
          placeholder="请输入转发内容"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 12 }"
        />
      </ants-form-item>

      <ants-form-item label="追加别名" prop="alias">
        <ants-input
          v-model="form.alias"
          placeholder="追加别名，一行一个"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 10 }"
        />
      </ants-form-item>

      <ants-form-item label="备注信息" prop="remark">
        <ants-input v-model="form.remark" placeholder="请输入备注信息" />
      </ants-form-item>
    </ants-form>

    <SslDialog ref="SslDialogRef" @submit="submitSsl" />
  </ants-dialog>
</template>

<script>
// 组件
import QueryUserSelect from '@/v2/cdn_admin/components/QueryUserSelect'
import SslDialog from './SslDialog'
import jsContent from './js-content'

const PROCESS_NAME = process.env.VUE_APP_NAME
// api
const { doSaveRewrite } = require(`@/v2/${PROCESS_NAME}/api/cdn/url-forwarding`)

const defaultForm = {
  // 添加时 id为 0
  id: 0,
  // 用户ID
  userId: null,
  // 绑定套餐
  serialNumber: null,
  //
  alias: '',
  scheme: 'http',
  rewriteMode: 301,
  // 转发方式
  rewriteType: 1,
  // 转发内容, 转发方式 = 2 时
  jsContent: '',
  // 域名
  serverName: '',
  target: '',
  // 备注信息
  remark: '',
  // 状态
  status: 1,

  // 跟随方式
  followMode: 'follow',

  // 证书
  certStr: '',
  keyStr: '',
  notAfter: null
}

export default {
  components: {
    SslDialog,
    QueryUserSelect,
    QueryPlanSelect:
      PROCESS_NAME === 'cdn_admin'
        ? () => import('@/v2/cdn_admin/components/QueryPlanSelect')
        : () => import('@/v2/cdn_users/components/QueryPlanSelect')
  },
  data() {
    // 验证规则
    const { isDomain, isDomains, isUrl } = this.$validator

    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',

      title: '添加',
      dialogVisible: false,
      form: {
        ...defaultForm
      },

      formRules: {
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: 'change'
          }
        ],
        serialNumber: [
          {
            required: true,
            message: '请选择套餐',
            trigger: 'change'
          }
        ],
        rewriteType: [
          {
            required: true,
            message: '请选择转发方式',
            trigger: 'change'
          }
        ],
        jsContent: {
          required: true,
          message: '请输入转发内容',
          trigger: ['change', 'blur']
        },

        serverName: [
          {
            required: true,
            message: '请输入绑定域名',
            trigger: ['change', 'blur']
          },
          {
            validator: isDomain(),
            trigger: 'blur'
          }
        ],
        target: [
          {
            required: true,
            message: '请输入跳转地址',
            trigger: ['change', 'blur']
          }
          // {
          //   validator: isUrl(),
          //   trigger: 'blur'
          // }
        ],
        followMode: [
          {
            required: true,
            message: '请选择参数设置',
            trigger: 'change'
          }
        ],
        scheme: [
          {
            required: true,
            message: '请选择跳转协议',
            trigger: 'change'
          }
        ],
        rewriteMode: [
          {
            required: true,
            message: '请选择跳转方式',
            trigger: 'change'
          }
        ],
        alias: [
          {
            validator: isDomains(),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {},
  methods: {
    /**
     * @description: 展示对话框
     * @param {*} row
     */

    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = row.id ? '修改' : '添加'
      this.form = {
        ...defaultForm,
        ...row
      }

      this.form.alias = row.aliasLs && row.aliasLs.join('\n')

      // 如果为客户端
      if (!this.isAdmin) {
        // 获取套餐列表
        this.$nextTick(() => {
          !this.form.id && this.$refs.QueryPlanSelectRef.getPlanList()
        })
      }
    },

    /**
     * @description: 表单提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { data: res } = await doSaveRewrite({
          ...this.form,
          alias: (this.form.alias || '').trim().replace(/[\r\n]+/g, ',')
        })
        this.$refs.dialogRef.btnLoading = false
        if (res.code !== 1) return

        this.dialogVisible = false
        this.$parent.getTableData()
        this.$msg.success(this.antsT(this.title + '成功'))
      })
    },

    // 引用模板
    getJsContent() {
      this.form.jsContent = jsContent
    },

    // 查看转发末班
    _goViewMode() {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', 'rewriteContent.txt', false)
      xhr.overrideMimeType('text/html;charest=utf-8')
      xhr.send(null)
      this.form.jsContent = xhr.responseText
      // const win = window.open()
      // win.document.write('<div id="contentBox"></div>')
      // win.document.getElementById('contentBox').innerText = xhr.responseText
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    },

    // 点击配置证书
    toEditSsl() {
      const { serverName, certStr, keyStr, notAfter } = this.form
      this.$refs.SslDialogRef.show({
        serverName,
        certStr,
        keyStr,
        notAfter
      })
    },

    // 证书配置提交
    submitSsl({ certStr, keyStr }) {
      this.form.certStr = certStr
      this.form.keyStr = keyStr
    }
  }
}
</script>
