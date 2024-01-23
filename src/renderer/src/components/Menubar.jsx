/* eslint-disable no-unused-vars */
import React from 'react'
import icon from '../../../../icon.ico'

export default function Menubar() {
  return (
    <div
      className="fixed top-0 left-0 w-full h-7 bg-slate-900 text-white cursor-move select-none z-50 *:m-0 *:p-0"
      style={{ 'webkit-app-region': 'drag' }}
    >
      <ul className="float-left">
        <img src={icon} className="pl-4 h-7 w-auto" />
      </ul>
      <ul className="float-right *:inline-block *:h-7 *:hover:cursor-pointer *:hover:transition-all *:ease-in *:duration-300">
        <li className="hover:bg-slate-800">
          <i className="material-icons">minimize</i>
        </li>
        <li className="hover:bg-red-600">
          <i className="material-icons">close</i>
        </li>
      </ul>
    </div>
  )
}
