// API
import { getMessageList } from '@/v2/cdn_admin/api/account/message'
import useMessage from '@/global/store/message'

const { state, getters, mutations, actions } = useMessage({
  getApi: getMessageList,
  url: '/account/message',
  pageKey: 'page',
  limitKey: 'limit',
  admin: true
})

export default {
  state,
  getters,
  mutations,
  actions
}
