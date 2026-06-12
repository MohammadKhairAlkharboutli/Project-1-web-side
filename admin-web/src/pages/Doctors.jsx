import React from 'react'
import Button from '../components/UI/Button'
import Dropdown from '../components/UI/Dropdown'
import DropdownItem from '../components/UI/DropdownItem'

const Doctors = () => {
  return (
    <div>
      <Dropdown align='left' width='w-30' trigger={<Button >hey guys</Button>}>
        <DropdownItem onClick={()=>alert("hi")}>hi</DropdownItem>
        <DropdownItem disabled="true">hello</DropdownItem>
        <DropdownItem danger="true">how ya doing</DropdownItem>
        
      </Dropdown>
    </div>
  )
}

export default Doctors