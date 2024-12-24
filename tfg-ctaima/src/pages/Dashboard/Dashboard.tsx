import React from 'react'
import { Input } from 'antd'
import JunoButton from '../../components/common/JunoButton/index'
import { JunoButtonTypes } from '../../components/common/JunoButton/JunoButton.types'
import { PageContainer } from '@ant-design/pro-layout'

function Dashboard() {
  return (
    <PageContainer>
      <div>
        <Input placeholder="Nombre" style={{ width: '160px', margin: '20px', height: '30px' }} />
        <JunoButton buttonType={JunoButtonTypes.Ok} type='primary' >Botón</JunoButton>
      </div>
    </PageContainer>


  )
}

export default Dashboard