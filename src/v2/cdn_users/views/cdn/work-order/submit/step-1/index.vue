<template>
  <el-card class="animated fadeIn">
    <div class="mb-lg">
      <TitleBorder title="选择问题所属分类" />
      <!-- <strong class="text-2xl">{{antsT('选择问题所属分类')}}</strong> -->
    </div>
    <el-skeleton :rows="6" :loading="loading" animated>
      <template>
        <el-empty v-if="!categoryList.length"> </el-empty>

        <el-row :gutter="20" v-else>
          <el-col
            :xs="{ span: 24 }"
            :sm="{ span: 12 }"
            :md="{ span: 8 }"
            :lg="{ span: 8 }"
            :xl="{ span: 8 }"
            v-for="item in categoryList"
            :key="item.id"
          >
            <div
              class="mb-lg p-lg cursor-pointer border border-ants-border-3 rounded-2xl border-card-item"
            >
              <div class="flex items-center" @click="goStep2(item.id)">
                <div class="p-lg">
                  <span
                    class="el-icon-s-shop text-primary"
                    style="font-size:34px;"
                  ></span>
                </div>
                <div class="flex-1 pl-sm" style="max-width:80%;">
                  <div class="font-bold mb-sm">{{ item.title }}</div>
                  <div class="text-sm text-ants-text-4 truncate">
                    {{ item.description }}
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>
  </el-card>
</template>

<script>
// API
import { getWorkOrderCategoryList } from '@/v2/cdn_users/api/cdn/work-order'

export default {
  data() {
    return {
      categoryList: []
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    /**
     * @description: 获取工单类型列表
     */

    async getCategoryList() {
      this.loading = true
      const { data: res } = await getWorkOrderCategoryList({
        parentId: 0
      })
      this.loading = false
      
      if (res.code !== 1) return
      this.categoryList = res.data || []
    },

    /**
     * @description: 前往第二步
     */

    goStep2(id) {
      this.$router.push('./step-2?id=' + id)
    }
  }
}
</script>

<style lang="scss" scoped>
.border-card-item {
  transition: all 0.3s;
  &:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    color: theme('colors.primary');
    border-color: #fff;
  }
}
</style>
