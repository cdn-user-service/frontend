<template>
  <el-footer class="text-center text-sm text-ants-text-4">
    <ul class="space-y-3">
        <li>
            Copyright © {{ new Date().getFullYear() }} {{$root.webName}} All Rights Reserved
        </li>
        <li>{{company}}</li>
    </ul>
  </el-footer>
</template>

<script> 
export default {
  data() {
    return {}
  },
  computed: {
    company({ $root }) {
      const { company } = $root.webConfig.contact
      return company
    }
  }
}
</script>
