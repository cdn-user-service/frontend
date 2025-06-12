<template>
  <div class="plan-used-box">
    <div style="max-width:400px;" v-if="showFlowProgress && attrObj.charging_mode == 1">
      <div class="font-bold mb-df">{{antsT('流量使用情况')}}</div>
      <FlowProgress :used="+flowNum.used" :total="+flowNum.total" :width="12"/>
    </div>

    <!-- <div style="max-width:300px;">
      <div class="font-bold mb-df">带宽使用情况</div>
      <FlowProgress :used="flowNum.used" :total="flowNum.total" width="12"/>
    </div> -->

    <ul class="flex items-center flex-wrap">
      <li
        v-for="(item, key) in nowAttrObj"
        :key="key"
        class="my-lg text-center mr-xxl text-sm"
      >
        <AttrItem :attr-item="item" />
      </li>
    </ul>
  </div>
</template>

<script>
// 套餐属性
import { productAttrObj } from '@/global/enum'

import AttrItem from './item'
import FlowProgress from '../FlowProgress'
export default {
  components: {
    FlowProgress,
    AttrItem
  },
  props: {
    // 套餐属性对象 格式： { site: 10, port_forwarding: 10 }
    attrObj: Object,
    // 套餐已使用属性对象
    usedObj: Object,
    // 是否显示流量使用情况
    showFlowProgress: {
      type: Boolean,
      default: true
    }
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
      Object.keys(this.attrObj).forEach(key => {
        if (key in productAttrObj && this.attrObj[key] != null) {
          obj[key] = {
            attr: key,
            ...productAttrObj[key],
            // 总量
            value: this.attrObj[key],
            // 已使用
            used: this.usedObj[key] || 0
          }
        }
      })

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
    },

    // 流量
    flowNum() {
      return {
        used: +this.usedObj.flow || 0,
        total: +this.attrObj.flow
      }
    }
  },
  methods: {}
}
</script>
