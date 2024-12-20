import React from 'react';
import JunoDropdown from './JunoDropdown';
import { MenuProps } from 'antd';

export default {
	title: 'atoms/JunoDropdown',
	component: JunoDropdown,
};

export const JunoDropdownStory = () => {
	const items: MenuProps['items'] = [
		{ label: 'item 1', key: 'item-1' },
		{ label: 'item 2', key: 'item-2' },
	];

	return (
		<>
			<JunoDropdown menu={{ items }} data-cy="story-action">
				<a>Select</a>
			</JunoDropdown>
		</>
	);
};
