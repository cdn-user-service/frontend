<template>
  <el-card class="content-box animated fadeIn batch_card">
    <div slot="header">
      <TitleBorder title="修改记录" />
    </div>

    <ants-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="100px"
      :status-icon="false"
      space-class="space-y-4"
    >
      <ants-form-item label="域名" prop="mode">
        <ants-radio-group v-model="form.mode">
          <ants-radio :label="1" text="所有" />
          <ants-radio :label="2" text="指定" />
        </ants-radio-group>
        <domainSelect
          v-model="form.domains"
          @change="changeSelectDomain"
          ref="SelectDomainRef"
          :multiple="true"
          layoutSizes
          :username="form.username"
          :disabledUser="isAdmin"
          size="medium"
          style="width: 400px"
          v-if="form.mode === 2"
        />
        <!-- <div style="max-width: 530px" class="relative">
          <ants-input type="textarea" rows="8" placeholder="输入一级域名，每行一个，最多可输入500个域名。例如：
  domain1.com
  domain2.com" v-model="form.domains" />
          <span class="absolute bottom-0 right-0 text-sm text-ants-text-3 pr-xs">
            已输入(<span class="text-primary">{{ domainRows }}</span>)行
          </span>
        </div> -->
      </ants-form-item>
      <!-- <ants-form-item label="选择域名" prop="domains">
        <domainSelect
          v-model="form.domains"
          @change="changeSelectDomain"
          ref="SelectDomainRef"
          :multiple="true"
          layoutSizes
          :username="form.username"
          :disabledUser="isAdmin"
          size="medium"
          style="width: 400px"
        />
      </ants-form-item> -->
      <div class="flex items-center">
        <ants-form-item label="主机记录" prop="srcTop" class="mr-lg">
          <ants-input
            style="max-width: 400px"
            placeholder="www"
            v-model="form.srcTop"
            clearable
          />
        </ants-form-item>
        <ants-form-item label="替换主机记录" prop="newTop">
          <ants-input
            style="max-width: 400px"
            placeholder="www"
            v-model="form.newTop"
            clearable
          />
        </ants-form-item>
      </div>
      <div class="flex items-center">
        <ants-form-item label="记录类型" prop="srcType" class="mr-lg">
          <TypeSelect
            v-model="form.srcType"
            ref="sortRef"
            @change="changeType"
            style="max-width: 400px"
            size="medium"
            placeholder="请选择记录类型"
            clearable
          />
        </ants-form-item>
        <ants-form-item label="替换记录类型" prop="newType">
          <TypeSelect
            v-model="form.newType"
            ref="sortRef"
            @change="changeType"
            style="max-width: 400px"
            size="medium"
            placeholder="请选择替换记录类型"
            clearable
          />
        </ants-form-item>
      </div>

      <div class="flex items-center">
        <ants-form-item
          label="线路类型"
          prop="line"
          style="max-width: 400px"
          class="mr-lg"
        >
          <LineCascader
            v-model="line"
            clearable
            style="max-width: 400px"
            size="medium"
            :index="1"
          />
        </ants-form-item>
        <ants-form-item label="替换线路类型" prop="newLine">
          <LineCascader
            v-model="newLine"
            style="max-width: 400px"
            clearable
            size="medium"
            :index="2"
          />
        </ants-form-item>
      </div>
      <div class="flex items-center">
        <ants-form-item label="记录值" prop="srcValue" class="mr-lg">
          <ants-input
            style="max-width: 400px"
            v-model="form.srcValue"
            placeholder="请输入搜索记录值"
            clearable
          />
        </ants-form-item>
        <ants-form-item label="替换值" prop="newValue">
          <ants-input
            style="max-width: 400px"
            v-model="form.newValue"
            placeholder="请输入替换值"
            clearable
          />
        </ants-form-item>
      </div>

      <ants-form-item class="pt-lg">
        <ants-button
          type="primary"
          size="small"
          :loading="btnLoading"
          @click="submit()"
          icon="el-icon-check"
          text="批量修改"
        />
      </ants-form-item>
    </ants-form>
    <!-- <ants-dialog ref="dialogRef" v-model="dialogVisible" width="500px">
      <div
        slot="title"
        style="text-align: center; font-weight: 700; color: #409eff"
      >
        <i class="el-icon-warning"></i>
        友情提示
      </div>
      <div class="text-center" style="text-align: left; line-height: 26px">
        <div>
          <span style="font-weight: 700">操作提示：</span>修改成功<span
            style="color: #67c23a; font-weight: 700"
            >{{ success }}条</span
          >，修改失败<span style="color: #f56c6c; font-weight: 700"
            >{{ eMsg.length }}条</span
          >。
        </div>
        <div v-for="(item, index) in eMsg" :key="index">
          <div><span style="font-weight: 700">错误原因：</span>{{ item }}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </div>
    </ants-dialog> -->
  </el-card>
