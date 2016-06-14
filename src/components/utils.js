/**
 * Check if an element has a CSS class
 *
 * @param {Element} element Element to check
 * @param {String} classToCheck Classname to check
 * @function hasElClass
 */
export function hasElClass(element, classToCheck)
{
	return ((' ' + element.className + ' ').indexOf(' ' + classToCheck + ' ') !== -1);
}

/**
 * Creates an element and applies properties.
 *
 * Copied from video.js utils/dom.js, as it is not exposed there
 *
 * @param  {String=} tagName    Name of tag to be created.
 * @param  {Object=} properties Element properties to be applied.
 * @return {Element}
 * @function createEl
 */
export function createEl(tagName='div', properties={})
{
	let el = document.createElement(tagName);

	Object.getOwnPropertyNames(properties).forEach(function (propName)
	{
		let val = properties[propName];

		// Not remembering why we were checking for dash
		// but using setAttribute means you have to use getAttribute

		// The check for dash checks for the aria- * attributes, like aria-label, aria-valuemin.
		// The additional check for "role" is because the default method for adding attributes does not
		// add the attribute "role". My guess is because it's not a valid attribute in some namespaces, although
		// browsers handle the attribute just fine. The W3C allows for aria- * attributes to be used in pre-HTML5 docs.
		// http://www.w3.org/TR/wai-aria-primer/#ariahtml. Using setAttribute gets around this problem.
		if (propName.indexOf('aria-') !== -1 || propName === 'role')
		{
			el.setAttribute(propName, val);
		}
		else
		{
			el[propName] = val;
		}
	});

	return el;
}

/**
 * Add a CSS class name to an element
 *
 * @param {Element} element    Element to add class name to
 * @param {String} classToAdd Classname to add
 * @function addElClass
 */
export function addElClass(element, classToAdd)
{
	if (!hasElClass(element, classToAdd))
	{
		element.className = element.className === '' ? classToAdd : element.className + ' ' + classToAdd;
	}
}

/**
 * Remove a CSS class name from an element
 *
 * @param {Element} element    Element to remove from class name
 * @param {String} classToRemove Classname to remove
 * @function removeElClass
 */
export function removeElClass(element, classToRemove)
{
	if (!hasElClass(element, classToRemove))
	{
		return;
	}

	let classNames = element.className.split(' ');

	// no arr.indexOf in ie8, and we don't want to add a big shim
	for (let i = classNames.length - 1; i >= 0; i--)
	{
		if (classNames[i] === classToRemove)
		{
			classNames.splice(i, 1);
		}
	}

	element.className = classNames.join(' ');
}
