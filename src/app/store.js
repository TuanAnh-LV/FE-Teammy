import { configureStore } from '@reduxjs/toolkit'
import loadingReducer from './loadingSlice'
import chatReducer from './chatSlice'
import invitationReducer from './invitationSlice'

const store = configureStore({
  reducer: {
    loading: loadingReducer,
    chat: chatReducer,
    invitation: invitationReducer,
  },
})

export default store