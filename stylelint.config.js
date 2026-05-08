export default {
	extends: [
		'stylelint-config-standard-scss',
		'stylelint-config-standard-vue/scss',
	],
	plugins: ['stylelint-order'],
	rules: {
		'order/properties-alphabetical-order': true,
	},
}
