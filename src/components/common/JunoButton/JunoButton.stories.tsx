import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import JunoButton from './JunoButton';
import { JunoButtonProps, JunoButtonTypes } from './JunoButton.types'

export default {
    title: "atoms/JunoButton",
}

export const JunoBtn = () => {
    const junoBtnProps: JunoButtonProps = {
        buttonType: JunoButtonTypes.Ok,
    };

    return (
        <>
            <JunoButton {...junoBtnProps}>Test</JunoButton>
        </>
    )
}
