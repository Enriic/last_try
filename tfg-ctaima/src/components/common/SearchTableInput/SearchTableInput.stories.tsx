// import { Card, ConfigProvider, Form, InputNumber, Typography } from 'antd';
// import React, { useState } from 'react';
// import SearchTableInput from './SearchTableInput';
// import ProTable, { ProColumns } from '@ant-design/pro-table';
// import AddNewButton from '../../atoms/AddNewButton';
// import enUS from 'antd/lib/locale-provider/en_US';
// import ExampleLayout from '../../../common/ExampleLayout';

// const { Text } = Typography;

// export default {
//   title: 'atoms/SearchTableInput',
//   component: SearchTableInput,
// };

// export const TestSelect = () => {
//   const [timeout, setTimeout] = useState<number>();
//   const [searchText, setSearchText] = useState<string>();

//   const columns: ProColumns<any>[] = [
//     {
//       title: 'Example',
//       dataIndex: 'example',
//       valueType: 'select',
//       width: '30%',
//       fieldProps: {
//         options: [{ label: 'Option 1', name: 'option1' }, { label: 'Option 2', name: 'Option2' }],
//         allowSearch: true,
//       },
//     },
//   ]

//   return (
//     <ConfigProvider locale={enUS}>
//       <ExampleLayout title="SearchTableInput">
//         <Card style={{ marginBottom: 24 }} title='Custom parameters'>
//           <Form layout='vertical'>
//             <Form.Item label='Timeout'>
//               <InputNumber<number>
//                 onChange={(value) => setTimeout(value)}
//               />
//             </Form.Item>
//           </Form>
//           <Text strong>Search text:&nbsp;</Text>
//           <Text italic={!searchText}>
//             {searchText ? searchText : 'Empty'}
//           </Text>
//         </Card>
//         <ProTable
//           dataSource={[]}
//           columns={columns}
//           toolBarRender={() => [
//             <SearchTableInput
//               timeout={timeout}
//               onSearchChange={setSearchText}
//               placeholder='Search'
//             />,
//             // <AddNewButton
//             //   navigate={() => console.log('Navigating...')}
//             //   isDisabled={false}
//             //   buttonText='Add new'
//             // />,
//           ]}
//         />
//       </ExampleLayout>
//     </ConfigProvider>
//   );
// };
