'use strict';

const loadMap = (file, labels) => {
  const wrapDiv = document.querySelector('.map');
  const selectCountryDesc = document.querySelector('#select-country-desc');

  const params = new URLSearchParams(window.location.search);
  window.lang = params.get('lang') || 'pl';
  window.translations = {};

  fetch('langs.json')
    .then((res) => res.json())
    .then((tr) => {
      translations = tr;

      selectCountryDesc.innerText = _(selectCountryDesc.innerText);

      fetch(file)
        .then((r) => r.text())
        .then((text) => {
          wrapDiv.innerHTML =
            text +
            '\n<div id="mobile-map-display"><svg height="75%" width="75%" viewBox="0 0 500 500"></svg><p id="mobile-map-selector-label"></p></div>';
          initMap(labels);
          chechMobile();
        })
        .catch(console.error.bind(console));
    })
    .catch(console.error.bind(console));
};

const initMap = (labels) => {
  const map = document.querySelector('#myroof-world-map');
  const label = document.querySelector('#map-hover');
  const countryLabel = label.querySelector('.map-country-name');
  const infoLabel = label.querySelector('.map-country-info');
  const paths = map.querySelectorAll('path');
  const countrySelector = document.querySelector('#select-country');
  const countrySelectorList = countrySelector.querySelector('ul');
  const mapSelectorLabel = document.querySelector('#mobile-map-selector-label');
  const mapDisplayWrapper = document.querySelector('#mobile-map-display');
  const mapDisplay = mapDisplayWrapper.querySelector('#mobile-map-display svg');

  const dimFill = 'rgba(183, 184, 187, 0.4)';
  const fullFill = 'rgba(183, 184, 187, 1)';

  const mapBorder = 20;

  map.addEventListener('mousemove', (e) => {
    let x = clamp(e.pageX, 0, window.innerWidth - label.offsetWidth - 30);
    let y = clamp(e.pageY, 0, window.innerHeight - label.offsetHeight - 30);

    label.style.transform = `translate(${x}px, ${y}px)`;
  });

  paths.forEach((path) => {
    path.addEventListener('mouseenter', () => {
      let showLabel = false;

      labels.forEach((label) => {
        if (label.countries.includes(path.id)) {
          paths.forEach((path) => {
            path.style.fill = dimFill;
          });
          showLabel = true;
          const bbox = path.getBBox();
          const mapBbox = map.getBBox();
          const scale = 1.0 + Math.round(mapBbox.width / bbox.width) / 100;

          path.style.fill = label.fill;
          path.style.stroke = label.stroke;
          path.style.transform = `scale(${scale})`;
          infoLabel.innerHTML = _(label.message);
          map.appendChild(path);
        }
      });

      if (showLabel) {
        label.style.display = 'block';
        countryLabel.innerHTML = _(path.getAttribute('title'));
      }
    });

    path.addEventListener('mouseleave', (e) => {
      paths.forEach((path) => {
        path.style.fill = fullFill;
      });
      path.style.stroke = ' #fff';
      path.style.transform = 'scale(1)';

      label.style.display = 'none';
    });
  });

  labels.forEach((label) => {
    label.countries.forEach((country) => {
      const c = map.querySelector(`path#${country}`);
      const countryName = c.getAttribute('title');
      countrySelectorList.innerHTML += `\n<li data-country-code="${country}" data-country-message="${_(
        label.message
      )}" data-stroke="${label.stroke}" data-fill="${label.fill}">${_(countryName)}</li>`;
    });
  });

  countrySelectorList.innerHTML += '\n<li>&nbsp</li>';

  const countrySelectorElements = countrySelectorList.querySelectorAll('li');

  const countrySelectroChange = debounce(() => {
    let index = countrySelector.scrollTop / 50;

    if (isInt(index)) {
      if (index === 0) {
        mapSelectorLabel.innerHTML = '';
        mapDisplay.innerHTML = '';
        paths.forEach((path) => {
          path.style.fill = fullFill;
        });
      } else {
        mapDisplay.innerHTML = '';
        let country = countrySelectorElements.item(index + 1);
        let countryMap = map
          .querySelector(`#${country.getAttribute('data-country-code')}`)
          .cloneNode(true);

        mapSelectorLabel.innerHTML = country.getAttribute('data-country-message');
        mapSelectorLabel.style.color = country.getAttribute('data-fill');

        countryMap.style.fill = country.getAttribute('data-fill');
        countryMap.style.stroke = country.getAttribute('data-stroke');
        mapDisplay.appendChild(countryMap);
        let bbox = countryMap.getBBox();
        let boundingClientRectMap = mapDisplay.getBoundingClientRect();

        let viewWidth = bbox.width + mapBorder;
        let viewHeight = bbox.height + mapBorder;

        let transX = (viewWidth - bbox.width) / 2 - bbox.x;
        let transY = (viewHeight - bbox.height) / 2 - bbox.y;

        let ratioWidth = boundingClientRectMap.width / bbox.width;
        let ratioHeight = boundingClientRectMap.height / bbox.height;

        let strokeRatio = Math.min(ratioWidth, ratioHeight);

        mapDisplay.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`);

        countryMap.style.transform = `translate(${transX}px, ${transY}px)`;

        countryMap.setAttribute('stroke-width', 2 / strokeRatio);
        paths.forEach((path) => {
          path.style.fill = dimFill;
        });
      }
    }
  }, 150);

  countrySelector.addEventListener('scroll', () => {
    countrySelectroChange();
  });
};

const isInt = (n) => {
  return Number(n) === n && n % 1 === 0;
};

const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

const mobileAndTabletCheck = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

const chechMobile = () => {
  const bd = document.querySelector('body');

  if (mobileAndTabletCheck()) {
    bd.classList.add('is-mobile');
  } else {
    bd.classList.remove('is-mobile');
  }
};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const _ = (string) => {
  return translations[lang][string] || string;
};

window.addEventListener('resize', () => chechMobile());
