<template>
  <keep-alive :max="10" :include="['CdnSiteDomain', 'CdnSiteDomainList']">
    <router-view :key="key" />
  </keep-alive>
</template>

<script>
export default {
  name: 'ParentView'
}
</script>
