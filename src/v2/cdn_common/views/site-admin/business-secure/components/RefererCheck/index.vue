<template>
  <ants-form-card>
    <template slot="title">{{ antsT('来源控制') }}</template>
    <template slot="info">
      <!-- <ul class="space-y-6">
        <li>
          {{ antsT('禁止后将限制搜索引擎对页面的索引和跟踪，默认为允许') }}
        </li>
      </ul> -->
    </template>
    <template slot="content">
      <ants-switch
        v-model="status"
        active-text="ON"
        inactive-text="OFF"
        :active-value="1"
        :inactive-value="0"
        v-loading="$attrs.btnLoading"
        @change="changeStatus"
      />

      <ants-form
        :model="form"
        :rules="rules"
        space-class="space-y-6"
        class="mt-lg"
        ref="formRef"
        label-width="110px"
        :disabled="status == 0"
      >
        <ants-form-item label="Cooike有效期" required prop="maxAge">
          <ants-input-number
            v-model="form.maxAge"
            placeholder="有效期"
            :min="0"
            :max="9999999999"
            size="small"
          />
          <span class="ml-sm text-ants-text-4">秒</span>
        </ants-form-item>

        <ants-form-item label="来源域名" required prop="refererUri">
          <ants-input
            v-model="form.refererUri"
            type="textarea"
            :autosize="{
              minRows: 4,
              maxRows: 8
            }"
            placeholder="请输入来源域名，一行一个"
            style="max-width:500px"
          />
        </ants-form-item>

        <ants-form-item label="返回状态码" required prop="code">
          <ants-radio-group v-model="form.code">
            <ants-radio
              v-for="item in [302, 403, 444]"
              :key="item"
              :label="item + ''"
              :text="item"
            />
          </ants-radio-group>
        </ants-form-item>

        <!-- <ants-form-item
          v-if="form.code == 200"
          label="HTML内容"
          required
          prop="content"
        >
          <ants-input
            v-model="form.content"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入自定义的HTML内容"
            style="max-width:500px"
          />
        </ants-form-item> -->

        <ants-form-item
          v-if="form.code == 302"
          label="重定向地址"
          required
          prop="content"
        >
          <ants-input
            v-model="form.content"
            placeholder="请输入重定向地址"
            style="max-width:500px"
          />
        </ants-form-item>

        <ants-form-item>
          <ants-button
            class="mt-sm"
            size="small"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="submit"
            text="提 交"
          />
        </ants-form-item>
      </ants-form>
    </template>
  </ants-form-card>
</template>

<script>
import { isUrl } from '@/utils/validate'

export default {
  data() {
    // 不能包含 * " ' () [] {}
    const checkStr = (val = '') => {
      const reg = /[*"'()[\]{}]/
      return !reg.test(val)
    }

    const checkUrl = (val = '') => {
      const trimVal = val.trim()
      return isUrl(trimVal) && checkStr(trimVal)
    }

    const checkContent = (rule, value, callback) => {
      if (checkUrl(value)) return callback()
      return callback(new Error('URL格式错误，不能包含字符 * " \' [ ] {} ()'))
    }

    const checkRefererUri = (rule, value, callback) => {
      if (value === undefined || value === '') return callback()
      // 将数据拆分成一行一个
      const newArr = (value || '').trim().split(/[\r\n]+/)

      // 是否正确的格式
      let isOk = false
      // 临时数组，用于判读是否重复
      const nowArr = []

      // 遍历数组
      newArr.every((item, idx) => {
        const itemTrim = item.trim()
        isOk = checkStr(itemTrim)

        if (!isOk) {
          callback(new Error('不能包含字符 * " \' [ ] {} () ：' + itemTrim))
          return isOk
        }

        // 判断是否重复，如果当前在数组中第一次出现的位置不是 i，则认为重复
        nowArr[idx] = itemTrim // 将数据存入临时数组
        if (nowArr.indexOf(itemTrim) != idx) {
          isOk = false
          callback(new Error('不能重复：' + itemTrim))
        }
        return isOk
      })

      if (isOk) callback()
    }

    return {
      // 搜索引擎开关，[bool] 0 = 允许 | 1 = 禁止
      status: 0,
      form: {
        // 来源域名，多个用 | 分割
        refererUri: '',
        // 返回状态码
        code: '302',
        // 当code=200 302 时的，返回的内容  200 = HTML页面内容, 302 = 重定向地址
        content: '',
        // 来源cooikes有效期，默认为0，单位 s
        maxAge: 0
      },
      rules: {
        refererUri: [
          {
            required: true,
            message: '请输入来源域名，一行一个',
            trigger: ['change', 'blur']
          },
          {
            validator: checkRefererUri,
            trigger: ['blur']
          }
        ],
        code: [
          {
            required: true,
            message: '请选择返回状态码',
            trigger: ['change', 'blur']
          }
        ],
        content: [
          {
            required: true,
            message: '请输入内容',
            trigger: ['change', 'blur']
          },
          {
            validator: checkContent,
            trigger: ['blur']
          }
        ],
        maxAge: [
          {
            required: true,
            message: '请输入Cookie有效期',
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  mounted() {},
  methods: {
    async changeStatus(val) {
      const res = await this.$listeners.changeSiteAttrStatus({
        pkey: 'referer_check',
        status: val
      })
      // 复位
      if (!res) {
        val = val ? 0 : 1
      }
    },

    submit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        console.log(this.form)

        const { refererUri, code, content } = this.form

        this.saveSiteAttr({
          referer_check: JSON.stringify({
            ...this.form,
            // refererUri，一行一个，用 | 分隔
            refererUri: refererUri.trim().replace(/[\r\n]+/g, '|'),
            content: ['302'].includes(code) ? content : ''
          })
        })
      })
    },

    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
    }
  }
}
</script>
