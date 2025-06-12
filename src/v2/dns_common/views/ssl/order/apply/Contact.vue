<template>
  <div class="bg-ants-bg-4 rounded-2xl p-df">
    <div class="rounded-2xl p-df bg-ants-bg-4">
      <TitleBorder title="联系信息" />

      <div class="flex flex-wrap">
        <div
          class="flex items-center mt-lg mr-24"
          style="width: 300px;"
          v-for="(item, key) in contactObj"
          :key="key"
        >
          <strong
            class="inline-block truncate"
            style="width:80px;"
          >{{ item }}</strong>
          <div
            class="flex-1 border border-ants-border-1 rounded-lg px-sm bg-ants-bg-1 truncate"
            style="height:30px;line-height:30px;"
          >
            {{ contact[key] || '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const contactObj = {
  organation: '组织名称',
  job: '头衔',
  firstName: '名字',
  lastName: '姓氏',
  email: '邮箱',
  mobile: '手机',
  country: '国家/地区',
  state: '省份',
  city: '城市',
  address: '地址',
  postCode: '邮编'
}
export default {
  props: {
    contact: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      contactObj
    }
  }
}
</script>
