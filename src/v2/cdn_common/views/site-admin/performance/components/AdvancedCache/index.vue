<template>
  <div>
    <ants-form-card :tips-arr="antsTTipsArr">
      <template slot="title">{{ antsT('高级缓存') }}</template>
      <template slot="info">
        {{ $root.webName }}
        {{ antsT('优质节点网络，智能缓存网站内容极大提高网站访问速度') }}
      </template>
      <template slot="content">
        <ul class="space-y-10">
          <li style="display: flex">
            <ants-switch
              v-model="form.cache_config_status"
              active-text="ON"
              inactive-text="OFF"
              v-loading="$attrs.btnLoading"
              @change="changeStatus"
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
            <div>
              <el-badge
                :value="antsT('优先')"
                class="radio-badge"
                type="danger"
              >
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
                class="ml-xl"
                @click="toclearConfig()"
                text="一键清理"
              />
            </div>
            <ants-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              class="ml-xl"
              @click="showCreateUpdateDialog()"
              :text="`添加${cacheRadio[form.cache_config_radio]}`"
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

              <ants-table-column
                label="优先级（由上往下）"
                prop="weight"
                min-width="140"
                align="center"
              >
                <template #default="{ row }">
                  <span
                    class="el-icon-upload2 text-2xl cursor-pointer hover:text-primary"
                    @click="changeWeight(row.id, 0)"
                  ></span>
                  <span
                    class="el-icon-top text-2xl cursor-pointer hover:text-primary"
                    @click="changeWeight(row.id, 1)"
                  ></span>
                  <span
                    class="el-icon-bottom text-2xl cursor-pointer hover:text-primary"
                    @click="changeWeight(row.id, -1)"
                  ></span>
                  <span
                    class="el-icon-download text-2xl cursor-pointer hover:text-primary"
                    @click="changeWeight(row.id, -999999)"
                  ></span>
                  <!-- <span
                    class="el-icon-bottom text-2xl text-primary cursor-pointer mr-xs"
                  ></span>
                  <span
                    class="el-icon-top text-2xl text-primary cursor-pointer"
                  ></span> -->
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

    <!-- 添加修改缓存对话框 -->
    <CreateUpdateDialog
      ref="CreateUpdateDialogRef"
      v-on="$listeners"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import CreateUpdateDialog from './createUpdate'
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doClearCache } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

export default {
  components: {
    CreateUpdateDialog
  },
  data() {
    return {
      // 缓存类型对象
      typeObj: {
        type_1: '文件后缀',
        type_2: '精确匹配',
        type_3: '模糊匹配',
        type_4: '缓存目录',
        type_5: '所有类型'
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
        M: '月',
        y: '年'
      },

      form: {
        cache_config_radio: 'cache_config',
        // 缓存类型（文件类型，匹配内容，缓存时间，weight）, [mm_text]
        cache_config: '',
        // 不缓存类型（文件类型，匹配内容，缓存时间，weight）, [mm_text]
        un_cache_config: '',
        cache_config_status: 0,

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
      tableData: [],

      checkboxArr: Object.freeze([
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
      ]),
      tipsArr: Object.freeze([
        '1. 若您需配置的缓存类型不在我们的列表中，可以手动添加，以“|”分割；',
        '2. 缓存类型为目录或者精确匹配时以“／”开头；',
        '3. 支持自行调控优先级，不缓存记录优先级高于缓存记录；',
        '4. 开启缓存功能后，系统默认忽略请求头中 Cache-Control 和 Pragma 两个头部不走缓存信息，只要节点有缓存就不会到源取数据，仍然返回缓存内容；',
        '5. 缓存时间最长一年，缓存/不缓存分别能添加 200 条；',
        '6. 游客缓存可以提升未登录用户的访问速度，若您的业务登录后用Cookie标识访客的，可对此Cookie键配置游客缓存，不包含此Cookie键的内容将被缓存。'
      ])
    }
  },
  computed: {
    antsTTipsArr() {
      return this.tipsArr.map((item) => this.antsT(item))
    }
  },
  methods: {
    async toclearConfig() {
      console.log('一键清理')
      this.btnLoading = true

      const content = `http://${this.$route.query.domain}/*`
      const contentArr = content.split(/[\r\n]+/)
      // 需要去掉每一行空格
      const arr = contentArr.map((item) => item.trim())
      // 推送 urls 进行刷新缓存
      const { data: res } = await doClearCache({
        // 传递一\n分割的字符串
        urls: arr.join('\n')
      })
      if (res.code !== 1) return
      this.$msg.success(this.antsT('刷新缓存成功'))
      this.form.content = ''
    },
    // 权重修改
    async changeWeight(id, val) {
      if (this.isDisabled || this.$root.disabledCrud) return
      this.weightLoading = true
      try {
        const data = await this.$listeners.changeSiteAttrWeight(
          this.form.cache_config_radio,
          id,
          val
        )
        // 刷新表格
        this.$emit('refreshData')
      } finally {
        this.weightLoading = false
      }
    },
    // 切换缓存 or 不缓存
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

<style lang="scss">
.radio-badge {
  .el-badge__content {
    padding: 1px 6px;
    border-radius: 12px;
    height: auto;
  }
  .el-badge__content.is-fixed {
    right: 20px;
  }
}
</style>
