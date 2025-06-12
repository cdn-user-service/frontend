// API
import { getMsgList, getItem } from '@/v2/cdn_users/api/cdn/message'

import useMessage from '@/global/store/message'

const { state, getters, mutations, actions } = useMessage({
  getApi: getMsgList,
  readApi: getItem,
  url: '/cdn/message'
})

export default {
  state,
  getters,
  mutations,
  actions
}