</template>

<script>
import domainSelect from '@/v2/dns_common/components/domainSelect'
import TypeSelect from '../../domain-admin/record/TypeSelect'
import LineCascader from '../../domain-admin/record/LineCascader'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { batckDomainUpdate } = require(`@/v2/${PROCESS_NAME}/api/dns/bulk`)

const defaultForm = {
  // 用于后台查询域名
  domains: '',
  srcTop: '',
  srcType: '',
  srcLineName: '',
  srcValue: '',
  newValue: '',
  newTop: '',
  newType: '',
  newLineName: '',
  mode: 1
}

export default {
  components: {
    domainSelect,
    TypeSelect,
    LineCascader
  },
  data() {
    return {
      isAdmin: PROCESS_NAME === 'dns_admin',
      btnLoading: false,
      form: {
        ...defaultForm
      },
      formRules: {
        domains: [
          {
            required: true,
            message: '请选择域名',
            trigger: 'change'
          },
          {
            validator: (rule, value, callback) => {
              if (value.trim().split(/[\r\n]+/).length > 500) {
                callback(new Error('最多输入500行'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      dialogVisible: false,
      success: 0,
      eMsg: [],
      line: {},
      newLine: {}
    }
  },
  computed: {
    // 已输入多少行域名
    domainRows() {
      if (this.form.domains === '') return 0
      return this.form.domains.trim().split(/[\r\n]+/).length
    }
  },
  watch: {
    line(val) {
      if (val && val.record_line_name) {
        this.form.srcLineName = val.record_line_name
      } else {
        this.form.srcLineName = ''
      }
    },
    newLine(val) {
      if (val && val.record_line_name) {
        this.form.newLineName = val.record_line_name
      } else {
        this.form.newLineName = ''
      }
    }
  },

  created() {},
  methods: {
    // 批量修改提交
    submit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        const { srcTop, srcType, srcValue, srcLineName } = this.form
        if (!srcTop && !srcType && !srcValue && !srcLineName) {
          this.$msg.warning('请至少填写一项查询条件')
          return
        }
        this.btnLoading = true
        try {
          console.log('form===》', this.form)
          const { data: res } = await batckDomainUpdate(this.form)

          // const { data: res } = await batckDomainUpdate({
          //   ...this.form,
          //   domains: this.form.domains.replace(/\n/g, ',').trim()
          // })
          if (res.code !== 1) return
          this.$msg.success('修改成功')

          // if (res.eMsg && res.eMsg.length) {
          //   this.dialogVisible = true
          //   this.success = res.success
          //   this.eMsg = res.eMsg
          //   // this.$msg.warning(
          //   //   `修改成功${res.success}条，修改失败${
          //   //     res.eMsg.length
          //   //   }条，错误原因:${res.eMsg.join('\n')}`
          //   // )
          // } else {
          //   this.$msg.success('修改成功')
          // }
        } finally {
          this.btnLoading = false
        }
      })
    },
    // 选择域名
    changeSelectDomain({ domains = [], domainIds }) {
      this.form.domains = domains.join(',')
      console.log('this.form.domains', this.form.domains)
      // 清除校验
      this.$refs.formRef.clearValidate('domains')
    },

    // 选择用户
    // changeUser(obj = {}) {
    //   console.log(obj)
    //   this.form.username = obj.username
    //   // 清除校验
    //   this.$refs.formRef.clearValidate('userId')
    // },

    // 表单重置
    resetForm() {
      this.btnLoading = false
      this.form = {
        ...defaultForm
      }
      if (this.$refs.UsersPopoverRef) {
        this.$refs.UsersPopoverRef.reset()
      }
      this.$refs.formRef.resetFields()
    }
  }
}
</script>
