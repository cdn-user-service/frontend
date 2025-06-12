// API
import { getMsgList, getItem } from '@/v2/dns_users/api/dns/message'
import useMessage from '@/global/store/message'

const { state, getters, mutations, actions } = useMessage({
  getApi: getMsgList,
  readApi: getItem,
  url: '/dns/message'
})

export default {
  state,
  getters,
  mutations,
  actions
}
