<template>
  <el-skeleton :rows="8" :loading="$root.loading" animated>
    <template>
      <ants-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
        class="animated fadeIn"
        space-class="space-y-5"
      >
        <div class="rounded-xl p-sm px-df bg-ants-bg-3">
          <TitleBorder :title="title" />
        </div>

        <div v-for="(item, key) in renderForm" :key="key">
          <ants-form-item :label="key" :prop="key" :required="!item.required">
            <template slot="label">
              <span class="mr-sm">{{ key }}</span>
              <span class="text-sm text-ants-text-4 font-normal"
                >【{{ item.tips }}】</span
              >
            </template>

            <!-- 字符串型 -->
            <ants-input
              v-if="item.type === 'text'"
              v-model="form[key]"
              :placeholder="item.default"
              class="mr-sm"
            />

            <!-- 数值型 -->
            <ants-input-number
              v-if="item.type === 'int'"
              v-model="form[key]"
              :placeholder="item.default + ''"
              :min="0"
              :precision="0"
              class="mr-sm"
            />

            <!-- 布尔型 -->
            <ants-switch
              v-if="item.type === 'bool'"
              v-model="form[key]"
              active-value="1"
              inactive-value="0"
              active-text="ON"
              inactive-text="OFF"
            />
          </ants-form-item>
        </div>

        <ants-form-item class="pt-df">
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            :loading="btnLoading"
            @click="submitForm"
            text="保存配置"
          />
          <ants-button
            size="small"
            type="info"
            icon="el-icon-refresh-right"
            :loading="btnLoading"
            @click="resetDefault"
            text="恢复默认"
          />
        </ants-form-item>
      </ants-form>
    </template>
  </el-skeleton>
</template>

<script>
import mixins from '../../mixins'

export default {
  mixins: [mixins],
  props: {
    // 标题
    title: {
      type: String,
      default: '配置项'
    },
    // 分组标识
    groupStr: String,
    // 基础数据
    baseData: Object,
    // 需要根据条件判断是否需要渲染的数据
    filter: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 构造基础form数据
    // const defaultForm = {}
    // Object.keys(this.baseData).forEach(key => {
    //   defaultForm[key] = this.baseData[key].value
    // })

    return {
      // defaultForm,
      // form: {
      //   ...defaultForm
      // },

      defaultForm: {},
      form: {},
      formRules: {
        name: [
          {
            required: true,
            message: '请输入规则集名称',
            trigger: ['change', 'blur']
          }
        ]
      },
      renderForm: {}
    }
  },
  created() {
    this.getGlobalGroup()
  },
  methods: {
    /**
     * @description: 获取分组列表属性
     */

    async getGlobalGroup() {
      this.renderForm = {}
      this.form = {}
      const { data: res } = await this.getGlobalAttr(this.groupStr)
      if (!res) return
      const obj = {}
      // 构造form 表单数据
      Object.keys(res).forEach((key) => {
        // TODO: default_rule 暂时不渲染
        if (key != 'default_rule' && !this.filter[key]) {
          obj[key] = res[key]
          // 渲染出的数据
          // this.renderForm[key] = res[key]
          // 构造表单数据
          this.$set(this.form, key, res[key].pvalue)
          this.defaultForm[key] = res[key].default
        }
        // if (key in this.form) {
        //   this.form[key] = res[key].pvalue
        // }
      })
      this.renderForm = obj
    },

    /**
     * @description: 表单提交
     */

    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        const data = await this.saveGlobalAttr(this.form)
      })
    },

    /**
     * @description: 点击恢复默认
     */

    async resetDefault() {
      const data = await this.saveGlobalAttr({
        ...this.defaultForm
      })
      if (!data) return
      this.getGlobalGroup()
    }
  }
}
</script>
