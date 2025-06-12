<template>
  <el-card class="content-box animated fadeIn">
    <ants-radio-group
      v-model="form.activeType"
      size="small"
      @change="changeType"
    >
      <ants-radio-button
        v-for="(value, key) in typeObj"
        :key="key"
        :label="key"
        :text="value.title"
      />
    </ants-radio-group>

    <ul class="ants-tips_box my-lg space-y-4">
      <li v-for="(item, idx) in typeObj[form.activeType].tips" :key="idx">
        {{ item }}
      </li>
    </ul>

    <div class="my-lg">
      <ants-checkbox-group
        v-if="form.activeType === 'suffix'"
        v-model="form.suffix"
        class="pb-lg"
      >
        <ants-checkbox
          v-for="item in suffixTypeArr"
          :key="item"
          :label="item"
          :text="item"
        />
      </ants-checkbox-group>
      <ants-input
        v-model="form.content"
        :placeholder="`请输入${typeObj[form.activeType].placeholder}，以http(s)://开头，一行一个`"
        type="textarea"
        :autosize="{ minRows: 15, maxRows: 20 }"
      />
    </div>

    <ants-button
      text="刷新缓存"
      type="primary"
      size="small"
      icon="el-icon-brush"
      :loading="btnLoading"
      @click="submitFrom"
    />
  </el-card>
</template>

<script>
// API
import { getPrometheus } from '@/v2/cdn_admin/api/cdn/monitor'
import { doClearCache } from '@/v2/cdn_admin/api/cdn/site'

const typeObj = {
  host: {
    title: '整站刷新',
    placeholder: '指定站点',
    tips: [
      '1、请输入需要刷新的域名，以 http(s):// 开头，如：http://www.demo.com，多个域名请用回车分隔；',
      '2、非本账号下的域名将被忽略；',
      '3、不支持泛域名清理缓存，需输入具体域名进行清理；',
      '4、单账号每分钟仅支持添加2次整站刷新任务，单次最多支持200条，且重复的域名将被忽略。'
    ]
  },
  url: {
    title: '指定URL刷新',
    placeholder: '指定URL',
    tips: [
      '1、请输入需要刷新的URL，以 http(s):// 开头，如：http://www.demo.com/img.png，多个URL请用回车分隔；',
      '2、非本账号下的域名URL将被忽略；',
      '3、不支持泛域名URL清理缓存，需输入具体域名URL进行清理；',
      '4、单账号每分钟仅支持添加2次URL刷新任务，单次最多支持200条，且重复的URL将被忽略。'
    ]
  },
  catalog: {
    title: '指定目录刷新',
    placeholder: '指定目录',
    tips: [
      '1、请输入需要刷新的目录，以 http(s):// 开头，以/结束，如：http://www.demo.com/css/，多个目录请用回车分隔；',
      '2、非本账号下的域名目录将被忽略；',
      '3、不支持泛域名目录清理缓存，需输入具体目录进行清理；',
      '4、单账号每分钟仅支持添加2次目录刷新任务，单次最多支持100条，且重复的目录将被忽略。'
    ]
  },
  suffix: {
    title: '指定文件类型',
    placeholder: '指定站点',
    tips: [
      '1、请输入需要刷新的域名，以 http(s):// 开头，如：http://www.demo.com，多个域名请用回车分隔；',
      '2、将会清理所有站点下指定的文件类型；',
      '3、非本账号下的站点下指定文件将被忽略；',
      '4、暂时只支持一下文件类型，如需更多文件类型请联系我们。'
    ]
  }
}

