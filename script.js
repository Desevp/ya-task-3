'use strict';

function getSchedule(data) {
  let schedule = Array(24).fill([]);
  let devices = data.devices.sort(_comparareDevices);
  let rates = data.rates;
  let powers = Array(24).fill(data.maxPower);
  let prices = Array(24).fill(0);

  // Заполняем почасовую цену

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

  console.log(schedule);
  console.log(devices);
  console.log(prices);
  console.log(powers);

  // Распеределяем приборы

  for (let item in devices) {
    let id = devices[item].id;
    let duration = devices[item].duration;
    let mode = devices[item].mode;
    let power = devices[item].power;
    console.log(id);
    console.log(duration);
    console.log(mode);

    console.log(Math.round(findMinAverage(prices, duration)[1]*power/1000 * 10000)/10000);
  }

  function findMinAverage(nums, k) {
    var curr_min = 0;
    for (var i = 0; i < k; i++) {
      curr_min += nums[i];
    }

    var max_so_far = curr_min;
    var begin_index = 0;

    for (var j = k; j < nums.length + k - 1; j++) {
      if (j < nums.length) {
        curr_min += (nums[j] - nums[j - k]);

      } else {
        curr_min += (nums[j - nums.length] - nums[j - k]);
      }


      if (curr_min < max_so_far) {
        max_so_far = curr_min;
        begin_index = j - k + 1;
      }

    }
    return [begin_index, max_so_far];
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
