// // // src/components/Filters/Filters.tsx

// import React, { useState, useEffect } from 'react';
// import { DatePicker, Select, Row, Col } from 'antd';
// import { Validation } from '../../../types';
// import { getDocumentTypes } from '../../../services/documentService';
// import dayjs, { Dayjs } from 'dayjs';
// import { DocumentType } from '../../../types';
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
// import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import './Filters.less'
// import JunoButton from '../../common/JunoButton';
// import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';
// import { start } from 'repl';


// type RangeValue = [Dayjs | null, Dayjs | null] | null;

// // Add plugins to dayjs
// dayjs.extend(isSameOrBefore);
// dayjs.extend(isSameOrAfter);
// dayjs.extend(customParseFormat);

// interface FiltersProps {
//     validations: Validation[];
//     onFilter: (filteredData: Validation[]) => void;
// }

// const { RangePicker } = DatePicker;
// const { Option } = Select;

// // const Filters: React.FC<FiltersProps> = ({ validations, onFilter }) => {
// //     const [dateRange, setDateRange] = useState<RangeValue>(null);
// //     const [documentType, setDocumentType] = useState<number | null>(null);
// //     const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
// //     const [shouldApplyFilters, setShouldApplyFilters] = useState(false);


// //     useEffect(() => {
// //         fetchDocumentTypes();
// //     }, []);

// //     useEffect(() => {
// //         applyFilters();
// //     }, [dateRange, documentType]);

// //     const resetFilters = () => {
// //         setDateRange(null);
// //         setDocumentType(null);
// //         applyFilters();
// //     };

// //     const fetchDocumentTypes = async () => {
// //         const data = await getDocumentTypes();
// //         data.unshift({ id: 0, name: 'Todos' });
// //         setDocumentTypes(data);
// //     };

// //     const applyFilters = () => {
// //         let filteredData = [...validations];

// //         if (dateRange) {
// //             const [start, end] = dateRange;

// //             if (start && end) {
// //                 filteredData = filteredData.filter((v) => {
// //                     const validationTimestamp = dayjs(v.timestamp);
// //                     if (!validationTimestamp.isValid()) {
// //                         // Handle invalid dates if necessary
// //                         return false;
// //                     }
// //                     return (
// //                         start.isSameOrBefore(validationTimestamp, 'day') &&
// //                         end.isSameOrAfter(validationTimestamp, 'day')
// //                     );
// //                 });
// //             }
// //         }

// //         if (documentType) {
// //             if (documentType === 0) {
// //                 onFilter(filteredData);
// //                 return;
// //             }
// //             filteredData = filteredData.filter((v) => v.document_info.document_type=== documentType);
// //         }

// //         onFilter(filteredData);
// //     };


// //     return (
// //         <Row gutter={16} style={{ marginBottom: 24 }}>
// //             <Col xs={24} sm={9} md={9}>
// //                 <RangePicker onChange={(dates) => setDateRange(dates)} value={dateRange} />
// //             </Col>
// //             <Col xs={24} sm={9} md={9}>
// //                 <Select
// //                     placeholder="Tipo de Documento"
// //                     style={{ width: '100%' }}
// //                     value={documentType}
// //                     onChange={(key) => setDocumentType(key)}
// //                 >
// //                     {documentTypes.map((type) => (
// //                         <Option key={type.id} value={type.id}>
// //                             {type.name}
// //                         </Option>
// //                     ))}
// //                 </Select>
// //             </Col>
// //             <Col xs={24} sm={6} md={6} className='filters-buttons-container'>
// //                 <JunoButton
// //                     className='filters-reset-button'
// //                     buttonType={JunoButtonTypes.Cancel}
// //                     onClick={resetFilters}>
// //                     Reset
// //                 </JunoButton>
// //             </Col>
// //         </Row>
// //     );
// // };

// // export default Filters;


import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Row, Col } from 'antd';
import { Validation } from '../../../types';
import { getDocumentTypes } from '../../../services/documentService';
import dayjs, { Dayjs } from 'dayjs';
import { DocumentType } from '../../../types';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './Filters.less';
import JunoButton from '../../common/JunoButton';
import { JunoButtonTypes } from '../../common/JunoButton/JunoButton.types';

type RangeValue = [Dayjs | null, Dayjs | null] | null;

// Add plugins to dayjs
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

interface FiltersProps {
    validations: Validation[];
    onFilter: (filteredData: Validation[]) => void;
    showAllValidations: boolean;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

const Filters: React.FC<FiltersProps> = ({ validations, onFilter, showAllValidations }) => {
    const [dateRange, setDateRange] = useState<RangeValue>(null);
    const [documentType, setDocumentType] = useState<number | null>(null);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    

    useEffect(() => {
        fetchDocumentTypes();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [validations, dateRange, documentType]); // Dependiendo del cambio en los filtros y el switch


    const fetchDocumentTypes = async () => {
        const data = await getDocumentTypes();
        data.unshift({ id: 0, name: 'Todos' });
        setDocumentTypes(data);
    };   

    const resetFilters = () => {
        setDateRange(null);
        setDocumentType(null);
    };

    const applyFilters = () => {
        let filteredData = [...validations];

        if (dateRange) {
            const [start, end] = dateRange;
            if (start && end) {
                filteredData = filteredData.filter((v) => {
                    const validationTimestamp = dayjs(v.timestamp);
                    return (
                        validationTimestamp.isValid() &&
                        start.isSameOrBefore(validationTimestamp, 'day') &&
                        end.isSameOrAfter(validationTimestamp, 'day')
                    );
                });
            }
        }

        if (documentType && documentType !== 0) {
            filteredData = filteredData.filter(
                (v) => v.document_info.document_type === documentType
            );
        }

        onFilter(filteredData);
    };

    return (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={9} md={9}>
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates)}
                />
            </Col>
            <Col xs={24} sm={9} md={9}>
                <Select
                    placeholder="Tipo de Documento"
                    value={documentType}
                    onChange={(key) => setDocumentType(key)}
                    style={{ width: '100%' }}
                >
                    {documentTypes.map((type) => (
                        <Option key={type.id} value={type.id}>
                            {type.name}
                        </Option>
                    ))}
                </Select>
            </Col>
            <Col xs={24} sm={6} md={6}>

                <JunoButton onClick={resetFilters} type='default' buttonType={JunoButtonTypes.Cancel}>Reset</JunoButton>
            </Col>
        </Row>
    );
};

export default Filters;
