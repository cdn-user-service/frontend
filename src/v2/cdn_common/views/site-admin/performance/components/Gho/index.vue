<template>
  <div>
    <ants-form-card :tips-arr="antsTTipsArr">
      <template slot="title">{{ antsT('镜像文件') }}</template>
      <template slot="info">
        {{ antsT('镜像文件') }}
      </template>
      <template slot="content">
        <ul class="space-y-10">
          <li class="flex justify-between items-center">
            <ants-switch
              v-model="form.cache_config_status"
              active-text="ON"
              inactive-text="OFF"
              v-loading="$attrs.btnLoading"
              @change="changeStatus"
            />

            <ants-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              @click="showCreateUpdateDialog()"
              text="添加镜像"
            />
          </li>

          <li>
            <el-table
              :data="tableData"
              border
              size="small"
              v-loading="$root.loading"
            >
              <ants-table-column
                label="文件类型"
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
                label="文件时间"
                prop="time"
                min-width="140"
                align="center"
                v-if="form.cache_config_radio === 'cache_config'"
              >
                <template #default="{ row }">
                  {{ row.time }} {{ antsT(cacheTime[row.unit]) }}
                </template>
              </ants-table-column>
              <ants-table-column
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
              </ants-table-column>

              <ants-table-column label="操作" width="160" align="center">
                <template #default="{ row }">
                  <ants-button
                    size="mini"
                    type="primary"
                    @click="showCreateUpdateDialog(row)"
                    text="编辑"
                  />
                  <ants-button
                    size="mini"
                    type="danger"
                    @click="deleteSingle(row)"
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
              :disabled="$attrs.btnLoading"
              @change="doSave(item.key)"
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
      </template>
    </ants-form-card>

    <!-- 添加修改文件对话框 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'
export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      // 文件类型对象
      typeObj: {
        type_1: '文件后缀',
        type_2: '精确匹配',
        type_3: '模糊匹配',
        type_4: '文件目录',
        type_5: '游客'
      },
      cacheRadio: {
        cache_config: '文件',
        un_cache_config: '不文件'
      },

      cacheTime: {
        s: '秒',
        m: '分钟',
        h: '小时',
        d: '天',
        M: '月'
      },

      form: {
        cache_config_radio: 'cache_config',
        // 文件类型（文件类型，匹配内容，文件时间，weight）, [mm_text]
        cache_config: '',
        // 不文件类型（文件类型，匹配内容，文件时间，weight）, [mm_text]
        un_cache_config: '',
        cache_config_status: 0,

        // 忽略请求头中 Cache-Control 和 Pragma, [bool]
        cache_control_pragma: '0',
        // 文件时忽略 URL 中的参数, [bool]
        cache_url_param: '0',
        // 文件时忽略 URL 中的参数顺序，[bool]
        cache_url_param_order: '0',
        // 遵循源站响应头部文件规则, [bool]
        cache_follow: '0',

        // HTTP/HTTPS 文件共用没有
        cache_http_https: '0'
      },
      tableData: [],

      checkboxArr: Object.freeze([
        {
          key: 'cache_control_pragma',
          title: '忽略请求头中 Cache-Control 和 Pragma',
          tips: '忽略本请求头在有文件的情况下使用文件响应，而不向源服务器请求'
        },
        // {
        //   key: 'cache_http_https',
        //   title: 'HTTP / HTTPS 文件共用',
        //   tips: '同一份资源文件，HTTP 和 HTTPS 下共用文件，可提升文件命中率'
        // },
        {
          key: 'cache_url_param',
          title: '文件时忽略 URL 中的参数',
          tips: '控制文件时是否忽略用户请求URL中问号之后的参数，默认情况下不会忽略“?”之后的参数'
        }
        // {
        //   key: 'cache_url_param_order',
        //   title: '参数顺序识别',
        //   tips:
        //     '可将URL中参数相同，但是顺序不同的资源内容，忽略参数的排序，只文件一份，可有效提高文件命中率'
        // },
        // {
        //   key: 'cache_follow',
        //   title: '遵循源站响应头部文件规则',
        //   tips: '客户端文件时间遵循源站设置的生效时长'
        // }
      ]),
      tipsArr: Object.freeze([
        '1. 若您需配置的文件类型不在我们的列表中，可以手动添加，以“|”分割；',
        '2. 文件类型为目录或者精确匹配时以“／”开头；',
        '3. 支持自行调控优先级，不文件记录优先级高于文件记录；',
        '4. 开启文件功能后，系统默认忽略请求头中 Cache-Control 和 Pragma 两个头部不走文件信息，只要节点有文件就不会到源取数据，仍然返回文件内容；',
        '5. 文件时间最长一年，文件/不文件分别能添加 200 条；',
        '6. 游客文件可以提升未登录用户的访问速度，若您的业务登录后用Cookie标识访客的，可对此Cookie键配置游客文件，不包含此Cookie键的内容将被文件。'
      ])
    }
  },
  computed: {
    antsTTipsArr() {
      return this.tipsArr.map((item) => this.antsT(item))
    }
  },
  methods: {
    // 切换文件 or 不文件
    changeCacheRadio(val) {
      this.tableData = []
      this.$emit('refreshData')
    },

    /**
     * @description: 单个保存
     * @param {*} key
     */

    doSave(key = '') {
      this.$listeners.saveSiteAttr({
        [key]: this.form[key]
      })
    },

    /**
     * @description: 对话框展示
     * @param {*} row
     */

    showCreateUpdateDialog(row = {}) {
      this.$refs.CreateUpdateDialogRef.showDialog(
        row,
        this.form.cache_config_radio
      )
    },

    async changeStatus(val) {
      const res = await this.$listeners.changeSiteAttrStatus({
        pkey: this.form.cache_config_radio,
        status: val
      })
      // 复位
      if (!res) {
        val = val ? 0 : 1
      }
    },

    /**
     * @description: 单个删除
     * @param {*} row
     */

    async deleteSingle({ id }) {
      const res = await this.$listeners.deleteSiteAttr(
        this.form.cache_config_radio,
        id
      )
      if (res) this.$emit('refreshData')
    }
  }
}
</script>
