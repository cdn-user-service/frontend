<template>
  <div class="animated fadeIn mt-lg">
    <ants-form-card>
      <template slot="title">{{ antsT('增值业务') }}</template>
      <template slot="content">
        <el-skeleton :rows="4" :loading="$root.loading" animated>
          <el-table :data="vasData" style="margin:0;" border>
            <ants-table-column label="ID" prop="id" width="80" align="center">
            </ants-table-column>

            <ants-table-column
              label="名称"
              min-width="140"
              prop="suitName"
              align="center"
            >
            </ants-table-column>

            <ants-table-column label="规格" min-width="160" align="center">
              <template #default="{ row }">
                <ul class="space-y-3">
                  <li
                    v-for="(item, key) in itemAttrObj(row.attrJson)"
                    :key="key"
                  >
                    <PlanAttrItem :attr-item="item" />
                  </li>
                </ul>
              </template>
            </ants-table-column>

            <ants-table-column
              label="生效时间"
              prop="startTime"
              min-width="140"
              align="center"
            >
            </ants-table-column>
            <ants-table-column
              label="到期时间"
              prop="endTime"
              min-width="140"
              align="center"
            >
            </ants-table-column>
          </el-table>
        </el-skeleton>
      </template>
    </ants-form-card>

    <!-- <el-card class="animated fadeIn mt-lg">
      <div slot="header" class="flex items-center">
        <strong class="mr-lg">{{ antsT('增值业务') }}</strong>
        <div v-if="isUsers">
        </div>
      </div>
    </el-card> -->
  </div>
</template>

<script>
import { priceName, productAttr } from '@/global/enum'
import PlanAttrItem from '@/v2/cdn_common/components/Plan/Attr/item.vue'

const PROCESS_NAME = process.env.VUE_APP_NAME
const newProductAttr = productAttr || {}
export default {
  components: {
    PlanAttrItem
  },
  props: {
    vasData: Array
  },
  data() {
    return {
      // 后台不显示升级、续费
      isUsers: PROCESS_NAME === 'cdn_users',
      priceName
    }
  },
  computed: {
    // 过滤后要显示属性对象
    itemAttrObj() {
      return (attrJson = '') => {
        const attr = JSON.parse(attrJson || '{}')
        const obj = {}
        Object.keys(attr).forEach(key => {
          if (attr[key] && (key in newProductAttr)) {
            obj[key] = {
              attr: key,
              ...newProductAttr[key],
              value: attr[key]
            }
          }
        })
        return obj
      }
    }
  },
  created() {},
  methods: {
    /**
     * @description: 获取站点套餐
     */

    async getSiteDetail() {}
  }
}
</script>
