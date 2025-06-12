<template>
  <ul class="plan-attr-box">
    <li v-for="(item, key) in nowAttrObj" :key="key">
      <AttrItem :attr-item="item" />
    </li>
  </ul>
</template>

<script>
// 套餐属性
import { productAttrObj } from '@/global/enum'
import AttrItem from './item'
console.log('productAttrObj', productAttrObj)

export default {
  components: {
    AttrItem
  },
  props: {
    // 套餐属性对象 格式： { site: 10, port_forwarding: 10 }
    attrObj: Object,
    // 隐藏未设置的属性
    hiddenAttr: Boolean
  },
  data() {
    return {}
  },
  created() {},
  computed: {
    /**
     * @description: 过滤后要显示属性对象
     */
    nowAttrObj() {
      const obj = {}
      // 过滤掉不显示的属性，比如计费方式、流量、带宽，以及后台未设置的属性
      // Object.keys(this.attrObj).forEach(key => {
      //   if (key in productAttrObj) {
      //     obj[key] = {
      //       attr: key,
      //       ...productAttrObj[key],
      //       value: this.attrObj[key]
      //     }
      //   }
      // })

      if (this.hiddenAttr) {
        Object.keys(this.attrObj).forEach(key => {
          if (this.attrObj[key] && key in productAttrObj) {
            obj[key] = {
              attr: key,
              ...productAttrObj[key],
              value: this.attrObj[key]
            }
          }
        })
      } else {
        Object.keys(productAttrObj).forEach(key => {
          obj[key] = {
            attr: key,
            ...productAttrObj[key],
            value: this.attrObj[key]
          }
        })
      }

      // 新的需求，需要对属性进行排序，根据属性中的 weight字段来排序，越大越靠前
      const arr = []
      Object.keys(obj).forEach(key => {
        arr.push(obj[key])
      })
      arr.sort((a, b) => {
        return b.weight - a.weight
      })

      const sortObj = {}
      arr.forEach(item => {
        sortObj[item.attr] = item
      })
      
      return sortObj
    }
  },
  methods: {}
}
</script>
