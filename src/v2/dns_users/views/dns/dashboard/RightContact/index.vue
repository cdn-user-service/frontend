<template>
  <el-card>
    <div class="mb-lg">
      <TitleBorder title="专属客服" />
    </div>

    <el-row :gutter="10">
      <el-col
        :span="12"
        v-for="(item, key) in contact"
        :key="key"
      >
        <div class="border-ants-border-2 border-dashed mb-df border rounded-2xl flex items-center py-df pl-df">
          <div>
            <i :class="item.icon"></i>
            <span class="pl-2">{{ item.name }}：</span>
          </div>
          <div class="flex-1 truncate">{{ item.value }}</div>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    contact({ $root }) {
      const defaultContact = {
        mobile: {
          name: '电话',
          icon: 'el-icon-phone text-success'
        },
        email: {
          name: '邮箱',
          icon: 'el-icon-message text-warning'
        },
        qq: {
          name: 'QQ',
          icon: 'aicon icon-icon text-primary'
        },
        telegram: {
          name: 'TG',
          icon: 'el-icon-s-promotion text-primary'
        },
        skype: {
          name: 'Skype',
          icon: 'el-icon-s-promotion text-success'
        }
      }
      const { contact } = $root.webConfig

      const obj = {}
      Object.keys(defaultContact).forEach((key) => {
        if (contact[key]) {
          obj[key] = defaultContact[key]
          obj[key].value = contact[key]
        }
      })
      return obj
    }
  },
  methods: {}
}
</script>
