<template>
  <div>
    <ul class="space-y-10">
      <li style="display: flex">
        <ants-switch
          v-model="form.cache_config_status"
          active-text="ON"
          inactive-text="OFF"
        />
        <div
          v-if="!form.cache_config_status"
          style="
            color: #f52443;
            font-size: 12px;
            margin-left: 5px;
            line-height: 20px;
          "
        >
          温馨提示：精准访问控制规则失效。
        </div>
      </li>
      <li class="flex justify-between items-center">
        <el-badge :value="antsT('优先')" class="radio-badge" type="danger">
          <ants-radio-group
            v-model="form.cache_config_radio"
            size="small"
            @change="changeCacheRadio"
          >
            <ants-radio-button
              v-for="(value, key) in cacheRadio"
              :key="key"
              :label="key"
              :text="value"
            />
          </ants-radio-group>
        </el-badge>
        <ants-button
          size="mini"
          type="primary"
          icon="el-icon-plus"
          class="ml-xl"
          @click="toSave()"
          :text="`添加${cacheRadio[form.cache_config_radio]}`"
        />
      </li>

      <li>
        <el-table :data="tableData" border size="small">
          <ants-table-column
            label="缓存方式"
            prop="type"
            min-width="140"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                v-if="form.cache_config_radio === 'cache_config'"
                size="mini"
                :type="row.mode === 'gho' ? 'success' : 'primary'"
              >
                {{ antsT(`${row.mode === 'gho' ? '镜像' : '缓存'}`) }}
              </el-tag>

              <el-tag
                size="mini"
                type="danger"
                v-else-if="form.cache_config_radio === 'un_cache_config'"
              >
                {{ antsT('不缓存') }}
              </el-tag>
            </template>
          </ants-table-column>

          <ants-table-column
            label="缓存类型"
            prop="type"
            min-width="140"
            align="center"
          >
            <template #default="{ row }">
              {{ antsT(typeObj[`type_${row.type}`]) }}
            </template>
          </ants-table-column>
          <ants-table-column
            label="匹配内容"
            prop="content"
            min-width="300"
            align="center"
          >
          </ants-table-column>

          <ants-table-column
            label="缓存时间"
            prop="time"
            min-width="140"
            align="center"
            v-if="form.cache_config_radio === 'cache_config'"
          >
            <template #default="{ row }">
              {{ row.time }} {{ antsT(cacheTime[row.unit]) }}
            </template>
          </ants-table-column>
          <!-- <ants-table-column
            label="优先级（由上往下）"
            prop="weight"
            min-width="140"
            align="center"
          >
            <template>
              <span
                class="el-icon-bottom text-2xl text-primary cursor-pointer mr-xs"
              ></span>
              <span
                class="el-icon-top text-2xl text-primary cursor-pointer"
              ></span>
            </template>
          </ants-table-column> -->

          <ants-table-column label="操作" width="160" align="center">
            <template #default="{ row, $index }">
              <ants-button
                size="mini"
                type="primary"
                @click="toSave(row)"
                text="编辑"
              />
              <ants-button
                size="mini"
                type="danger"
                @click="toDel(row, $index)"
                text="删除"
              />
            </template>
          </ants-table-column>
        </el-table>
      </li>

      <li class="space-y-8">
        <el-checkbox
          class="block"
          v-for="item in checkboxArr"
          :key="item.key"
          v-model="form[item.key]"
          true-label="1"
          false-label="0"
        >
          <span class="mr-xs">{{ antsT(item.title) }}</span>
          <el-tooltip
            effect="dark"
            :content="antsT(item.tips)"
            placement="right"
          >
            <span class="el-icon-info text-primary text-df"></span>
          </el-tooltip>
        </el-checkbox>
      </li>
    </ul>

    <CreateUpdate bulk @save="doSave" ref="CreateUpdateRef" />
  </div>
</template>

