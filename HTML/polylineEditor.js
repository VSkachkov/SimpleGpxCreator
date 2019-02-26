ymaps.ready(init);

function init() {
	// Создаем карту.
	var myMap = new ymaps.Map("map", {
		center: [55.72, 37.64],
		zoom: 10
	}, {
			searchControlProvider: 'yandex#search'
		});


	// Обработка события, возникающего при щелчке
	// левой кнопкой мыши в любой точке карты.
	// При возникновении такого события откроем балун.
	myMap.events.add('click', function (e) {
		if (!myMap.balloon.isOpen()) {
			var coords = e.get('coords');
			myPolyline.add([55.90, 37.30]);
			myMap.balloon.open(coords, {
				contentHeader: 'Событие!',
				contentBody: '<p>Кто-то щелкнул по карте.</p>' +
					'<p>Координаты щелчка: ' + [
						coords[0].toPrecision(6),
						coords[1].toPrecision(6)
					].join(', ') + '</p>',
				contentFooter: '<sup>Щелкните еще раз</sup>'
			});
		}
		else {
			myMap.balloon.close();
		}
	});

	// Обработка события, возникающего при щелчке
	// правой кнопки мыши в любой точке карты.
	// При возникновении такого события покажем всплывающую подсказку
	// в точке щелчка.
	myMap.events.add('contextmenu', function (e) {
		myMap.hint.open(e.get('coords'), 'Кто-то щелкнул правой кнопкой');
	});

	// Скрываем хинт при открытии балуна.
	myMap.events.add('balloonopen', function (e) {
		myMap.hint.close();
	});

	// Создаем ломаную.
	var myPolyline = new ymaps.Polyline([
		// Указываем координаты вершин.
		[55.80, 37.50],
		[55.80, 37.40],
		[55.70, 37.50],
		[55.70, 37.40]
	], {}, {
			// Задаем опции геообъекта.
			// Цвет с прозрачностью.
			strokeColor: "#00000088",
			// Ширину линии.
			strokeWidth: 4,
			// Максимально допустимое количество вершин в ломаной.
			editorMaxPoints: 1000,
			// Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную.
			editorMenuManager: function (items) {
				items.push({
					title: "Удалить линию",
					onClick: function () {
						myMap.geoObjects.remove(myPolyline);
					}
				});
				return items;
			}
		});

	// Добавляем линию на карту.
	myMap.geoObjects.add(myPolyline);

	// Включаем режим редактирования.
	myPolyline.editor.startEditing();
}
