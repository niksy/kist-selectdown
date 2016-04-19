# kist-selectdown

Select with customizable menu.

## Installation

```sh
npm install kist-selectdown --save

bower install kist-selectdown --save
```

## API

### `$Element.selectdown(options)`

Returns: `jQuery`

#### options

Type: `Object|String`

##### Options defined as `Object`

###### classes

Type: `Object`  

Classes for elements.

Default value:

```js
{
	wrapper: 'kist-Selectdown',
	originalSelect: 'kist-Selectdown-originalSelect',
	select: 'kist-Selectdown-select',
	optionList: 'kist-Selectdown-optionList',
	optionItem: 'kist-Selectdown-optionItem',
	option: 'kist-Selectdown-option',
	isActive: 'is-active',
	isHidden: 'is-hidden',
	isFocused: 'is-focused'
}
```

###### templates

Type: `Object`

Template generating functions for custom markup.

Available values are:

| Name | Arguments | Description |
| --- | --- | --- |
| `select` | `data` | Template for select element. |
| `option` | `data` | Template for option element. |

###### create

Type: `Function`  
Arguments: [Select element, Custom select element]  
Event: `selectdowncreate`

Callback to run on select menu creation (when DOM elements are ready).

###### open

Type: `Function`  
Arguments: [Select element, Custom select element]  
Event: `selectdownopen`

Callback to run when select menu is opened.

###### close

Type: `Function`  
Arguments: [Select element, Custom select element]  
Event: `selectdownclose`

Callback to run when select menu is closed.

###### select

Type: `Function`  
Arguments: [Current replaced item, Current item value, Original option item]  
Event: `selectdownselect`

Callback to run on option select.

##### Options defined as `String`

Type: `String`

###### destroy

Destroy plugin instance.

###### refresh

Refresh select menu (e.g. when changing content with `html`, `append`, …)

## Examples

Default structure for select menu.

```html
<select>
	<option value="1">Option 1</option>
	<option value="2">Option 2</option>
	<option value="3">Option 3</option>
</select>
```

Standard set of options.

```js
$('select').selectdown();
```

Basic template support.

```js
$('select').selectdown({
	templates: {
		item: function ( data ) {
			return '<strong><i>Item:</i> <u>' + data.value + '</u></strong>';
		}
	}
});
```

Callback on item select.

```js
$('select').selectdown({
	select: function ( item, data ) {
		$(this).addClass('inputClass')
		item.addClass('itemClass');
		console.log(data);
	}
});
```

Refresh plugin instance.

```js
$('select').html('<option value="42">Option 42</option>').selectdown('refresh');
```

Destroy plugin instance.

```js
$('select').selectdown('destroy');
```

## Testing

Currently, only manual tests are available.

Run `npm test -- --watch` and open <http://0.0.0.0:8000/compiled/test/manual/> in your browser.

## Browser support

Tested in IE8+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)
