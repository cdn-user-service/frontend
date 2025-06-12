<template>
  <el-drawer
    title="筛选条件"
    :visible.sync="drawer"
    :direction="direction"
    append-to-body
    :size="400"
  >
    <div
      style="padding-bottom: 65px"
      class="h-full border-t border-ants-border-2"
    >
      <div class="px-lg overflow-y-auto h-full py-lg">
        <ants-form
          label-position="left"
          label-width="100px"
          :model="form"
          :rules="rules"
          ref="formRef"
        >
          <ants-form-item
            v-for="(item, key) in queryType"
            :key="key"
            :prop="key"
            :label="resetKObj[key]"
          >
            <template v-if="item === 'input'">
              <ants-input
                :placeholder="`请输入${resetKObj[key]}`"
                v-model="form[key]"
                maxlength="200"
                clearable
              />
            </template>

            <template v-if="item === 'select'">
              <ants-select
                :placeholder="`请选择${resetKObj[key]}`"
                v-model="form[key]"
                clearable
              >
                <ants-option
                  v-for="(item, key) in selectObj[key]"
                  :key="key"
                  :label="item"
                  :value="key"
                />
              </ants-select>
            </template>

            <template v-if="item === 'number'">
              <div class="flex items-center">
                <ants-input-number
                  v-model="form[key][0]"
                  :controls="false"
                  :precision="0"
                  :min="0"
                  :max="999999999"
                />
                <span class="px-sm">-</span>
                <ants-input-number
                  v-model="form[key][1]"
                  :controls="false"
                  :precision="0"
                  :min="0"
                  :max="999999999"
                />
              </div>
            </template>
          </ants-form-item>
        </ants-form>
      </div>

      <div
        class="absolute bottom-0 left-0 right-0 px-lg py-df bg-ants-bg-1 border-t border-ants-border-2"
      >
        <ants-button
          type="primary"
          size="small"
          icon="el-icon-search"
          @click="handleSearch()"
          >查询</ants-button
        >
        <ants-button
          type="info"
          size="small"
          icon="el-icon-refresh-right"
          @click="reset()"
          >重置</ants-button
        >
      </div>
    </div>
  </el-drawer>
</template>

<script>
const selectObj = {
  k_method: {
    GET: 'GET',
    POST: 'POST',
    HEAD: 'HEAD',
    PUT: 'PUT',
    DELETE: 'DELETE',
    CONNECT: 'CONNECT',
    OPTION: 'OPTION',
    TRACE: 'TRACE',
    PATCH: 'PATCH'
  },
  l_upstream_status: {
    1: '未命中（MISS）',
    2: '绕过（BYPASS）',
    3: '已过期（EXPIRED）',
    4: '已失效（STALE）',
    5: '正在更新（UPDATING）',
    6: '重新验证（REVALIDATED）',
    7: '命中（HIT）',
    8: '稀缺（SCARCE）'
  },
  k_scheme: {
    http: 'http',
    https: 'https'
  }
}

const queryType = {
  // 别名
  http_host: 'input',
  // 请求类型
  k_method: 'select',
  // 请求URL
  k_uri: 'input',
  // 请求参数
  // k_arg: 'input',
  k_referer: 'input',
  // FP
  ip_cookie_names: 'input',
  // User-Agent
  k_user_agent: 'input',
  // 返回码
  l_return_code: 'input',
  // 回源状态
  l_upstream_status: 'select',
  // IP总请求
  k_ip_total: 'number',
  k_ip_5_sum: 'number',
  k_ip_content_type_info: 'number',
  k_ip_400_sum: 'number',
  k_ip_cache_hit_sum: 'number',
  k_ip_method_type_info: 'number',
  k_ip_url_type_info: 'number',

  // 协议
  k_scheme: 'select'
}
const defaultForm = {}
Object.keys(queryType).forEach((key) => {
  // 如果为 number 类型
  if (queryType[key] === 'number') {
    defaultForm[key] = [null, null]
    return
  }
  defaultForm[key] = ''
})
export default {
  props: {
    kName: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      drawer: false,
      direction: 'rtl',
      form: {
        ...defaultForm
      },
      rules: {},
      selectObj,
      queryType
    }
  },
  computed: {
    resetKObj() {
      return {
        ...this.kName,
        k_uri: '请求URL',
        k_arg: '请求参数'
      }
    }
  },
  methods: {
    show() {
      this.drawer = true
    },

    // 查询提交
    handleSearch() {
      const queryBoolMust = []
      Object.keys(queryType).forEach((key) => {
        console.log('key', key)
        const type = queryType[key]
        const value = this.form[key]
        if (type === 'number') {
          // 如果没有值
          if (!value[1]) return
          queryBoolMust.push({
            range: {
              [key]: {
                gte: value[0],
                lte: value[1]
              }
            }
          })
        }

        // input | select
        if (type === 'input' || type === 'select') {
          if (value.trim() === '') return
          queryBoolMust.push({
            wildcard: {
              [key]: {
                value:
                  key === 'k_scheme' ? `${value.trim()}` : `*${value.trim()}*`
              }
            }
          })
        }
      })

      this.$emit('change', queryBoolMust)
      this.drawer = false
    },

    reset() {
      this.form = {
        ...defaultForm
      }
      this.$emit('change', [])
    }
  }
}
</script>