export default {
  data() {
    return {
      btnLoading: false,
      typeObj,
      suffixTypeArr: ['js', 'css', 'json', 'php', 'html'],
      form: {
        suffix: [],
        activeType: 'host',
        content: ''
      }
    }
  },
  created() {},
  methods: {
    changeType(val) {
      this.form.content = ''
      this.form.suffix = []
    },

    /**
     * @description: 查询缓存url
     */

    async getCacheData(queryArr, queryObj) {
      // 默认查询 1小时内的数据
      const start =
        new Date().setTime(new Date().getTime() - 3600 * 1000 * 6) / 1000
      const end = new Date().getTime() / 1000
      // 粒度， 1h -> 14， 2h -> 28, 6h -> 86
      const step = 86
      // 查询条件
      let query = ''
      const type = this.form.activeType

      // 1、整站刷新
      if (type === 'host') {
        const hostStr = queryArr.join('|uris::')
        const noHttpStr = hostStr.replace(/(http:\/\/|https:\/\/)/g, '')
        console.log(noHttpStr)
        query = `sum(nginx_vts_filter_bytes_total{filter=~"uris::${noHttpStr}"}) by (filter,filter_name)`
      }

      // 2、指定目录刷新
      if (type === 'catalog') {
        const urlStr = queryArr.join('.*|')
        const noHttpStr = urlStr.replace(/(http:\/\/|https:\/\/)/g, '')
        console.log(noHttpStr)
        query = `sum(nginx_vts_filter_bytes_total{url=~"${noHttpStr}.*"}) by (url)`
      }

      // 3、指定文件类型
      if (type === 'suffix') {
        const suffixStr = this.form.suffix.join('|.*.')
        const hostStr = queryArr.join('|uris::')
        const noHttpStr = hostStr.replace(/(http:\/\/|https:\/\/)/g, '')
        console.log(noHttpStr)
        query = `sum(nginx_vts_filter_bytes_total{filter=~"uris::${noHttpStr}",filter_name=~".*.${suffixStr}"}) by (filter,filter_name)`
      }

      const { data: res } = await getPrometheus({
        path: '/api/v1/query_range',
        param: `query=${encodeURIComponent(
          query
        )}&start=${start}&end=${end}&step=${step}`
      })
      if (res.code !== 1) return false

      const obj = JSON.parse(res.data || [])
      let urlsArr = []
      // 如果有数据
      if (obj.data && obj.data.result && obj.data.result.length) {
        console.log(obj.data.result)
        if (type === 'host' || type === 'suffix') {
          urlsArr = obj.data.result.map(item => {
            const filterHost = item.metric.filter.replace('uris::', '')
            // 协议
            const protocolStr = queryObj[filterHost] || 'http://'
            return protocolStr + filterHost + item.metric.filter_name
          })
        }

        if (type === 'catalog') {
          urlsArr = obj.data.result.map(item => {
            const itUrl = item.metric.url
            let newUrl = 'http://' + itUrl
            Object.keys(queryObj).some(key => {
              if (itUrl.indexOf(key) != -1) {
                newUrl = queryObj[key] + itUrl
                return true
              }
            })
            return newUrl
          })
        }

        console.log(urlsArr)
      }
      return urlsArr.join(',')
    },

    /**
     * @description: 清理缓存提交
     */

    async submitFrom() {
      if (this.form.content == '' && this.form.activeType != 'suffix') {
        return this.$msg.error(
          `请输入${this.typeObj[this.form.activeType].title}内容`
        )
      }

      // 拆分数据，一行一个
      let arr = []
      const obj = {}
      if (this.form.activeType === 'suffix') {
        if (!this.form.suffix.length) return this.$msg.error('请选择文件类型')
      }

      const contentArr = this.form.content.trim().split(/[\r\n]+/)

      // 验证格式是否合法
      const checkObj = this.checkValue(contentArr)
      console.log(checkObj)
      if (!checkObj.isOk) {
        return this.$msg.error(checkObj.text)
      }

      contentArr.forEach(item => {
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
      console.log(obj)

      this.btnLoading = true
      let urlsStr = ''
      // 指定URL刷新，不用查询，直接传url
      if (this.form.activeType === 'url') {
        urlsStr = arr.join(',')
      } else {
        // 获取要缓存的 urls
        urlsStr = await this.getCacheData(arr, obj)
        if (!urlsStr) {
          this.btnLoading = false
          this.$msg.success('刷新缓存成功!')
          return
        }
      }

      // 推送 urls 进行刷新缓存
      const { data: res } = await doClearCache({
        urls: urlsStr
      })
      this.btnLoading = false
      this.$msg.success('刷新缓存成功')
      this.form.content = ''
    },

    /**
     * @description: 验证格式是否合法
     * @param {*} val
     */

    checkValue(valArr = []) {
      const regObj = {
        host: /^(?=^.{3,262}$)(http|https):\/\/(\*|[a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
        suffix: /^(?=^.{3,262}$)(http|https):\/\/(\*|[a-zA-Z0-9][-a-zA-Z0-9]{0,62})(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
        url: /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?$/,
        catalog: /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?\/$/
      }
      const reg = regObj[this.form.activeType]
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
          text = '格式不正确：' + itemTrim + '，以http(s)://开头'
          return true
        }

        // 判断域名是否重复，如果当前域名在数组中第一次出现的位置不是 i，则认为该域名重复
        nowArr[idx] = itemTrim // 将数据存入临时数组
        if (nowArr.indexOf(itemTrim) != idx) {
          isOk = false
          text = '不能重复：' + itemTrim
        }
        return isOk
      })

      return { isOk, text }
    }
  }
}
</script>
