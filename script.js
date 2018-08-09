'use strict';

function getSchedule(data) {
  let devices = data.devices.sort(_comparareDevices);
  let rates = data.rates;
  let maxPower = data.maxPower;

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
