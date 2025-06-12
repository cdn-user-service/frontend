<template>
  <el-card class="content-box animated fadeIn">
    <ul class="ants-tips_box space-y-4">
      <li v-for="(item, idx) in tipsArr" :key="idx">
        {{ antsT(item) }}
      </li>
    </ul>

    <!-- <div class="my-lg">
      <ants-select
        v-if="isAdmin"
        v-model="form.ips"
        placeholder="请选择节点"
        :loading="loading"
        filterable
        multiple
      >
        <ants-option
          v-for="item in nodeList"
          :key="item.id"
          :label="item.clientIp"
          :value="item.clientIp"
        />
      </ants-select>

      <ants-input
        v-else
        v-model="form.ips"
        placeholder="请输入节点，一行一个"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
      />
    </div> -->

    <div class="my-lg">
      <ants-input
        v-model="form.urls"
        placeholder="请输入需要缓存预热的URL"
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 20 }"
      />
    </div>

    <ants-button
      :disabled="$root.disabledCrud"
      text="缓存预热"
      type="primary"
      size="small"
      icon="el-icon-s-promotion"
      :loading="btnLoading"
      @click="submitFrom"
    />
  </el-card>
</template>

<script>
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { doPreheat } = require(`@/v2/${PROCESS_NAME}/api/cdn/site`)

let getNodeListAPI = null
if (PROCESS_NAME === 'cdn_admin') {
  const { getNodeList } = require(`@/v2/${PROCESS_NAME}/api/cdn/node`)
  getNodeListAPI = getNodeList
}

const tipsArr = [
  '提前将需要缓存的资源预热到节点上，提升缓存命中率和请求速度',
  '1、请输入具体域名 URL，以 http(s):// 开始，多个 URL 请用回车分隔；',
  '2、缓存预热仅支持已审核通过域名的URL，暂不支持泛域名URL；',
  '3、缓存预热需遵循缓存配置，不匹配缓存策略的 URL 以及非本账号下的 URL 将被忽略；',
  '4、单账号每分钟仅支持添加2次URL缓存预热任务，单次最多支持200条，且重复的URL将被忽略。'
]
export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      tipsArr,
      btnLoading: false,
      form: {
        urls: '',
        ips: []
      },

      // 节点列表
      loading: false,
      nodeList: []
    }
  },
  created() {
    if (this.isAdmin) {
      this.form.ips = []
      this.getNodeList()
    } else {
      this.form.ips = ''
    }
  },
  methods: {
    /**
     * @description: 获取节点列表
     */
    async getNodeList() {
      this.loading = true
      const { data: res } = await getNodeListAPI({
        ip: '',
        page: 1,
        limit: 500
      })
      this.loading = false

      if (res.code !== 1) return
      this.nodeList = res.data && res.data.list
    },

    /**
     * @description: 缓存预热提交
     */

    async submitFrom() {
      if (!this.form.ips.length) {
        this.$msg.error(this.antsT(`请${this.isAdmin ? '选择' : '输入'}节点`))
        return
      }
      if (!this.form.urls) {
        this.$msg.error(this.antsT('请输入需要缓存预热的URL'))
        return
      }

      const contentArr = this.form.urls.trim().split(/[\r\n]+/)
      // 验证格式是否合法
      const checkObj = this.checkValue(contentArr)
      if (!checkObj.isOk) {
        return this.$msg.error(checkObj.text)
      }

      let arr = []
      const obj = {}
      contentArr.forEach((item) => {
        if (item.search(/http:\/\//i) != -1) {
          const host = item.replace(/http:\/\//g, '')
          obj[host] = 'http://'
        }
        if (item.search(/https:\/\//i) != -1) {
          const host = item.replace(/https:\/\//g, '')
          obj[host] = 'https://'
        }
      })
      arr = contentArr

      this.btnLoading = true
      const { data: res } = await doPreheat({
        urls: arr.join(','),
        ips: this.isAdmin
          ? this.form.ips.join(',')
          : this.form.ips.trim().replace(/[\r\n]+/g, ',')
      })
      this.btnLoading = false
      if (res.code !== 1) return

      const total = arr.length
      const success = res.data || 0
      const error = total - success

      this.$msg.success(this.antsT(success + '个URL预热成功'))
    },

    /**
     * @description: 验证格式是否合法
     * @param {*} val
     */

    checkValue(valArr = []) {
      const regObj = {
        host: /^(?=^.{3,262}$)(http|https):\/\/(\*|[a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
        suffix:
          /^(?=^.{3,262}$)(http|https):\/\/(\*|[a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
        url: /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?$/,
        catalog:
          /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?\/$/
      }
      const reg = regObj.url
      // 将数据拆分成一行一个
      const newArr = valArr
      // 是否正确的格式
      let isOk = false
      let text = ''
      // 临时数组，用于判读域名是否重复
      const nowArr = []

      // 遍历域名数组
      newArr.every((item, idx) => {
        const itemTrim = item.trim()
        isOk = reg.test(itemTrim)
        if (!isOk) {
          text =
            this.antsT('格式不正确：') +
            itemTrim +
            this.antsT('，以http(s)://开头')
          return true
        }

        // 判断域名是否重复，如果当前域名在数组中第一次出现的位置不是 i，则认为该域名重复
        nowArr[idx] = itemTrim // 将数据存入临时数组
        if (nowArr.indexOf(itemTrim) != idx) {
          isOk = false
          text = this.antsT('不能重复：') + itemTrim
        }
        return isOk
      })

      return { isOk, text }
    }
  }
}
</script>

<style lang="scss" scoped></style>
