'use strict';

function getSchedule(data) {
  let schedule = Array(24).fill([]);
  let devices = data.devices.sort(_comparareDevices);
  let rates = data.rates;
  let powers = Array(24).fill(data.maxPower);
  let prices = Array(24).fill(0);


  for (let key in rates) {
    let from = rates[key].from;
    let to = rates[key].to;

    if ((to - from) > 0) {
      prices.fill(rates[key].value, from, to);
    }
    else {
      prices.fill(rates[key].value, from, 24);
      prices.fill(rates[key].value, 0, to);
    }
  }

  function _comparareDevices(obj1, obj2) {
    return (obj2.duration - obj1.duration)||(_weightMode(obj2.mode) - _weightMode(obj1.mode))||(obj2.power - obj1.power);
  }

  function _weightMode(mode) {
      switch (mode) {
      case 'day':
        return 2;
      case 'night':
        return 1;
      default:
      return 0;
    }
  }
}
