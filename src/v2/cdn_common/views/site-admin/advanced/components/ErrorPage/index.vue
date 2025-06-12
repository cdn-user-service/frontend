<template>
  <div class="content-box">
    <ants-tab-card :tab-arr="tabArr" @change="changeCode" :active="activeCode">
      <div
        v-for="item in tabArr"
        :key="item.value"
        v-show="item.value === activeCode"
      >
        <TitleBorder :title="`${item.label} ${antsT('页面定制')}`" />
        <div class="text-ants-text-4 text-sm mt-md">
          {{ antsT('定制专属') }} {{ item.label }}
          {{ antsT('页面，默认使用') }} {{ $root.webName }}
          {{
            antsT(
              '提供的错误页面。启用源站错误页面，当出错时直接返回源站错误页面'
            )
          }}
        </div>

        <div class="rounded-xl mt-lg p-lg text-sm bg-ants-bg-5">
          <ants-radio-group
            v-model="form[item.value].type"
            @change="changeCodeHtml(item.value)"
          >
            <ants-radio
              :label="1"
              :text="`${antsT('默认')}${$root.webName}${antsT('错误页面')}`"
            />
            <ants-radio :label="2" text="默认源站错误页面" />
            <ants-radio :label="3" text="自定义HTML" />
          </ants-radio-group>

          <ul class="mt-lg space-y-8" v-if="form[item.value].type == 3">
            <li class="ants-tips_box border border-primary">
              <span class="el-icon-info"></span>
              {{
                antsT('当启用自定义 HTML 模式，可以通过编辑 HTML 代码自定义')
              }}
              {{ item.label }}
              {{ antsT('页面，代码中不能包含 JS。') }}
            </li>
            <li>
              <ants-input
                type="textarea"
                v-model="form[item.value].html_3"
                :autosize="{ minRows: 8, maxRows: 15 }"
                :placeholder="`<h1>${item.label} error code</h1>`"
              />
            </li>
            <li>
              <ants-button
                v-if="!$root.disabledCrud"
                size="small"
                type="primary"
                icon="el-icon-edit"
                :loading="$attrs.btnLoading"
                @click="doSaveCodeHtml(item.value)"
                text="提 交"
              />
              <ants-button
                size="small"
                type="info"
                icon="el-icon-view"
                @click="showPreviewDialog(item.value)"
                text="预 览"
              />
            </li>
          </ul>
        </div>
      </div>
    </ants-tab-card>

    <!-- 预览自定义 HTML 对话框 -->
    <PreviewDialog ref="PreviewDialogRef" />
  </div>
</template>

<script>
import PreviewDialog from '@/v2/cdn_common/components/PreviewDialog'

// 导入默认的 HTML字符串 文件
import { HTML_1, HTML_2 } from './htmlStr'

const tabArr = [
  {
    label: '400',
    value: 'error_page_400'
  },
  {
    label: '403',
    value: 'error_page_403'
  },
  {
    label: '404',
    value: 'error_page_404'
  },
  {
    label: '410',
    value: 'error_page_410'
  },
  {
    label: '500',
    value: 'error_page_500'
  },
  {
    label: '502',
    value: 'error_page_502'
  },
  {
    label: '503',
    value: 'error_page_503'
  },
  {
    label: '504',
    value: 'error_page_504'
  }
]

// 构造 form
const defaultForm = {}
tabArr.forEach(item => {
  // [l_text] 页面定制
  defaultForm[item.value] = {
    type: 2,
    html_1: HTML_1,
    html_2: HTML_2,
    html_3: ''
  }
})

export default {
  components: {
    PreviewDialog
  },
  data() {
    return {
      activeCode: 'error_page_400',
      tabArr,
      form: {
        ...defaultForm
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 切换tab
     * @param {*} val
     */

    changeCode(val) {
      this.activeCode = val
    },

    /**
     * @description: 保存 error_code 页面定制
     */

    doSaveCodeHtml(key = '') {
      // 提示 自定义 HTML 不能为空
      if (this.form[key].html_3 == '') {
        return this.$msg.error(this.antsT('请输入自定义 HTML'))
      }
        
      this.$listeners.saveSiteAttr({
        [key]: JSON.stringify(this.form[key])
      })
    },

    /**
     * @description: 保存 error_code 页面切换
     */
    changeCodeHtml(key = '') {
      // 不用判断内容是否为空
      // if (this.form[key][`html_${this.form[key].type}`] == '') return
      this.$listeners.saveSiteAttr({
        [key]: JSON.stringify(this.form[key])
      })
    },

    /**
     * @description: 预览自定义 HTML
     * @param {*} key
     */

    showPreviewDialog(key) {
      this.$refs.PreviewDialogRef.showDialog(this.form[key].html_3)
    }
  }
}
</script>
