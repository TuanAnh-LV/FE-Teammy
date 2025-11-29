import { configureStore } from '@reduxjs/toolkit'
import loadingReducer from './loadingSlice'
import chatReducer from './chatSlice'

const store = configureStore({
  reducer: {
    loading: loadingReducer,
    chat: chatReducer,
  },
})

export default store