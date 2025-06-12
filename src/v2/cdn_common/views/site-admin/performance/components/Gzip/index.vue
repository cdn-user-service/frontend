<template>
  <ants-form-card>
    <template slot="title">{{antsT('页面压缩')}}</template>
    <template slot="info">
      {{antsT('Gzip压缩网页资源，节约传输内容，提高访问速度，有效改善动态页面的优化支持')}}
      
    </template>
    <template slot="content">
      <ul class="space-y-10">
        <li>
          <ants-switch
            v-model="form.gzip"
            active-text="ON"
            inactive-text="OFF"
            active-value="1"
            inactive-value="0"
            v-loading="$attrs.btnLoading"
            @change="doSave('gzip')"
          />
        </li>
        <li>
          <TitleBorder class="mb-df">
            {{antsT('压缩级别')}}
            <span class="ml-xs mr-xl text-sm text-ants-text-4">
              {{antsT('数字越大压缩的越好，也越占用CPU时间')}}
            </span>
          </TitleBorder>
          <ants-input-number
            v-model="form.gzip_comp_level"
            :precision="0"
            :step="1"
            :min="1"
            :max="9"
            size="small"
            class="mr-sm"
          />（1 ~ 9）
          <!-- <ants-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="doSave('gzip_comp_level')"
            text="提 交"
          /> -->
        </li>

        <li>
          <TitleBorder class="mb-df">
            {{antsT('压缩的最小文件大小')}}
            <span class="ml-xs mr-xl text-sm text-ants-text-4">
              {{antsT('小于设置值的文件将不会压缩')}}
            </span>
          </TitleBorder>
          <div class="flex items-center">
            <ants-form-item prop="gzip_min_length" style="margin:0;">
              <ants-input-number
                v-model="form.gzip_min_length"
                :precision="0"
                :step="1"
                :min="1"
                placeholder="压缩的最小文件大小"
                size="small"
                class="mr-sm"
              />
              <ants-select
                v-model="unit"
                placeholder="单位"
                style="width: 80px;"
                size="small"
              >
                <ants-option label="MB" value="m" />
                <ants-option label="KB" value="k" />
                <ants-option label="B" value=" " />
              </ants-select>
            </ants-form-item>
          </div>
        </li>

        <li>
          <TitleBorder class="mb-df">{{antsT('压缩文件类型')}}</TitleBorder>
          <ants-checkbox-group
            v-model="form.gzip_types"
            :disabled="$attrs.btnLoading"
          >
            <ants-checkbox
              v-for="item in mimeType"
              :key="item.value"
              :label="item.value"
              :text="item.label"
            />
          </ants-checkbox-group>
        </li>

        <li>
          <TitleBorder class="mb-df"
            >{{antsT('是否在http header中添加 Vary: Accept-Encoding')}}</TitleBorder
          >

          <ants-checkbox
            v-model="form.gzip_vary"
            true-label="1"
            false-label="0"
            text="建议开启"
          />
        </li>
        <li>
          <ants-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            :loading="$attrs.btnLoading"
            @click="submitForm"
            text="提 交"
          />
        </li>
      </ul>
    </template>
  </ants-form-card>
</template>

<script>
export default {
  props: ['form'],
  data() {
    return {
      unit: 'k',
      mimeType: Object.freeze([
        {
          label: 'JS',
          value: 'application/javascript'
        },
        {
          label: 'CSS',
          value: 'text/css'
        },
        {
          label: 'HTML',
          value: 'text/html'
        }
        // {
        //   label: 'XML',
        //   value: 'text/xml'
        // },
        // {
        //   label: 'JSON',
        //   value: 'application/json'
        // },
        // {
        //   label: 'TXT',
        //   value: 'text/plain'
        // },
        // {
        //   label: 'SVG',
        //   value: 'image/svg+xml'
        // },
        // {
        //   label: 'WOFF',
        //   value: 'font/woff'
        // },
        // {
        //   label: 'WOFF2',
        //   value: 'font/woff2'
        // }
      ])
    }
  },
  methods: {
    /**
     * @description: 修改提价
     */

    submitForm() {
      this.$parent.validateField('gzip_min_length', valid => {
        if (valid) return
        this.saveSiteAttr({
          gzip_comp_level: this.form.gzip_comp_level,
          gzip_min_length: this.form.gzip_min_length + this.unit,
          gzip_vary: this.form.gzip_vary,
          // gzip_types: [{ id: 0, value: this.form.gzip_types + '' }]
          gzip_types: this.form.gzip_types + ''
        })
      })
    },

    /**
     * @description: 单个保存
     * @param {*} key
     */

    doSave(key = '') {
      this.saveSiteAttr({
        [key]: this.form[key]
      })
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