<script>
import CreateUpdate from '@/v2/cdn_common/views/site-admin/performance/components/AdvancedCache/createUpdate'

const checkboxArr = [
  {
    key: 'cache_control_pragma',
    title: '忽略请求头中 Cache-Control 和 Pragma',
    tips: '忽略本请求头在有缓存的情况下使用缓存响应，而不向源服务器请求'
  },
  // {
  //   key: 'cache_http_https',
  //   title: 'HTTP / HTTPS 缓存共用',
  //   tips: '同一份资源文件，HTTP 和 HTTPS 下共用缓存，可提升缓存命中率'
  // },
  {
    key: 'cache_url_param',
    title: '缓存时忽略 URL 中的参数',
    tips: '控制缓存时是否忽略用户请求URL中问号之后的参数，默认情况下不会忽略“?”之后的参数'
  }
  // {
  //   key: 'cache_url_param_order',
  //   title: '参数顺序识别',
  //   tips:
  //     '可将URL中参数相同，但是顺序不同的资源内容，忽略参数的排序，只缓存一份，可有效提高缓存命中率'
  // },
  // {
  //   key: 'cache_follow',
  //   title: '遵循源站响应头部缓存规则',
  //   tips: '客户端缓存时间遵循源站设置的生效时长'
  // }
]

export default {
  components: {
    CreateUpdate
  },
  data() {
    return {
      // 缓存类型对象
      typeObj: {
        type_1: '文件后缀',
        type_2: '精确匹配',
        type_3: '模糊匹配',
        type_4: '缓存目录',
        type_5: '游客'
      },
      cacheRadio: {
        cache_config: '缓存',
        un_cache_config: '不缓存'
      },

      cacheTime: {
        s: '秒',
        m: '分钟',
        h: '小时',
        d: '天',
        M: '月'
      },
      tableData: [],
      form: {
        cache_config_radio: 'cache_config',
        // 缓存类型（文件类型，匹配内容，缓存时间，weight）, [mm_text]
        cache_config: '',
        // 不缓存类型（文件类型，匹配内容，缓存时间，weight）, [mm_text]
        un_cache_config: '',
        cache_config_status: 1,

        // 忽略请求头中 Cache-Control 和 Pragma, [bool]
        cache_control_pragma: '0',
        // 缓存时忽略 URL 中的参数, [bool]
        cache_url_param: '0',
        // 缓存时忽略 URL 中的参数顺序，[bool]
        cache_url_param_order: '0',
        // 遵循源站响应头部缓存规则, [bool]
        cache_follow: '0',

        // HTTP/HTTPS 缓存共用没有
        cache_http_https: '0'
      },
      checkboxArr
    }
  },
  methods: {
    // 切换缓存 or 不缓存
    changeCacheRadio(val) {
      this.tableData = []
    },

    toSave(row = {}) {
      this.$refs.CreateUpdateRef.showDialog(row, this.form.cache_config_radio)
    },

    toDel(row, idx) {
      // 删除一行
      this.tableData.splice(idx, 1)
    },

    // 添加修改提交
    doSave({ mode = '', data = {} }) {
      // 添加保存
      if (!data.id) {
        this.tableData.push({
          ...data,
          // 设置唯一标识，用于修改
          id: `${Date.now()}_${this.tableData.length}`
        })
      } else {
        // 修改保存
        const idx = this.tableData.findIndex((item) => item.id === data.id)
        this.tableData.splice(idx, 1, data)
      }
    },

    // 提交数据
    submit() {
      const tableData = this.tableData.map((item) => {
        item.id = 0
        return item
      })

      if (this.form.cache_config_status && !tableData.length) {
        this.$msg.error('请添加高级缓存配置')
        return false
      }

      return {
        [this.form.cache_config_radio]: JSON.stringify(tableData),
        cache_control_pragma: this.form.cache_control_pragma,
        cache_url_param: this.form.cache_url_param
      }
    }
  }
}
</script>
