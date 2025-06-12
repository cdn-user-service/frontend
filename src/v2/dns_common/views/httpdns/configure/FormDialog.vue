<template>
  <ants-dialog
    title="添加应用"
    v-model="dialogVisible"
    @closed="resetForm"
    @submit="submitForm"
    ref="dialogRef"
    width="600px"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="120px"
      label-position="left"
      @keyup.enter.native="submitForm"
      :status-icon="false"
    >
      <ants-form-item
        prop="userId"
        v-if="isAdmin"
        label="选择用户"
      >
        <UsersPopover
          v-model="form.userId"
          ref="UsersPopoverRef"
          @change="changeUser"
        />
      </ants-form-item>

      <ants-form-item
        prop="remark"
        label="应用名称"
      >
        <div class="flex items-center">
          <ants-input
            class="flex-1"
            v-model="form.remark"
            placeholder="请输入应用名称"
            show-word-limit
            maxlength="30"
          />
          <span
            style="width:66px;"
            class="block"
          >
          </span>
        </div>
      </ants-form-item>

      <ants-form-item
        prop="aesKey"
        label="AES密钥"
      >
        <div class="flex items-center">
          <ants-input
            class="flex-1"
            v-model="form.aesKey"
            placeholder="请输入AES密钥"
            show-word-limit
            maxlength="32"
          />

          <span
            style="width:66px;"
            class="text-primary inline-block cursor-pointer pl-sm whitespace-no-wrap"
            @click="randomCreate('aesKey', 32)"
          >
            随机生成
          </span>
        </div>

      </ants-form-item>
      <ants-form-item
        prop="desKey"
        label="DES密钥"
      >
        <div class="flex items-center">
          <ants-input
            v-model="form.desKey"
            placeholder="请输入DES密钥"
            show-word-limit
            maxlength="16"
          />

          <span
            style="width:66px;"
            class="text-primary inline-block cursor-pointer pl-sm whitespace-no-wrap"
            @click="randomCreate('desKey')"
          >
            随机生成
          </span>
        </div>

      </ants-form-item>
      <ants-form-item
        prop="httpsToken"
        label="HTTPS Token"
      >
        <div class="flex items-center">
          <ants-input
            v-model="form.httpsToken"
            placeholder="请输入HTTPS Token"
            show-word-limit
            maxlength="16"
          />

          <span
            style="width:66px;"
            class="text-primary inline-block cursor-pointer pl-sm whitespace-no-wrap"
            @click="randomCreate('httpsToken')"
          >
            随机生成
          </span>
        </div>

      </ants-form-item>

      <!-- <ants-form-item
        prop="remark"
        label="备注信息"
      >
        <ants-input
          v-model="form.remark"
          placeholder="请输入备注信息"
          show-word-limit
          maxlength="200"
          type="textarea"
          :rows="4"
        />
      </ants-form-item>
      <ants-form-item
        prop="type"
        label="业务类型"
      >
        <ants-select
          v-model="form.type"
          placeholder="请选择业务类型"
        >
          <ants-option
            v-for="item in typeList"
            :key="item"
            :label="item"
            :value="item"
          />
        </ants-select>
      </ants-form-item> -->
    </ants-form>
  </ants-dialog>
</template>

<script>
// 组件
import UsersPopover from '@/v2/dns_admin/components/UsersPopover'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doCreateApp } = require(`@/v2/${PROCESS_NAME}/api/dns/httpdns`)

const defaultForm = {
  id: 0,
  userId: '',
  name: '',
  type: '',

  // aesKey
  remark: '',
  aesKey: '',
  desKey: '',
  httpsToken: '',
  status: 7
}

const typeList = [
  '儿童',
  '音乐',
  '阅读',
  '视频',
  '娱乐',
  '游戏',
  '社交',
  '工具',
  '其他'
]
export default {
  components: {
    UsersPopover
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      typeList,
      dialogVisible: false,
      loading: false,
      btnLoading: false,
      userList: [],

      form: {
        ...defaultForm
      },
      formRules: {
        userId: [
          {
            required: true,
            message: '请选择用户',
            trigger: ['change', 'blur']
          }
        ],
        name: [
          {
            required: true,
            message: '请输入应用名称',
            trigger: ['blur', 'change']
          }
        ],
        aesKey: [
          {
            required: true,
            message: '请输入AES密钥',
            trigger: ['blur', 'change']
          }
        ],
        desKey: [
          {
            required: true,
            message: '请输入DES密钥',
            trigger: ['blur', 'change']
          }
        ],
        httpsToken: [
          {
            required: true,
            message: '请输入HTTPS Token',
            trigger: ['blur', 'change']
          }
        ],
        remark: [
          {
            required: true,
            message: '请输入应用名称',
            trigger: ['blur', 'change']
          }
        ],
        type: [
          {
            required: true,
            message: '请选择业务类型',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    show() {
      this.dialogVisible = true
      // 生成默认的密钥
      const obj = {
        aesKey: 32,
        desKey: 16,
        httpsToken: 16
      }

      Object.keys(obj).forEach((key) => {
        this.randomCreate(key, obj[key])
      })
    },

    /**
     * @description: 值改变
     */

    changeUser(obj = {}) {
      console.log(obj)
      // 清除校验
      this.$refs.formRef.clearValidate('userId')
    },

    /**
     * @description: 添加提交
     */
    submitForm() {
      // 防止重复提交
      if (this.$refs.dialogRef.btnLoading) return

      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        // 发起请求
        this.$refs.dialogRef.btnLoading = true
        try {
          const { data: res } = await doCreateApp(this.form)
          this.$refs.dialogRef.btnLoading = false
          if (res.code !== 1) return
          this.$emit('refresh')
          this.$msg.success('添加成功')
          this.dialogVisible = false
        } catch (error) {
          this.$refs.dialogRef.btnLoading = false
          throw error
        }
      })
    },

    // 点击随机生成密钥，大小写字母+数字 16位或者32位
    randomCreate(prop = '', num = 16) {
      const str =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < num; i++) {
        result += str.charAt(Math.floor(Math.random() * str.length))
      }
      this.form[prop] = result
    },

    // 添加域名表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
      if (this.$refs.UsersPopoverRef) {
        this.$refs.UsersPopoverRef.reset()
      }
    }
  }
}
</script>

<style lang="scss">
.query-user-select {
  width: 100%;
  .el-input {
    width: 100% !important;
  }
}
.query-user-select.ants-select-bgc {
  .el-input__inner {
    border: 2px solid theme('colors.ants-bg-5');
    background-color: theme('colors.ants-bg-5');
    border-radius: 6px;
    line-height: 56px;
    height: 56px;
    padding-left: 45px;
  }
  .el-input__inner:focus {
    border-color: theme('colors.primary');
  }

  &::before {
    position: absolute;
    left: 20px;
    top: 18px;
    z-index: 1;
    font-size: 16px;
    color: #c0c4cc;
  }
}
</style>
