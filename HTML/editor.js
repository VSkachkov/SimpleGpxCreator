window.onload = () => new GpxEditor();

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.hypot(dx, dy);
    }
}

class Track {
    constructor(array) {
        this.track = array;
        this.trackLength = 0;
    }
    addPoint(point) {
        this.track.push(point);
    }
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
        var earthRadiusKm = 6371;

        var dLat = this.degreesToRadians(lat2 - lat1);
        var dLon = this.degreesToRadians(lon2 - lon1);

        lat1 = this.degreesToRadians(lat1);
        lat2 = this.degreesToRadians(lat2);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    calculateTrackLength() {
        if (this.track.length > 1) {
            let myTrack = this.track;
            for (var i = 0; i < myTrack.length - 1; i++) {
                let point1 = myTrack[0];
                let point2 = myTrack[1];
                let distance = this.distanceInKmBetweenEarthCoordinates(point1[0], point1[1], point2[0], point2[1]);
                this.trackLength += distance;
            }

            return this.trackLength;
        }
        else {
            return 0;
        }
    }

}

class GpxEditor {
    constructor() {
        //<h2>Create or edit your own GPS track and find yourself in the world easily!</h2>
        // Как только будет загружен API и готов DOM, выполняем инициализацию
        ymaps.ready(function () {
            // Создание экземпляра карты и его привязка к контейнеру с
            // заданным id ("map")
            var myMap = new ymaps.Map('map', {
                // При инициализации карты, обязательно нужно указать
                // ее центр и коэффициент масштабирования
                center: [59.960073, 30.3008007], // Петербург
                zoom: 14
            });

            // Обработка события, возникающего при щелчке
            // левой кнопкой мыши в любой точке карты.
            // При возникновении такого события откроем балун.
            document.getElementById("map").addEventListener("click", function (e) {
                //myMap.events.add('click', function (e) {
                console.log("Click happened");
                console.log(polyline);
                console.log("Coordinates");
                if (polyline.geometry.getCoordinates().length > 1) {
                    let temporaryTrack = new Track(polyline.geometry.getCoordinates());
                    let currentTrackLength = temporaryTrack.calculateTrackLength();
                    document.getElementById("routeLength").innerHTML = "Current length of the route:" + currentTrackLength.toPrecision(2).toString();
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

            var polyline = new ymaps.Polyline([], {}, {
                strokeColor: '#ff0000',
                strokeWidth: 5 // ширина линии
            });

            myMap.geoObjects.add(polyline);
            polyline.editor.startEditing();
            polyline.editor.startDrawing();

            document.getElementById("stopEditPolyline").addEventListener("click", function () {
                // Отключаем кнопки, чтобы на карту нельзя было
                // добавить более одного редактируемого объекта (чтобы в них не запутаться).
                document.getElementById("stopEditPolyline").setAttribute('disabled', true);
                polyline.editor.stopEditing();
                var myTrack = new Track(polyline.geometry.getCoordinates());
                var gpxDom = new GpxDom(myTrack);
                var dom = gpxDom.getDom();
                GpxEditor.printGeometry(polyline.geometry.getCoordinates());
                var text = polyline.geometry.getCoordinates();
                var filename = "Track";
                var blob = new Blob([dom.documentElement.innerHTML], { type: "text/plain;charset=utf-8" });
                saveAs(blob, filename + ".gpx");
            });
        });
        document.body.innerHTML = (' <h2 id="idChild">Create or edit your own GPS track and find yourself in the world easily!</h2>');
        document.getElementById('idChild').insertAdjacentHTML('beforeend', '<p>Hello here will be opening the file!</p>');
        document.getElementById('idChild').insertAdjacentHTML('beforeend', '<input type="file" id="file-input" />');
        document.getElementById('idChild').insertAdjacentHTML('beforeend', '<h3>Contents of the file:</h3>');
        document.getElementById('idChild').insertAdjacentHTML('beforeend', '<pre id="file-content"></pre>');
        document.getElementById('idChild').insertAdjacentHTML('beforeend', '<div id="map" style="width:800px; height:600px"></div>');
        document.getElementById('idChild').insertAdjacentHTML('beforeend', '<p id="routeLength">0</p>');
        document.getElementById('idChild').insertAdjacentHTML('beforeend', '<input type="button" value="Завершить редактирование" id="stopEditPolyline" />');
        document.getElementById('idChild').insertAdjacentHTML('beforeend', '<div id="geometry" />');

    }

    // Выводит массив координат геообъекта в <div id="geometry">
    static printGeometry(coords) {
        document.getElementById("geometry").insertAdjacentHTML('beforeend', '<p>' + this.stringify(coords) + '</p>');
        //$('#geometry').html('Координаты: ' + stringify(coords));


    }

    static stringify(coords) {
    var res = '';
    if (Array.isArray(coords)) {
        res = '[ ';
        for (var i = 0, l = coords.length; i < l; i++) {
            if (i > 0) {
                res += ', ';
            }
            res += GpxEditor.stringify(coords[i]);
        }
        res += ' ]';
    } else if (typeof coords == 'number') {
        res = coords.toPrecision(6);
    } else if (coords.toString) {
        res = coords.toString();
    }

    return res;
}
}


class GpxDom {
    constructor(track) {
        this.defaultXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + "<gpx\n"
            + "xmlns=\"http://www.topografix.com/GPX/1/1\"\n" + "version=\"1.1\"\n" + "creator=\"Wikipedia\"\n"
            + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n"
            + "xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\">\n"
            + "  <time>2011-09-22T18:56:51Z</time>\n" + "  <metadata>\n" + "    <name>Name</name>\n"
            + "    <desc>Description</desc>\n" + "    <author>\n" + "     <name>Autor</name>\n" + "    </author>\n"
            + "  </metadata>\n" + "  <trk>\n" + "    <name>exercise</name>\n" + "    <trkseg>\n"
            + "      <trkpt lat=\"59.934721667\" lon=\"30.310183333\">\n"
            + "        <time>2011-09-22T18:56:51Z</time>\n" + "        <fix>2d</fix>\n" + "        <sat>5</sat>\n"
            + "      </trkpt>\n" + "    </trkseg>\n" + "  </trk>\n" + "</gpx>";
        this.track = track;
        var parser4 = new DOMParser();
        this.xmlDoc4 = parser4.parseFromString(this.defaultXml, "text/xml");
        if (track.length != 0) {
            let x = this.xmlDoc4.getElementsByTagName("trkpt");
            let initialNode = this.xmlDoc4.getElementsByTagName("trkpt")[0];
            let firstPoint = track.track[0];
            let latitude = firstPoint[0];
            let longitude = firstPoint[1];

            initialNode.setAttribute("lat", latitude.toString());
            initialNode.setAttribute("lon", longitude.toString());
            for (var i = 1; i < track.track.length; i++) {
                let sampleNode = initialNode.cloneNode(true);
                let point = track.track[i];
                let latitude = point[0];
                let longitude = point[1];
                sampleNode.setAttribute("lat", latitude.toString());
                sampleNode.setAttribute("lon", longitude.toString());
                this.xmlDoc4.getElementsByTagName("trkseg")[0].appendChild(sampleNode);
            }

        }
    }

    getDom() {
        return this.xmlDoc4;
    }
}
