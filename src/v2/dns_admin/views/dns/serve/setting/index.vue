<template>
  <el-card class="content-box animated fadeIn">
    <template slot="header">
      <TitleBorder title="URL转发设置" />
    </template>

    <el-skeleton :rows="10" animated :loading="loading">
      <ants-form
        :model="form"
        :rules="rules"
        ref="s_url_rewrite_cname"
        label-width="120px"
        label-position="top"
        size="medium"
        space-class="space-y-4"
      >
        <ants-form-item prop="s_url_rewrite_cname" name="s_url_rewrite_cname">
          <template slot="label">
            <span class="mr-2"> 显性URL转发 </span>
            <span class="text-sm text-ants-text-4 font-normal">
              【备注：显性URL转发服务器CNAME域名，格式如： url.domain.com】
            </span>
          </template>

          <ants-input
            v-model="form.s_url_rewrite_cname"
            placeholder="请输入显性URL转发CNAME"
            style="width: 100%"
            class="mr-2 mb-2"
          />

          <ants-button
            type="primary"
            text="保存"
            icon="el-icon-check"
            :loading="btnLoading"
            @click="doSaveAll('s_url_rewrite_cname', form.s_url_rewrite_cname)"
          />
        </ants-form-item>
      </ants-form>
      <ants-form
        :model="form"
        :rules="rules"
        ref="h_url_rewrite_cname"
        label-width="120px"
        label-position="top"
        size="medium"
        space-class="space-y-4"
      >
        <ants-form-item prop="h_url_rewrite_cname" name="h_url_rewrite_cname">
          <template slot="label">
            <span class="mr-2"> 隐性URL转发 </span>
            <span class="text-sm text-ants-text-4 font-normal">
              【备注：隐性URL转发服务器CNAME域名，格式如： url.domain.com】
            </span>
          </template>

          <ants-input
            v-model="form.h_url_rewrite_cname"
            placeholder="请输入隐性URL转发CNAME"
            style="width: 100%"
            class="mr-2 mb-2"
          />
          <ants-button
            type="primary"
            text="保存"
            icon="el-icon-check"
            :loading="btnLoading"
            @click="doSaveAll('h_url_rewrite_cname', form.h_url_rewrite_cname)"
          />
        </ants-form-item>
      </ants-form>
      <ants-form
        :model="form"
        :rules="rules"
        ref="f_url_rewrite_cname"
        label-width="120px"
        label-position="top"
        size="medium"
        space-class="space-y-4"
      >
        <ants-form-item prop="f_url_rewrite_cname" name="f_url_rewrite_cname">
          <template slot="label">
            <span class="mr-2"> 强制URL转发 </span>
            <span class="text-sm text-ants-text-4 font-normal">
              【备注：强制URL跳转应答服务器CNAME域名，格式如：
              vip.line.domain.com】
            </span>
          </template>

          <ants-input
            v-model="form.f_url_rewrite_cname"
            placeholder="请输入强制URL转发CNAME"
            style="width: 100%"
            class="mr-2 mb-2"
          />
          <ants-button
            type="primary"
            text="保存"
            icon="el-icon-check"
            :loading="btnLoading"
            @click="doSaveAll('f_url_rewrite_cname', form.f_url_rewrite_cname)"
          />
        </ants-form-item>
        </ants-form>
      <ants-form
        :model="form"
        :rules="rules"
        ref="f_url_rewrite_cdn_host"
        label-width="120px"
        label-position="top"
        size="medium"
        space-class="space-y-4"
      >

        <ants-form-item prop="f_url_rewrite_cdn_host" name="f_url_rewrite_cdn_host">
          <template slot="label">
            <span class="mr-2"> 跳转转发地址 </span>
            <span class="text-sm text-ants-text-4 font-normal">
              【备注：强制URL跳转到CDN的加速防御URL地址包含域名和监听端口，格式如：https://cdnurl.domian.com:8808】
            </span>
          </template>

          <ants-input
            v-model="form.f_url_rewrite_cdn_host"
            placeholder="请输入跳转转发地址"
            style="width: 100%"
            class="mr-2 mb-2"
          />
          <ants-button
            type="primary"
            text="保存"
            icon="el-icon-check"
            :loading="btnLoading"
            @click="doSaveAll('f_url_rewrite_cdn_host', form.f_url_rewrite_cdn_host)"
          />
        </ants-form-item>
        </ants-form>

        <!-- <ants-form-item class="pt-df">
          <ants-button
            type="primary"
            text="保存"
            icon="el-icon-check"
            :loading="btnLoading"
            @click="doSaveAll()"
          />
        </ants-form-item> -->
    </el-skeleton>
  </el-card>
