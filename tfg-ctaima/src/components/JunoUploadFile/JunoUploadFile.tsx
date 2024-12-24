// src/components/Upload/JunoUploadFile.tsx

import React, { useState } from 'react';
import { Form, Select, Checkbox, Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useTranslation } from 'react-i18next';

import './styles/JunoUplaodFile.less';
import { documentTypes, validationFields } from './constants';
import { DocumentType } from './types';

const { Dragger } = Upload;
const { Option } = Select;

const JunoUploadFile: React.FC = () => {
    const [form] = Form.useForm();
    const { t } = useTranslation();

    const [documentType, setDocumentType] = useState<DocumentType | undefined>(undefined);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isFieldSelectionDisabled, setIsFieldSelectionDisabled] = useState<boolean>(true);

    // Maneja el cambio en la selección del tipo de documento
    const handleDocumentTypeChange = (value: DocumentType) => {
        setDocumentType(value);
        setIsFieldSelectionDisabled(false);
        form.resetFields(['validationFields']);
    };

    // Maneja el cambio en los checkboxes de campos a validar
    const handleFieldsChange = (checkedValues: string[]) => {
        setSelectedFields(checkedValues);
    };

    // Configuración de las propiedades del componente Upload
    const uploadProps = {
        fileList,
        beforeUpload: (file: UploadFile) => {
            // Solo permitimos un archivo
            setFileList([file]);
            // Cancelamos la carga automática
            return false;
        },
        onRemove: () => {
            setFileList([]);
        },
        onChange: (info: { fileList: UploadFile[] }) => {
            setFileList(info.fileList.slice(-1)); // Limita a un archivo
        },
    };

    // Maneja el submit del formulario
    const handleSubmit = () => {
        form
            .validateFields()
            .then((values) => {
                // Aquí puedes manejar los datos y preparar la llamada al backend
                console.log('Valores del formulario:', values);
                console.log('Archivo seleccionado:', fileList[0]);

                // Comentario: Realizar la llamada al backend para subir el archivo
                // Aquí puedes enviar 'values' y 'fileList[0]' al backend mediante una petición POST

                message.success(t('upload.successMessage', 'Archivo enviado correctamente'));
            })
            .catch((errorInfo) => {
                console.log('Error en el formulario:', errorInfo);
            });
    };

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="form-upload-file">
            {/* Dropdown para seleccionar el tipo de documento */}
            <Form.Item
                className="form-document-type-selector"
                label={t('upload.documentTypeLabel', 'Tipo de Documento')}
                name="documentType"
                rules={[{ required: true, message: t('upload.documentTypeError', 'Por favor selecciona el tipo de documento') }]}
            >
                <Select placeholder={t('upload.documentTypePlaceholder', 'Selecciona el tipo de documento')} onChange={handleDocumentTypeChange}>
                    {documentTypes.map((doc) => (
                        <Option key={doc.value} value={doc.value}>
                            {t(`upload.documentType.${doc.value}`, doc.label)}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            {/* Checkboxes para seleccionar campos a validar */}
            <Form.Item
                className="form-validation-fields-selector"
                style={{ display: isFieldSelectionDisabled ? 'none' : 'block' }}
                label={t('upload.validationFieldsLabel', 'Campos a Validar')}
                name="validationFields"
                rules={[{ required: true, message: t('upload.validationFieldsError', 'Por favor selecciona al menos un campo') }]}
            >
                <Checkbox.Group
                    options={validationFields[documentType || 'invoice'].map((field) => ({
                        label: t(`upload.validationFields.${field.value}`, field.label),
                        value: field.value,
                    }))}
                    disabled={isFieldSelectionDisabled}
                    onChange={handleFieldsChange}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}
                />
            </Form.Item>

            {/* Componente Upload para subir el archivo */}
            <Form.Item
                className="form-file-uploader"
                label={t('upload.fileLabel', 'Archivo')}
                name="file"
                rules={[{ required: true, message: t('upload.fileError', 'Por favor sube un archivo') }]}
            >
                <Dragger {...uploadProps} maxCount={1} className="upload-dragger">
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    {fileList.length === 0 ? (
                        <p className="ant-upload-text">{t('upload.uploadPrompt', 'Haz clic o arrastra un archivo a esta área para subirlo')}</p>
                    ) : (
                        <p className="ant-upload-text">
                            {t('upload.selectedFile', 'Archivo seleccionado')}: <strong>{fileList[0].name}</strong>
                        </p>
                    )}
                </Dragger>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {t('upload.submitButton', 'Enviar')}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default JunoUploadFile;