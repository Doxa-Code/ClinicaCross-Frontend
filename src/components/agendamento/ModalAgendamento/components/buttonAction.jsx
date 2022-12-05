import * as Icon from 'react-icons/fa'

export default function ButtonAction({
  icon = 'FaCheck',
  title = '',
  show = false,
  theme = '',
  ...props
}) {
  return (
    <button
      {...props}
      className={`flex outline-none shadow items-center justify-center gap-4 border p-2 px-4 rounded ${theme} ${
        !show && 'hidden'
      }`}
    >
      {Icon[icon]()} {title}
    </button>
  )
}
