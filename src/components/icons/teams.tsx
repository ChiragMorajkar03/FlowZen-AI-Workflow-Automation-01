import React from 'react'

interface Props {
  selected: boolean
}

const Teams = ({ selected }: Props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 20H14C14 18.3431 12.6569 17 11 17H7C5.34315 17 4 18.3431 4 20M23 18V16.5C23 15.1193 21.8807 14 20.5 14H19M16 6.5C16 8.433 14.433 10 12.5 10C10.567 10 9 8.433 9 6.5C9 4.567 10.567 3 12.5 3C14.433 3 16 4.567 16 6.5ZM15.5 14C17.433 14 19 12.433 19 10.5C19 8.567 17.433 7 15.5 7C13.567 7 12 8.567 12 10.5C12 12.433 13.567 14 15.5 14ZM7.5 14C9.433 14 11 12.433 11 10.5C11 8.567 9.433 7 7.5 7C5.567 7 4 8.567 4 10.5C4 12.433 5.567 14 7.5 14Z"
        stroke={selected ? 'white' : '#71717A'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Teams
