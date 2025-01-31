import React from 'react'
import JunoCheckbox from './JunoCheckbox'

export default {
    title: 'atoms/JunoCheckbox',
    component: JunoCheckbox,
}

export const JunoCheckboxStory = () => {
    return (
        <>
            <JunoCheckbox dataCy='story'>
                Demo
            </JunoCheckbox>
        </>
    )
}
