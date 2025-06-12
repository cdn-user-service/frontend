<template>
  <el-card class="animated fadeIn">
    <div class="mb-lg flex items-center">
      <ants-button
        size="mini"
        type="primary"
        plain
        icon="el-icon-arrow-left"
        @click="$router.push('./step-1')"
        class="mr-lg"
        text="上一步"
      />
      <TitleBorder title="选择问题类型" />
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
              @click="goStep3(item)"
            >
              <div class="font-bold">
                {{ item.title }}
              </div>
              <div class="mt-sm text-sm text-ants-text-4 truncate">
                {{ item.description }}
              </div>
            </div>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>

    <!-- <DocsList /> -->
  </el-card>
</template>

<script>
// API
import { getWorkOrderCategoryList } from '@/v2/cdn_users/api/cdn/work-order'

// import DocsList from './components/DocsList'
export default {
  components: {
    // DocsList
  },
  data() {
    return {
      loading: true,
      parentId: this.$route.query.id,
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
        parentId: this.parentId
      })
      this.loading = false
      if (res.code !== 1) return
      this.categoryList = res.data || []
    },

    /**
     * @description: 前往第三步
     * @param {*} id
     * @param {*} title
     */

    goStep3({ id, parentId, title }) {
      this.$router.push(`./step-3?parentId=${parentId}&id=${id}&title=${title}`)
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
