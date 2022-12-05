import { serialize } from 'form-serialization'
import swal from '@sweetalert/with-react'
import Cookies from 'next-cookies'
import { format, isValid, parseISO } from 'date-fns'

export function getFieldsValue(e, getEmpty = true) {
  try {
    const body = serialize(e.target, { hash: true, empty: getEmpty })
    return body
  } catch (err) {
    swal('Espere!', `${err.message}`, 'error')
    return {}
  }
}

export function formatPacienteSearch(paciente) {
  return [
    paciente?.nome,
    paciente?.whatsapp,
    isValid(parseISO(paciente?.dataNascimento))
      ? format(parseISO(paciente.dataNascimento), 'dd/MM/yyyy')
      : paciente?.dataNascimento
  ]
    .filter(paciente => paciente)
    .join(' - ')
}

export const setFieldsValue = (object, parent = false) => {
  return Object.keys(object).map(item => {
    if (typeof object[item] === 'object' && object[item]) {
      setFieldsValue(object[item], parent ? `${parent}[${item}]` : item)
    }
    const name = parent ? `*[name="${parent}[${item}]"]` : `*[name="${item}"]`
    const field = document.querySelector(name)
    if (!field) return
    if (field) {
      field.value = object[item]
      field.defaultChecked = object[item]
    }
  })
}

export const getCookie = (ctx, key) => {
  const cookies = Cookies(ctx)
  if (!cookies) return false
  if (!key) return cookies
  const cookie = cookies[key]
  return cookie
}

export const returnPage = (ctx, route = '/') => {
  ctx.res.statusCode = 302
  ctx.res.setHeader('Location', route)
  return {
    props: {}
  }
}

export const formatMoney = (value = '0') => {
  if (isNaN(parseFloat(value))) {
    return 'R$ 0,00'
  }

  return parseFloat(value).toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL'
  })
}
export function debounceEvent(fn, wait = 500, time) {
  return function (e) {
    if (e?.persist) e.persist()

    clearTimeout(time)
    time = setTimeout(() => {
      return fn.apply(fn, arguments)
    }, wait)
  }
}

export function StringInject(str, variables = [], values = {}) {
  return variables?.reduce((acc, variable) => {
    return acc.replace(
      new RegExp(variable.name, 'gim'),
      variable.value(values) || ''
    )
  }, str)
}
