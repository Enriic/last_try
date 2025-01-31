import { ProFormCheckboxProps } from "@ant-design/pro-form/es/components/Checkbox";
import { CheckboxProps } from "antd";
import { CheckboxOptionType } from "antd/es/checkbox";

export interface IJunoCheckboxProps extends CheckboxProps {
    dataCy?: string;
};

export interface IJunoCheckboxOptionType extends CheckboxOptionType {
    dataCy?: string;
};

