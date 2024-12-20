import { CheckboxOptionType } from 'antd';
import JunoCheckboxGroup from './JunoCheckboxGroup';
import React from 'react';
import { IJunoCheckboxOptionType } from '../JunoCheckbox/JunoCheckboxProps';

export default {
    title: 'atoms/JunoCheckboxGroup',
    component: JunoCheckboxGroup
};

export const JunoCheckboxGroupStory = () => {
    const items: IJunoCheckboxOptionType[] = [
        { label: 'Item 1', value: "", dataCy: '1' },
        { label: 'Item 2', value: "", dataCy: '2' },
    ];

    return (
        <>
            <JunoCheckboxGroup options={items} dataCy='stoty-test' />
        </>
    );
};
