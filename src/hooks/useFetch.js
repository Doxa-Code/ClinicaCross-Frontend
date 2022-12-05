import swal from '@sweetalert/with-react'
import { api } from '../services/api'
import { createLogger } from './store'

export const useFetch = () => {
  const logger = createLogger()
  return {
    create: async (route, data, config = {}) => {
      try {
        const response = await api.post(route, data, config)
        if (!response.data) {
          throw new Error('Houve um erro ao tentar atualizar os dados!')
        }
        return [response.data, false]
      } catch (err) {
        logger.error(err.response?.data || err.message, {
          module: 'useFetch - create',
          body: {
            route,
            data,
            config
          }
        })
        swal('Erro', `${err.response?.data || err.message}`, 'error')
        return [err.response?.data, true]
      }
    },
    fetch: async route => {
      try {
        const response = await api.get(route)
        if (!response.data) {
          throw new Error('Houve um erro ao tentar carregar os dados!')
        }
        return [response.data, false]
      } catch (err) {
        logger.error(err.response?.data || err.message, {
          module: 'useFetch - fetch',
          body: {
            route
          }
        })
        swal('Erro', `${err.response?.data || err.message}`, 'error')
        return [err.response?.data, true]
      }
    },
    update: async (route, data, config = {}) => {
      try {
        const response = await api.put(route, data, config)
        if (!response.data) {
          throw new Error('Houve um erro ao tentar atualizar os dados!')
        }
        return [response.data, false]
      } catch (err) {
        logger.error(err.response?.data || err.message, {
          module: 'useFetch - update',
          body: {
            route,
            data,
            config
          }
        })
        swal('Erro', `${err.response?.data || err.message}`, 'error')
        return [err.response?.data, true]
      }
    },
    remove: async route => {
      try {
        const response = await api.delete(route)
        if (!response) {
          throw new Error('Erro ao deletar')
        }
        return [response.data, false]
      } catch (err) {
        logger.error(err.response?.data || err.message, {
          module: 'useFetch - remove',
          body: {
            route
          }
        })
        swal('Erro', `${err.response?.data || err.message}`, 'error')
        return [err.response?.data, true]
      }
    }
  }
}
