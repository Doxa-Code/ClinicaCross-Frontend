import { debounceEvent } from '../utils'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const AsyncSelect = dynamic(() => import('react-select/async'), {
  ssr: false
})

export default function SelectSearch({
  name = '',
  placeholder = '',
  onChange = () => {},
  defaultValue = null,
  handleSearch = () => {},
  ref,
  valueRefresh,
  ...props
}) {
  const [value, setValue] = useState(null)

  useEffect(() => {
    setValue(defaultValue)
  }, [valueRefresh])

  return (
    <AsyncSelect
      {...props}
      isLoading={false}
      autoFocus
      isClearable
      onChange={changed => {
        setValue(changed)
        onChange(changed)
      }}
      value={value}
      name={name}
      placeholder={placeholder}
      loadOptions={
        props.loadOptions ||
        debounceEvent(async (inputValue, callback) => {
          const results = await handleSearch(inputValue)
          callback(results)
        }, 10)
      }
      noOptionsMessage={() => 'Nenhum registro encontrado'}
    />
  )
}
