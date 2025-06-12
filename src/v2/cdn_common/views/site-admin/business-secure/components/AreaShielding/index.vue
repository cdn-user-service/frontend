<template>
  <div>
    <ants-form-card>
      <template slot="title">{{ antsT('区域屏蔽') }}</template>
      <template slot="info">
        <ul class="space-y-6">
          <li>
            {{
              antsT(
                '可根据业务需求，允许或禁止特定区域的终端用户对网站资源的访问'
              )
            }}
          </li>
          <li>
            {{
              antsT(
                '开启白名单后只允许白名单中地区访问，开启黑名单后只禁止黑名单中地区访问域名'
              )
            }}
          </li>
          <li>
            {{ antsT('由精准访问控制引擎驱动，') }}
            {{ antsT('开启防御后具体防御策略配置请至') }}
            <router-link to="waf">{{ antsT('精准访问控制引擎') }}</router-link>
            {{ antsT('处查看') }}
          </li>
        </ul>
      </template>
      <template slot="content">
        <ants-switch
          v-model="status"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="changeStatus"
        />

        <ants-form
          :model="form"
          :rules="formRules"
          space-class="space-y-6"
          class="mt-lg"
          ref="formRef"
          label-width="110px"
          :disabled="status == 0"
        >
          <ants-form-item label="黑白名单" required prop="match_mode">
            <ants-radio-group v-model="form.match_mode">
              <ants-radio :label="0" text="黑名单" />
              <ants-radio :label="1" text="白名单" />
            </ants-radio-group>
          </ants-form-item>
          <ants-form-item label="返回状态码" required prop="return_code">
            <ants-radio-group v-model="form.return_code">
              <ants-radio label="400" text="400" />
              <ants-radio label="404" text="404" />
              <ants-radio label="444" text="444" />
            </ants-radio-group>
          </ants-form-item>

          <ants-form-item label="匹配区域" prop="match_area">
            <ants-input
              v-model="form.match_area"
              size="small"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 12 }"
              placeholder="请输入匹配区域代码，多个区域代码以 “ | ” 分隔"
              style="max-width:500px"
            ></ants-input>

            <div class="text-sm text-ants-text-4">
              {{ antsT('请输入匹配区域代码，多个区域代码以 “ | ” 分隔') }}
            </div>
          </ants-form-item>

          <ants-form-item>
            <ants-button
              class="mt-sm"
              size="small"
              type="primary"
              icon="el-icon-edit"
              :loading="$attrs.btnLoading"
              @click="submitForm"
              text="提 交"
            />
          </ants-form-item>
        </ants-form>
      </template>
    </ants-form-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 防盗链开关，[bool]
      status: 0,
      // 防盗链内容，[l_text]
      form: {
        // 黑白名单, 黑 = 0， 白= 1
        match_mode: 0,
        // 授权域名，传给后台以 空格 隔开
        match_area: '',
        // 返回码 400 404 444
        return_code: '400'
      },
      formRules: {
        match_area: [
          {
            required: true,
            message: '请输入匹配区域代码，多个区域代码以 “ | ” 分隔',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 点击提交
     */

    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.saveSiteAttr({
          area_shielding: JSON.stringify({
            ...this.form
          })
        })
      })
    },

    /**
     * @description: 区域屏蔽开关
     */

    async changeStatus(val) {
      const res = await this.$listeners.changeSiteAttrStatus({
        pkey: 'area_shielding',
        status: val
      })
      // 复位
      if (!res) {
        val = val ? 0 : 1
      }
    },

    /**
     * @description: 保存配置数据
     */

    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    }
  }
}
</script>
