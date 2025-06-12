<template>
  <ants-dialog
    :title="title + '站内重定向规则'"
    ref="dialogRef"
    v-model="dialogVisible"
    width="600px"
    @close="resetForm"
    @submit="submitForm"
  >
    <ants-form
      :model="form"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
      :status-icon="false"
    >
      <ants-form-item label="重定向方式" prop="type">
        <ants-radio-group v-model="form.type" @change="chanegType">
          <ants-radio :label="1" text="站内重定向" />
          <ants-radio :label="2" text="域名重定向" />
        </ants-radio-group>
      </ants-form-item>

      <template v-if="form.type === 1">
        <ants-form-item label="入站地址" prop="path">
          <ants-input
            v-model.trim="form.path"
            placeholder="以 '/' 开头，如：/test1/test2"
          />
        </ants-form-item>
        <ants-form-item label="重定向地址" prop="rewritePath">
          <ants-input
            v-model="form.rewritePath"
            placeholder="以 '/' 开头，如：/rewrite"
          />
        </ants-form-item>
      </template>

      <template v-if="form.type === 2">
        <ants-form-item label="入站域名" :rules="formRules.path1" prop="path">
          <ants-input
            v-model="form.path"
            placeholder="完整域名，如：www.domain.com"
          />
        </ants-form-item>
        <ants-form-item
          label="重定向地址"
          prop="rewritePath"
          :rules="formRules.rewritePath2"
        >
          <ants-input
            v-model="form.rewritePath"
            placeholder="www.demo.com/path"
          >
            <el-select
              v-model="form.protocol"
              slot="prepend"
              style="width: 100px;"
              placeholder="请选择"
              :clearable="false"
            >
              <el-option label="https://" value="https://" />
              <el-option label="http://" value="http://" />
              <el-option label="所有" value=" " />
            </el-select>
          </ants-input>

          <div class="text-sm text-ants-text-4">
            {{ antsT('格式：域名/路径，如：www.demo.com/path') }}
          </div>
        </ants-form-item>
      </template>

      <ants-form-item label="跳转方式" prop="rewriteMode">
        <ants-radio-group v-model="form.rewriteMode">
          <el-radio :label="key" v-for="(item, key) in modeObj" :key="key">
            {{ item }}
          </el-radio>
        </ants-radio-group>
      </ants-form-item>
    </ants-form>
  </ants-dialog>
</template>

<script>
import { isDomain, isPort } from '@/utils/validate'
const defaultForm = {
  id: 0,
  path: '',
  rewritePath: '',
  rewriteMode: 'permanent',
  status: 1,

  // 1 = URL重定向， 2 = 站点重定向
  type: 1,
  protocol: 'https://'
}

const modeObj = {
  permanent: '301 转移永久跳转',
  redirect: '302 转移临时跳转',
  last: '内部跳转'
}

export default {
  data() {
    // const { isDomain, isPort } = this.$validator
    return {
      title: '添加',
      dialogVisible: false,
      modeObj,
      form: { ...defaultForm },
      formRules: {
        type: [
          {
            required: true,
            message: '请选择重定向方式',
            trigger: 'change'
          }
        ],
        path: [
          {
            required: true,
            message: '请选择入站地址',
            trigger: 'change'
          }
        ],
        rewritePath: [
          {
            required: true,
            message: '请输入重定向地址',
            trigger: ['change', 'blur']
          }
        ],
        rewriteMode: [
          {
            required: true,
            message: '请选择跳转方式',
            trigger: 'change'
          }
        ],
        path1: [
          {
            required: true,
            message: '完整域名:端口，如：www.domain.com:88',
            trigger: 'change'
          },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              const valueArr = value.trim().split(':')
              const len = valueArr.length
              if (len === 1) {
                if (isDomain(valueArr[0])) {
                  return callback()
                }
              }
              if (len === 2) {
                if (isDomain(valueArr[0]) && isPort(valueArr[1])) {
                  return callback()
                }
              }
              callback(new Error('请输入完整域名:端口，如：www.domain.com:88'))
            }
          }
        ],
        rewritePath2: [
          {
            required: true,
            message: '请输入域名/路径，如：www.demo.com/path',
            trigger: ['change', 'blur']
          }
          // {
          //   trigger: 'blur',
          //   validator: (rule, value, callback) => {
          //     const reg = /^((http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?)|\/$/
          //     if (reg.test(value)) return callback()
          //     callback(new Error('请输入域名/路径，如：www.demo.com/path'))
          //   }
          // }
        ]
      }
    }
  },
  methods: {
    // 对话框显示
    showDialog(row = {}) {
      this.dialogVisible = true
      this.title = '添加'
      if (row.id) {
        this.title = '编辑'
        console.log(row)
        this.form = {
          ...row,
          rewritePath:
            row.type == 2
              ? row.rewritePath.replace(row.protocol, '')
              : row.rewritePath
        }
      }
    },

    chanegType(val) {
      this.form.path = ''
      this.form.rewritePath = ''
      this.$refs.formRef.clearValidate()
    },

    /**
     * @description: 添加提交
     */

    async submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.dialogRef.btnLoading = true
        const { rewritePath, type, protocol } = this.form
        const res = await this.$listeners.saveSiteAttr({
          site_uri_rewrite: [
            {
              ...this.form,
              rewritePath: type == 2 ? `${protocol.trim()}${rewritePath}` : rewritePath
            }
          ]
        })
        this.$refs.dialogRef.btnLoading = false
        if (!res) return
        this.$listeners.refreshData()
        this.dialogVisible = false
      })
    },

    // 表单重置
    resetForm() {
      this.form = {
        ...defaultForm
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