</template>

<script>
// API
import {
  getGlobalConfig,
  saveGlobalConfig,
  saveAllGlobalConfig,
  deleteGlobalConfig
} from '@/v2/dns_admin/api/dns/serve'

const defaultForm = {
  // url
  s_url_rewrite_cname: '',
  h_url_rewrite_cname: '',
  f_url_rewrite_cname: '',
  f_url_rewrite_cdn_host: ''
}

export default {
  data() {
    return {
      loading: false,
      btnLoading: false,
      // 全局配置数据
      form: {
        ...defaultForm
      },
      rules: {
        s_url_rewrite_cname: [
          {
            required: true,
            message: '请输入显性URL转发CNAME',
            trigger: ['change', 'blur']
          }
        ],
        h_url_rewrite_cname: [
          {
            required: true,
            message: '请输入隐性URL转发CNAME',
            trigger: ['change', 'blur']
          }
        ],
        f_url_rewrite_cname: [
          {
            required: true,
            message: '请输入强制URL转发CNAME',
            trigger: ['change', 'blur']
          }
        ],
        f_url_rewrite_cdn_host: [
          {
            required: true,
            message: '请输入跳转转发地址',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {
    this.getConfigData()
  },
  mounted() {},
  methods: {
    // 获取全局配置数据
    async getConfigData() {
      this.loading = true
      try {
        const { data: res } = await getGlobalConfig()
        if (res.code !== 1) return
        const obj = res.data || {}

        /// 递归构造form数据
        Object.keys(this.form).forEach((key) => {
          this.buildFormData(obj, key)
        })

        console.log('this.form', this.form)
      } finally {
        this.loading = false
      }
    },

    // 递归构造 form 数据
    buildFormData(obj = {}, formKey = '') {
      Object.keys(obj).forEach((key) => {
        // 如果找到了对应的key
        if (key === formKey) {
          this.form[key] = (obj[key] || {}).configValue
          return
        }

        // 如果没有找到对应的key，并且是对象
        if (this.$valid.isObject(obj[key])) {
          this.buildFormData(obj[key], formKey)
        }
      })
    },

    doSaveAll(name, val) {
      console.log('name=>', name, 'val=>', val)
      const obj = {}
      obj.url_rewrite = {}
      obj.url_rewrite[name] = val
      console.log('ref=>', this.$refs[name])      
      this.$refs[name].validate(async (valid) => {
        console.log('valid=>', valid)      
        if (!valid) return
        this.btnLoading = true
        try {
          const { data: res } = await saveAllGlobalConfig(obj)
          if (res.code !== 1) return
          this.$message.success('保存成功')
        } finally {
          this.btnLoading = false
        }
      })
    }

    // 保存所有配置
    // doSaveAll() {
    //   this.$refs.formRef.validate(async (valid) => {
    //     if (!valid) return
    //     this.btnLoading = true
    //     try {
    //       const { data: res } = await saveAllGlobalConfig({
    //         url_rewrite: {
    //           s_url_rewrite_cname: this.form.s_url_rewrite_cname,
    //           h_url_rewrite_cname: this.form.h_url_rewrite_cname,
    //           f_url_rewrite_cname: this.form.f_url_rewrite_cname,
    //           f_url_rewrite_cdn_host: this.form.f_url_rewrite_cdn_host
    //         }
    //       })
    //       if (res.code !== 1) return
    //       this.$msg.success('保存成功')
    //     } finally {
    //       this.btnLoading = false
    //     }
    //   })
    // }
  }
}
</script>

<style lang="scss" scoped></style>
