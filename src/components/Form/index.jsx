/* eslint-disable indent */
import { useState, useEffect } from 'react'
import * as Icons from 'react-icons/fa'
import FeatherIcon from 'feather-icons-react'
import SelectReact from 'react-select'

export function Header({ children, className = '', id = '' }) {
  return (
    <header id={id} className={`grid gap-4 ${className}`}>
      <h2 className="font-normal text-2xl text-gray-light">{children}</h2>
      <hr />
    </header>
  )
}

export function Item({ children, span = '', className = '' }) {
  return (
    <div className={`flex flex-col gap-2 col-span-${span} ${className}`}>
      {children}
    </div>
  )
}

export function Span({ children }) {
  return <span className="font-normal text-primary">{children}</span>
}

export function Input({
  type,
  title,
  name,
  id,
  children,
  className,
  ...props
}) {
  return (
    <div className={`float-group ${className}`}>
      <input
        {...props}
        autoComplete="off"
        placeholder={title}
        type={type}
        id={id || name}
        name={name}
        className={`${
          className || ''
        } border p-2 rounded-md outline-none text-gray-600 w-full float-input peer `}
      />
      <label htmlFor={id || name} className="float-label">
        {title}
      </label>
      {children}
    </div>
  )
}
export function Button({
  title = '',
  icon = '',
  color = '',
  backgroundColor = '',
  onClick = () => {},
  type = 'button'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex bg-${backgroundColor} justify-center items-center text-${color} gap-3 px-5 py-2 rounded-md text-sm`}
    >
      {Icons[icon]({ size: 16 })}
      {title}
    </button>
  )
}
export function SelectSearch({
  className = '',
  valueKey = 'value',
  titleKey = 'label',
  values = [],
  multiple = false,
  options = [],
  renderLabel = value => value,
  name = '',
  onChange = () => {},
  setRef = () => {},
  title = '',
  id,
  ...props
}) {
  const [optionsValue, setOptionsValue] = useState(
    options.map(option => ({
      label: renderLabel(option[titleKey]),
      value: option[valueKey],
      labelFilter: option[titleKey]
    }))
  )
  useEffect(() => {
    setOptionsValue(
      options.map(option => ({
        label: renderLabel(option[titleKey]),
        value: option[valueKey],
        labelFilter: option[titleKey]
      }))
    )
  }, [options])

  return (
    <div className={`float-group ${className}`}>
      <SelectReact
        isClearable
        placeholder="Selecione"
        isMulti={multiple}
        ref={reference => setRef(reference)}
        className={`${
          className || ''
        } border max-h-[80px] rounded-md outline-none text-gray-600 w-full float-input peer min-padding-peer`}
        loadingMessage={() => 'Buscando...'}
        noOptionsMessage={() => 'Não encontrei ninguém aqui!'}
        options={optionsValue}
        styles={{
          input: base => ({
            ...base,
            padding: '0 !important',
            height: 'auto !important'
          }),
          control: (provided, state) => ({
            ...provided,
            border: '0 !important',
            boxShadow: '0 !important',
            '&:hover': {
              border: '0 !important'
            },
            padding: '0px !important'
          }),
          menu: (provided, state) => ({
            ...provided,
            border: 'none',
            outline: 'none',
            padding: '0px !important',
            marginLeft: '0px !important'
          }),
          option: (provided, state) => ({
            ...provided,
            border: 'none',
            outline: 'none'
          })
        }}
        onChange={(e, action) => {
          onChange(
            multiple
              ? e.reduce((acc, item) => [...acc, item.value], [])
              : e?.value || '',
            action
          )
        }}
        {...props}
        onInputChange={value => {
          if (!value) {
            return setOptionsValue(
              options.map(option => ({
                label: renderLabel(option[titleKey]),
                value: option[valueKey],
                labelFilter: option[titleKey]
              }))
            )
          }
          setOptionsValue(
            optionsValue.filter(op =>
              op.labelFilter?.match(new RegExp(value, 'gim'))
            )
          )
        }}
        filterOption={() => true}
        name={name}
      />
      <label htmlFor={id || name} className="float-label !-z-0">
        {title}
      </label>
    </div>
  )
}
export function Select({ children, title, id, name, ...props }) {
  return (
    <div className={`float-group ${props.className}`}>
      <select
        {...props}
        ref={props.ref}
        name={name}
        id={id || name}
        value={props.value}
        className="border-2 p-3 float-input peer bg-white rounded-md outline-none text-gray-dark"
      >
        <option selected value="">
          Selecione
        </option>
        {children}
      </select>
      <label htmlFor={id || name} className="float-label">
        {title}
      </label>
    </div>
  )
}

export function Option({ value = '', title = '' }) {
  return <option value={value}>{title}</option>
}

export function CheckBoxList({
  list = [],
  onSelected = () => {},
  grid = 2,
  preSelect,
  unique = false,
  gap = 4,
  className = '',
  classNameCards = '',
  keySelect = false,
  readOnly = false
}) {
  const [listSelected, setListSelected] = useState(
    preSelect ? (typeof preSelect === 'object' ? preSelect : [preSelect]) : []
  )
  const classNameInjection = `grid-cols-${grid} gap-${gap} ${className}`

  useEffect(() => {
    onSelected(unique ? listSelected[0] : listSelected)
  }, [listSelected])
  return (
    <div className={`flex xl:grid  w-full overflow-auto ${classNameInjection}`}>
      {list.map((item, index) => {
        const key = keySelect ? item[keySelect] : index
        const includes = listSelected.includes(key)
        const bg = includes
          ? item.bg || 'bg-primary'
          : item.inactive
          ? item.inactive.bg
          : 'bg-white'
        const text = includes
          ? item.color || 'text-white'
          : item.inactive
          ? item.inactive.color
          : 'text-primary'
        return (
          <div
            onClick={() => {
              if (readOnly) return
              if (unique) {
                return setListSelected([key])
              }
              if (includes) {
                return setListSelected(
                  listSelected.filter(item => item !== key)
                )
              }
              setListSelected([...listSelected, key])
            }}
            key={index}
            className={`flex cursor-pointer py-4 justify-center ${
              item.without
                ? !item.without.includes('border') && 'border'
                : 'border'
            } items-center ${bg} ${text} p-5 ${
              item.without
                ? !item.without.includes('rounded') && 'rounded-md'
                : 'rounded-md'
            } ${classNameCards}`}
          >
            <span className="text-sm whitespace-nowrap w-52 flex flex-col justify-center items-center gap-3">
              {typeof item === 'object' ? (
                <>
                  {typeof item.icon === 'function' ? (
                    item.icon()
                  ) : (
                    <FeatherIcon icon={item.icon} />
                  )}
                  {item.title}
                </>
              ) : (
                item
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
export function InputFormat({
  pattern = '',
  regex = /[^0-9]/gim,
  onChange = () => {},
  value,
  className,
  title,
  id,
  name,
  defaultValue,
  ...props
}) {
  const [inputValue, setInputValue] = useState(defaultValue)

  useEffect(() => {
    onChange(inputValue)
  }, [inputValue])

  useEffect(() => {
    setInputValue(value || defaultValue || '')
  }, [value, defaultValue])

  function mask(value) {
    if (!pattern || value === '' || inputValue.length > value.length) {
      return value
    }
    let i = 0
    const v = value.toString().replace(regex, '')
    return pattern.replace(/#/g, () => v[i++] || '')
  }

  return (
    <div className={`float-group ${className}`}>
      <input
        {...props}
        name={id || name}
        placeholder={title}
        value={inputValue}
        onChange={({ target }) => setInputValue(mask(target.value))}
        className="border p-2 rounded-md outline-none peer float-input text-gray-600 w-full"
      />
      <label htmlFor={id || name} className="float-label">
        {title}
      </label>
    </div>
  )
}

export function ToggleButton({
  onSelected = () => {},
  defaultValue = false,
  ...props
}) {
  return (
    <div>
      <input
        onChange={e => onSelected(e.target.checked)}
        type="checkbox"
        id={props.name}
        checked={defaultValue}
        className="switch-input"
        {...props}
      />
      <label htmlFor={props.name} className="switch"></label>
    </div>
  )
}

export function ToggleButtonController({
  onSelected = () => {},
  defaultValue = false,
  ...props
}) {
  return (
    <div>
      <input
        onChange={e => onSelected(e.target.checked)}
        type="checkbox"
        id="switch"
        defaultValue={defaultValue}
        className="switch-input"
        {...props}
      />
      <label htmlFor="switch" className="switch"></label>
    </div>
  )
}
