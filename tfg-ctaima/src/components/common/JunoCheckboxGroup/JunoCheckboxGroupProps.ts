import { CheckboxGroupProps } from "antd/lib/checkbox";
import { IJunoCheckboxOptionType } from "../JunoCheckbox/JunoCheckboxProps";

export interface IJunoCheckboxGroupProps extends CheckboxGroupProps {
    dataCy?: string;
    options?: Array<IJunoCheckboxOptionType>
};