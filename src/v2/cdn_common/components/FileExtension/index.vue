<template>
  <el-popover
    ref="fileExtensionPopover"
    :placement="placement"
    trigger="click"
    width="700"
    @show="popoverShow"
    @hide="popoverHide"
  >
    <el-row :gutter="20">
      <el-col style="width:20%;" v-for="(item1, idx) in contentArr" :key="idx">
        <div class="text-sm font-semibold mb-df text-ants-text-1">
          {{ antsT(item1.title) }}
        </div>
        <ants-checkbox
          class="mb-xs"
          :indeterminate="isIndeterminate(item1).half"
          v-model="isIndeterminate(item1).all"
          @change="checked => handleCheckAllChange(checked, item1)"
          text="全选"
        />

        <ants-checkbox-group
          v-model="content"
          @change="checked => handleCheckedItemChange(checked, item1)"
          class="space-y-2"
        >
          <el-checkbox
            v-for="item2 in item1.child"
            :label="item2"
            :key="item2"
            class="block"
          >
            <span class="text-sm">{{ item2 }}</span>
          </el-checkbox>
        </ants-checkbox-group>
      </el-col>
    </el-row>
    <slot slot="reference"></slot>
  </el-popover>
</template>

<script>
const contentArr = [
  {
    title: '常用静态文件',
    child: [
      'css',
      'js',
      'txt',
      'iso',
      'img',
      'exe',
      'zip',
      'rar',
      '7z',
      'gz',
      'tar',
      'apk',
      'npk',
      'ipa',
      'dmg',
      'manifest',
      'conf',
      'xml',
      'cab',
      'bin',
      'msi'
    ]
  },
  {
    title: '常用图片',
    child: [
      'jpg',
      'jpeg',
      'gif',
      'ico',
      'png',
      'bmp',
      'webp',
      'psd',
      'tif',
      'tiff',
      'svg',
      'svgz'
    ]
  },
  {
    title: '常用影音文件',
    child: [
      'mp3',
      'flv',
      'swf',
      'wma',
      'wav',
      'mp4',
      'mov',
      'mpeg',
      'rm',
      'avi',
      'wmv',
      'mkv',
      'vob',
      'rmvb',
      'asf',
      'mpg',
      'ogg',
      'm3u8',
      'ts',
      'mid',
      'midi',
      '3gp'
    ]
  },
  {
    title: '常用文档',
    child: [
      'doc',
      'pdf',
      'csv',
      'ppt',
      'docx',
      'xlsx',
      'xls',
      'pptx',
      'ttf',
      'chm',
      'woff',
      'ps',
      'class',
      'jar',
      'woff2'
    ]
  },
  {
    title: '网页文件',
    child: ['html', 'htm', 'php', 'json']
  }
]
export default {
  props: {
    // 绑定的值
    value: [String, Array],
    // 返回值为字符串 == str，还是数组 = array
    type: {
      type: String,
      default: 'str'
    },
    // 弹出位置
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  model: {
    event: 'updateValue'
  },
  data() {
    return {
      contentArr,
      content: []
    }
  },
  computed: {
    // 计算是全选还是半选，还是都不选
    isIndeterminate() {
      return obj => {
        let num = 0
        obj.child.forEach(item => {
          if (this.content.indexOf(item) != -1) num++
        })

        const childLength = obj.child.length
        // 半选
        if (num > 0 && num < childLength) {
          return {
            all: false,
            half: true
          }
        }
        // 全不选
        if (num === 0) {
          return {
            all: false,
            half: false
          }
        }
        // 全选
        return {
          all: true,
          half: false
        }
      }
    }
  },
  methods: {
    /**
     * @description: popover 显示，并数据初始化
     */    
    popoverShow() {
      if (this.type === 'array') {
        this.content = this.value
      } else {
        if (this.value !== '') {
          this.content = this.value.split('|')
        } 
      }
    },

    /**
     * @description: popover 隐藏，置空数据
     */    
    popoverHide() {
      this.content = []
    },

    /**
     * @description: 点击全选
     * @param {*} val
     * @param {*} item
     */

    handleCheckAllChange(val, item) {
      // 全选中
      if (val) {
        this.content = [...this.content, ...item.child]
      } else {
        // 全不选中
        this.content = this.content.filter(it => item.child.indexOf(it) === -1)
      }

      // 给输入框赋值
      this.updateContentInput()
    },

    /**
     * @description: 点击单选
     * @param {*} val
     * @param {*} item
     */

    handleCheckedItemChange(val, item) {
      // 给输入框赋值
      this.updateContentInput()
    },

    /**
     * @description: 给输入框赋值
     */

    updateContentInput() {
      let contentData = null
      // 返回值为数组
      if (this.type === 'array') {
        contentData = this.content
      } else {
        contentData = this.content.join('|')
      }
      this.$emit('updateValue', contentData)
    }
  }
}
</script>
