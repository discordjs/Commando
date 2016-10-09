module.exports = {
	disambiguation: function disambiguation(items, label, property = 'name') {
		const itemList = items.map(item => `"${this.nbsp(property ? item[property] : item)}"`).join(',   ');
		return `Multiple ${label} found, please be more specific: ${itemList}`;
	}
};
