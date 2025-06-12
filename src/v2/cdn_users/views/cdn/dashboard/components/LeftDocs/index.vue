<template>
  <el-card>
    <TitleBorder title="常见问题" />

    <el-row :gutter="20" class="mt-lg">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
        v-for="(item, idx) in docsList"
        :key="idx"
      >
        <div class="mb-sm text-sm">
          <a
            :href="item.url"
            class="text-ants-text-2 cursor-color"
            target="blank"
            >{{ item.title }}</a
          >
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
const docsList = [
  {
    title: '如何接入域名？',
    url: '#'
  },
  {
    title: '如何接入域名？',
    url: '#'
  },
  {
    title: '如何接入域名？',
    url: '#'
  },
  {
    title: '如何接入域名？',
    url: '#'
  },
  {
    title: '如何接入域名？',
    url: '#'
  },
  {
    title: '如何接入域名？',
    url: '#'
  }
]

export default {
  data() {
    return {
      docsList
    }
  }
}
</script>
