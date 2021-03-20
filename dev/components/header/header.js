import AOS from 'aos';
import SmoothScroll from 'smooth-scroll';

AOS.init();
let scroll = new SmoothScroll('a[href*="#"]');

document.addEventListener('DOMContentLoaded', function () {
	let headerElement = document.querySelector('.header');
	let aboutSection = document.querySelector('section.about');
	let burgerElement = document.querySelector('.js-burger');
	let wrapper = document.querySelector('.header__container');
	let body = document.querySelector('body');
	let links = document.querySelectorAll('.js-header-link a');

	if (!!headerElement) {
		window.addEventListener('scroll', function () {
			if (!!aboutSection && window.pageYOffset > aboutSection.offsetTop - 100 && window.innerWidth >= 1240) {
				headerElement.classList.add('sticky-header');
			} else {
				headerElement.classList.remove('sticky-header');
			}
		})
	}

	if (!!burgerElement) {
		burgerElement.addEventListener('click', function () {
			burgerElement.classList.toggle('is-active');
			wrapper.classList.toggle('menu-opened');
			body.classList.toggle('overflowed');
		});
	}

	if (window.innerWidth < 768) {
		links.forEach(el => {
			el.addEventListener('click', function () {
				burgerElement.classList.toggle('is-active');
				wrapper.classList.toggle('menu-opened');
				body.classList.toggle('overflowed');
			});
		});
	}
});
