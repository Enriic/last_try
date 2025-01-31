import { PageContainer } from '@ant-design/pro-layout'
import LoginComponent from '../../components/Login/Login'
import './LoginPage.less'

function LoginPage() {
    return (
        <PageContainer className='page-container-login'>
            <LoginComponent />
        </PageContainer>
    )
}

export default LoginPage