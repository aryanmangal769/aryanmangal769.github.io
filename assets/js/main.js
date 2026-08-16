$(document).ready(function(){
	// Options menu is hidden by default
	$('#theme').hide();
	$('#lan').hide();

	// Show all single-page sections
	$('#aboutmeContent').show().addClass('active');

	applyCollapseState();
	bindSeeMoreButtons();
	sizeExpScroll();
	initSmoothNav();
	initScrollSpy();
	$(window).on('resize.expscroll', sizeExpScroll);
	$('#industry-list img, #research-list img, #projects-list img, #projects-list video, #research-list video').on('load loadedmetadata', sizeExpScroll);

	// Default to light theme (Ishita-style); ignore OS dark preference
	localStorage.theme = "light";

	$("link[href='assets/css/dark.css']").remove();
	if ($("link[href='assets/css/light.css']").length === 0) {
		$('<link>').appendTo('head').attr({
			type: 'text/css',
			rel: 'stylesheet',
			href: 'assets/css/light.css'
		});
	}
	$('#theme').empty().append("<i class='fa-duotone fa-lightbulb'></i>");

	$('#options-toggler').click(function(e) {
		if(!$(e.currentTarget).hasClass('active')) {
			$(e.currentTarget).addClass('active');
			$('#theme').show("fast");
			$('#lan').show("fast");
		}
		else {
			$(e.currentTarget).removeClass('active');
			$('#theme').hide("fast");
			$('#lan').hide("fast");
		}
	});

	$('#theme').click(function() {
		if(localStorage.theme != "dark"){
			$('#theme').empty().append("<i class='fa-duotone fa-lightbulb-slash'></i>");
			localStorage.theme = "dark";
			$("link[href='assets/css/light.css']").remove();
			$('<link>').appendTo('head').attr({
				type: 'text/css',
				rel: 'stylesheet',
				href: 'assets/css/dark.css'
			});
		}
		else {
			$('#theme').empty().append("<i class='fa-duotone fa-lightbulb'></i>");
			localStorage.theme = "light";
			$("link[href='assets/css/dark.css']").remove();
			$('<link>').appendTo('head').attr({
				type: 'text/css',
				rel: 'stylesheet',
				href: 'assets/css/light.css'
			});
		}
	});

	window.onLanguageReady = function() {
		applyCollapseState();
		sizeExpScroll();
	};

	const langManager = new LanguageManager();
	$('#lan').click(function() {
		const newLang = langManager.getNextLanguage();
		langManager.setLanguage(newLang);
		applyCollapseState();
	});

	// Safety: language JSON loads async
	setTimeout(function() {
		applyCollapseState();
		sizeExpScroll();
	}, 250);

	$(document).on("click", "#citation", function(){
		var text = $(this).parent().parent().next()[0].innerHTML;
		navigator.clipboard.writeText(text);
		toastr.success('Citation copied');
	});
});

function sizeExpScroll() {
	$('.exp-scroll').each(function() {
		const el = this;
		const visible = parseInt(el.getAttribute('data-visible'), 10) || 2;
		const items = el.querySelectorAll(':scope > .exp-entry, :scope > .research-entry, :scope > .pub-item');

		el.style.maxHeight = '';
		if (items.length <= visible) {
			return;
		}

		const first = items[0];
		const lastShown = items[visible - 1];
		const styles = window.getComputedStyle(el);
		const pad = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
		const height = lastShown.offsetTop + lastShown.offsetHeight - first.offsetTop;
		// Peek the next role so it's obvious the list scrolls
		el.style.maxHeight = Math.ceil(height + pad + 28) + 'px';
	});
}

function applyCollapseState() {
	$('.collapse-list').each(function() {
		const $list = $(this);
		const limit = parseInt($list.attr('data-limit'), 10) || 3;
		const expanded = $list.hasClass('is-expanded');
		const $items = $list.children('.collapse-item');
		const extra = Math.max(0, $items.length - limit);

		$items.each(function(i) {
			if (expanded || i < limit) {
				$(this).removeClass('is-hidden');
			} else {
				$(this).addClass('is-hidden');
			}
		});

		const $btn = $('.see-more-btn[data-target="#' + $list.attr('id') + '"]');
		if (extra > 0) {
			$btn.prop('hidden', false);
			if (expanded) {
				$btn.addClass('is-open');
				$btn.find('.see-more-label').text('See less');
				$btn.find('.see-more-count').text('');
			} else {
				$btn.removeClass('is-open');
				$btn.find('.see-more-label').text('See more');
				$btn.find('.see-more-count').text('+' + extra);
			}
		} else {
			$btn.prop('hidden', true);
		}
	});
}

function bindSeeMoreButtons() {
	$(document).off('click.seemore', '.see-more-btn').on('click.seemore', '.see-more-btn', function() {
		const $btn = $(this);
		const $list = $($btn.data('target'));
		const limit = parseInt($list.attr('data-limit'), 10) || 3;
		const $items = $list.children('.collapse-item');
		const extra = Math.max(0, $items.length - limit);
		const expanding = !$list.hasClass('is-expanded');

		$list.toggleClass('is-expanded', expanding);
		$btn.toggleClass('is-open', expanding);

		if (expanding) {
			$items.removeClass('is-hidden');
			$btn.find('.see-more-label').text('See less');
			$btn.find('.see-more-count').text('');
		} else {
			$items.each(function(i) {
				$(this).toggleClass('is-hidden', i >= limit);
			});
			$btn.find('.see-more-label').text('See more');
			$btn.find('.see-more-count').text('+' + extra);
			$('html, body').animate({
				scrollTop: Math.max(0, $list.offset().top - 90)
			}, 280);
		}
	});
}

function initSmoothNav() {
	$('#navbarList .nav-link').on('click', function(e) {
		const href = $(this).attr('href');
		if (!href || href.charAt(0) !== '#') return;
		const $target = $(href);
		if (!$target.length) return;
		e.preventDefault();
		const top = $target.offset().top - 72;
		$('html, body').animate({ scrollTop: top }, 380);
		history.replaceState(null, '', href);
		$('#navbarList .nav-link').removeClass('active');
		$(this).addClass('active');
	});
}

function initScrollSpy() {
	const sections = ['#about', '#news', '#experience', '#projects', '#publications'];
	const onScroll = function() {
		const y = $(window).scrollTop() + 100;
		let current = '#about';
		sections.forEach(function(id) {
			const $el = $(id);
			if ($el.length && $el.offset().top <= y) current = id;
		});
		$('#navbarList .nav-link').each(function() {
			$(this).toggleClass('active', $(this).attr('href') === current);
		});
	};
	$(window).on('scroll', onScroll);
	onScroll();
}

// Expose for debugging / language callback
window.applyCollapseState = applyCollapseState;
window.bindSeeMoreButtons = bindSeeMoreButtons;
