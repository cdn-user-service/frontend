<template>
  <div>
    <ants-form-card>
      <template slot="title">{{ antsT('内容替换') }}</template>
      <template slot="info">
        {{ antsT('如需要更多的替换MIME类型，请联系我们。') }}
      </template>
      <template slot="content">
        <ants-switch
          v-model="form.sub_filter_status"
          active-value="1"
          inactive-value="0"
          active-text="ON"
          inactive-text="OFF"
          v-loading="$attrs.btnLoading"
          @change="changeStatus"
          :disabled="$root.disabledCrud"
        />

        <ants-form
          :disabled="$root.disabledCrud"
          :model="form"
          :rules="formRules"
          space-class="space-y-6"
          class="mt-lg"
          ref="formRef"
          label-width="120px"
        >
          <!-- :disabled="form.sub_filter_status == 0" -->

          <ants-form-item label="是否替换所有">
            <ants-checkbox
              v-model="form.sub_filter_once"
              true-label="1"
              false-label="0"
              text="勾选将替换所有匹配到的字符，否则只替换第一次匹配到的字符"
            />
          </ants-form-item>
          <ants-form-item label="替换文件类型" required prop="sub_filter_types">
            <ants-checkbox-group v-model="form.sub_filter_types">
              <ants-checkbox
                v-for="item in mimeType"
                :key="item.value"
                :label="item.value"
                :text="item.label"
              />
            </ants-checkbox-group>
          </ants-form-item>

          <ants-form-item
            label="替换内容"
            required
            class="ants-table_form_error sub-filter-table-form"
          >
            <ants-form :model="tableForm" :rules="formRules" ref="tableFormRef">
              <el-table
                :data="tableForm.tableData"
                size="mini"
                border
                style="margin-top:10px;"
              >
                <ants-table-column
                  label="被替换字符"
                  width="250"
                  align="center"
                >
                  <template #default="{ row, $index }">
                    <ants-form-item
                      :prop="`tableData.${$index}.str1`"
                      :rules="formRules.str1"
                    >
                      <ants-input
                        style="width:100%"
                        size="small"
                        v-model="row.str1"
                        placeholder="被替换字符"
                      ></ants-input>
                    </ants-form-item>
                  </template>
                </ants-table-column>
                <ants-table-column
                  label="替换后的字符"
                  width="250"
                  align="center"
                >
                  <template #default="{ row, $index }">
                    <ants-form-item
                      :prop="`tableData.${$index}.str2`"
                      :rules="formRules.str2"
                    >
                      <ants-input
                        style="width:100%"
                        size="small"
                        v-model="row.str2"
                        placeholder="替换后的字符"
                      ></ants-input>
                    </ants-form-item>
                  </template>
                </ants-table-column>

                <ants-table-column label="操作" width="60" align="center">
                  <template #default="{ row, $index }">
                    <span
                      class="el-icon-delete-solid text-2xl text-error cursor-pointer"
                      @click="deleteRow(row, $index)"
                    ></span>
                  </template>
                </ants-table-column>
              </el-table>
            </ants-form>
            <div class="text-center">
              <span
                class="text-primary el-icon-plus cursor-pointer"
                @click="addRow"
              >
                {{ antsT('新增一行') }}</span
              >
            </div>
          </ants-form-item>

          <ants-form-item v-if="!$root.disabledCrud">
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
// 替换内容表格基础数据
const baseTableData = {
  id: 0,
  str1: '',
  str2: ''
}
export default {
  data() {
    return {
      form: {
        // [bool] 内容替换开关
        sub_filter_status: '0',
        // [bool] 内容替换一次默认只替换第一次匹配到的到字符，如果是off，那么所有匹配到的字符都会被替换；默认ON
        sub_filter_once: '1',
        // [text] 用于指定需要被替换的MIME类型,默认为“text/html”
        sub_filter_types: ['text/html'],
        // [m_text] 内容替换内容，例如：caoss.com css.net 第一个参数将被第二个参数替换
        sub_filter: []
      },

      // 替换内容数据
      tableForm: {
        tableData: [
          {
            ...baseTableData
          }
        ]
      },

      formRules: {
        sub_filter_types: [
          {
            required: true,
            message: '请选择替换文件类型',
            trigger: 'change'
          }
        ],
        str1: [
          {
            required: true,
            message: '请输入被替换字符',
            trigger: ['change', 'blur']
          }
        ],
        str2: [
          {
            required: true,
            message: '请输入替换后的字符',
            trigger: ['change', 'blur']
          }
        ]
      },

      mimeType: Object.freeze([
        {
          label: 'HTML',
          value: 'text/html'
        },
        {
          label: 'JS',
          value: 'application/javascript'
        },
        {
          label: 'CSS',
          value: 'text/css'
        },
        {
          label: 'XML',
          value: 'text/xml'
        },
        {
          label: 'JSON',
          value: 'application/json'
        },
        {
          label: 'TXT',
          value: 'text/plain'
        },
        {
          label: 'SVG',
          value: 'image/svg+xml'
        },
        {
          label: 'WOFF',
          value: 'font/woff'
        },
        {
          label: 'WOFF2',
          value: 'font/woff2'
        },
        {
          label: '所有类型',
          value: '*'
        }
      ])
    }
  },
  created() {},
  methods: {
    /**
     * @description: 点击提交
     */

    submitForm() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.$refs.tableFormRef.validate(async valid => {
          if (!valid) return
          this.saveSiteAttr({
            sub_filter_once: this.form.sub_filter_once,
            sub_filter_types: this.form.sub_filter_types.join(' '),
            sub_filter: this.tableForm.tableData.map(item => {
              return {
                id: item.id,
                value: `${item.str1}----${item.str2}`
              }
            })
          })
        })
      })
    },

    /**
     * @description: 开关
     */

    async changeStatus(val) {
      const res = await this.saveSiteAttr({
        sub_filter_status: val
      })
      // 复位
      if (!res) {
        val = val ? '0' : '1'
      }
    },

    /**
     * @description: 保存配置数据
     */

    async saveSiteAttr(dataObj) {
      const res = await this.$listeners.saveSiteAttr(dataObj)
      return res
    },

    /**
     * @description: 删除一行
     * @param {*} row
     */

    async deleteRow(row, idx) {
      // if (idx === 0) return
      if (row.id) {
        const res = await this.$listeners.deleteSiteAttr('sub_filter', row.id)
        if (res) this.tableForm.tableData.splice(idx, 1)
      } else {
        this.tableForm.tableData.splice(idx, 1)
      }
    },

    /**
     * @description: 点击新增一行
     */

    addRow() {
      if (this.tableForm.tableData.length === 10) return
      this.tableForm.tableData.push({
        ...baseTableData
      })
    }
  }
}
</script>

<style lang="scss">
.sub-filter-table-form {
  & > .el-form-item__content {
    display: inline-block;
  }
}
</style>
